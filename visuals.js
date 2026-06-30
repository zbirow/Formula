import { formatNumber } from "./engine.js";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const positive = (value, fallback = 1) => Number.isFinite(value) && Math.abs(value) > 1e-12 ? Math.abs(value) : fallback;
let visualLanguage = "en";

export function setVisualLanguage(language) { visualLanguage = language === "pl" ? "pl" : "en"; }
const visualText = (english, polish) => visualLanguage === "pl" ? polish : english;

function valueLabel(value) {
  return Number.isFinite(value) ? formatNumber(value) : "?";
}

function fitDimensions(width, height, maxWidth = 156, maxHeight = 122) {
  const safeWidth = positive(width);
  const safeHeight = positive(height);
  const scale = Math.min(maxWidth / safeWidth, maxHeight / safeHeight);
  return { width: safeWidth * scale, height: safeHeight * scale, scale };
}

function point(x, y) { return { x, y }; }

function polygonCentroid(points) {
  return points.reduce((sum, current) => ({ x: sum.x + current.x / points.length, y: sum.y + current.y / points.length }), { x: 0, y: 0 });
}

function edgeLabelMarkup(start, end, centroid, text, offset = 14) {
  const middle = point((start.x + end.x) / 2, (start.y + end.y) / 2);
  const dx = end.x - start.x, dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  let normal = point(-dy / length, dx / length);
  if (normal.x * (middle.x - centroid.x) + normal.y * (middle.y - centroid.y) < 0) normal = point(-normal.x, -normal.y);
  const x = clamp(middle.x + normal.x * offset, 13, 207);
  const y = clamp(middle.y + normal.y * offset, 11, 160);
  return `<text x="${x}" y="${y}" class="shape-label middle label-halo">${escapeHtml(text)}</text>`;
}

function polygonAngleMarkup(points) {
  const centroid = polygonCentroid(points);
  return points.map((current, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const previousLength = Math.hypot(previous.x - current.x, previous.y - current.y) || 1;
    const nextLength = Math.hypot(next.x - current.x, next.y - current.y) || 1;
    const u1 = point((previous.x - current.x) / previousLength, (previous.y - current.y) / previousLength);
    const u2 = point((next.x - current.x) / nextLength, (next.y - current.y) / nextLength);
    const radians = Math.acos(clamp(u1.x * u2.x + u1.y * u2.y, -1, 1));
    const radius = Math.max(4, Math.min(11, previousLength * .2, nextLength * .2));
    const arcStart = point(current.x + u1.x * radius, current.y + u1.y * radius);
    const arcEnd = point(current.x + u2.x * radius, current.y + u2.y * radius);
    let inward = point(u1.x + u2.x, u1.y + u2.y);
    const inwardLength = Math.hypot(inward.x, inward.y) || 1;
    inward = point(inward.x / inwardLength, inward.y / inwardLength);
    if (inward.x * (centroid.x - current.x) + inward.y * (centroid.y - current.y) < 0) inward = point(-inward.x, -inward.y);
    const outward = point(-inward.x, -inward.y);
    const labelDistance = radius + 7;
    const labelX = clamp(current.x + outward.x * labelDistance, 12, 208);
    const labelY = clamp(current.y + outward.y * labelDistance, 10, 161);
    const degrees = radians * 180 / Math.PI;
    const degreeLabel = `${Math.abs(degrees - Math.round(degrees)) < .05 ? Math.round(degrees) : degrees.toFixed(1)}°`;
    return `<path d="M${arcStart.x} ${arcStart.y}A${radius} ${radius} 0 0 1 ${arcEnd.x} ${arcEnd.y}" class="angle-arc"/><text x="${labelX}" y="${labelY}" class="angle-label">${degreeLabel}</text>`;
  }).join("");
}

function expandedRange(values, minimumSpan = 2, paddingRatio = .12) {
  const finite = values.filter(Number.isFinite);
  let min = finite.length ? Math.min(...finite) : -1;
  let max = finite.length ? Math.max(...finite) : 1;
  if (max - min < minimumSpan) {
    const center = (min + max) / 2;
    min = center - minimumSpan / 2;
    max = center + minimumSpan / 2;
  }
  const padding = (max - min) * paddingRatio;
  return [min - padding, max + padding];
}

function chartDefinition(type, values) {
  let currentX = values.x ?? values.angle ?? 1;
  let xMin = -5;
  let xMax = 5;
  let fn;
  let equation;
  const keyXs = [0, currentX];

  if (type === "plot-projectile") {
    const range = Math.max(.01, values.velocity ** 2 * Math.sin(2 * values.angle) / values.gravity);
    xMin = 0; xMax = range; currentX = range / 2;
    fn = (x) => x * Math.tan(values.angle) - values.gravity * x ** 2 / (2 * values.velocity ** 2 * Math.cos(values.angle) ** 2);
    equation = visualText("projectile trajectory", "trajektoria rzutu");
  } else if (type === "plot-wave") {
    xMin = 0; xMax = Math.max(.01, values.wavelength * 2); currentX = values.wavelength;
    fn = (x) => Math.sin(2 * Math.PI * x / values.wavelength);
    equation = visualText("sine wave", "fala sinusoidalna");
  } else if (type === "plot-quadratic") {
    fn = (x) => values.a * x ** 2 + values.b * x + values.c;
    equation = visualText("parabola", "parabola");
    if (values.a !== 0) {
      const vertexX = -values.b / (2 * values.a);
      keyXs.push(vertexX);
      const discriminant = values.b ** 2 - 4 * values.a * values.c;
      if (discriminant >= 0) keyXs.push((-values.b - Math.sqrt(discriminant)) / (2 * values.a), (-values.b + Math.sqrt(discriminant)) / (2 * values.a));
    }
    [xMin, xMax] = expandedRange(keyXs, 4, .22);
  } else if (type === "plot-linear") {
    fn = (x) => values.slope * x + values.offset;
    equation = visualText("line", "prosta");
    if (values.slope !== 0) keyXs.push(-values.offset / values.slope);
    [xMin, xMax] = expandedRange(keyXs, 6, .18);
  } else if (type === "plot-exponential") {
    fn = (x) => values.scale * values.base ** x;
    equation = visualText("exponential growth", "wzrost wykładniczy");
    [xMin, xMax] = expandedRange([0, currentX, -2, 2], 5, .12);
  } else {
    xMin = -Math.PI * 2; xMax = Math.PI * 2;
    fn = type === "plot-cosine" ? Math.cos : Math.sin;
    equation = type === "plot-cosine" ? visualText("cosine", "cosinus") : visualText("sine", "sinus");
  }
  return { xMin, xMax, currentX, fn, equation };
}

function chartSvg(type, values) {
  const { xMin, xMax, currentX, fn, equation } = chartDefinition(type, values);
  const samples = Array.from({ length: 161 }, (_, index) => {
    const x = xMin + (xMax - xMin) * index / 160;
    return { x, y: fn(x) };
  }).filter((point) => Number.isFinite(point.y));
  const markerX = clamp(currentX, xMin, xMax);
  const markerY = fn(markerX);
  const [yMin, yMax] = expandedRange([...samples.map((point) => point.y), 0, markerY], type.includes("sine") || type.includes("cosine") || type === "plot-wave" ? 2 : 1, .1);

  const left = 31, right = 214, top = 24, bottom = 207;
  const sx = (x) => left + (x - xMin) / (xMax - xMin) * (right - left);
  const sy = (y) => bottom - (y - yMin) / (yMax - yMin) * (bottom - top);
  const path = samples.map((point, index) => `${index ? "L" : "M"}${sx(point.x).toFixed(2)},${sy(point.y).toFixed(2)}`).join(" ");
  const xAxis = sy(0);
  const yAxis = sx(0);
  const grid = [1, 2, 3].map((step) => {
    const x = left + (right - left) * step / 4;
    const y = top + (bottom - top) * step / 4;
    return `M${x} ${top}V${bottom} M${left} ${y}H${right}`;
  }).join(" ");
  let extras = "";
  if (type === "plot-quadratic" && values.a !== 0) {
    const discriminant = values.b ** 2 - 4 * values.a * values.c;
    if (discriminant >= 0) {
      const roots = [(-values.b - Math.sqrt(discriminant)) / (2 * values.a), (-values.b + Math.sqrt(discriminant)) / (2 * values.a)];
      extras += roots.filter((root) => root >= xMin && root <= xMax).map((root) => `<circle cx="${sx(root)}" cy="${sy(0)}" r="4" class="chart-root"/>`).join("");
    }
    const vertexX = -values.b / (2 * values.a);
    extras += `<circle cx="${sx(vertexX)}" cy="${sy(fn(vertexX))}" r="4" class="chart-vertex"/>`;
  }
  const rangeText = `x: ${valueLabel(xMin)}…${valueLabel(xMax)} · y: ${valueLabel(yMin)}…${valueLabel(yMax)}`;
  return `<svg viewBox="0 0 238 238" data-scale-mode="auto" role="img" aria-label="Wykres: ${escapeHtml(equation)}">
    <rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" rx="3" class="chart-frame"/>
    <g class="chart-grid"><path d="${grid}"/></g>
    ${xAxis >= top && xAxis <= bottom ? `<path class="chart-axis" d="M${left} ${xAxis}H${right}"/>` : ""}
    ${yAxis >= left && yAxis <= right ? `<path class="chart-axis" d="M${yAxis} ${top}V${bottom}"/>` : ""}
    <path class="chart-line" d="${path}"/>
    ${extras}
    ${Number.isFinite(markerY) ? `<line class="chart-guide" x1="${sx(markerX)}" y1="${clamp(xAxis, top, bottom)}" x2="${sx(markerX)}" y2="${sy(markerY)}"/><circle class="chart-point" cx="${sx(markerX)}" cy="${sy(markerY)}" r="4.5"/>` : ""}
    <text class="chart-label" x="${left}" y="15">${escapeHtml(equation)}</text>
    <text class="chart-range" x="${right}" y="15">${escapeHtml(rangeText)}</text>
    <text class="chart-tick" x="${left}" y="220">${valueLabel(xMin)}</text><text class="chart-tick end" x="${right}" y="220">${valueLabel(xMax)}</text>
    <text class="chart-tick" x="3" y="${top + 3}">${valueLabel(yMax)}</text><text class="chart-tick" x="3" y="${bottom}">${valueLabel(yMin)}</text>
  </svg>`;
}

function triangleFromSides(values, fillClass) {
  const sideA = positive(values.a, 3), sideB = positive(values.b, 4), sideC = positive(values.c, 5);
  const apexX = clamp((sideB ** 2 + sideC ** 2 - sideA ** 2) / (2 * sideC), 0, sideC);
  const apexY = Math.sqrt(Math.max(0, sideB ** 2 - apexX ** 2));
  const fitted = fitDimensions(sideC, apexY || 1);
  const x = 110 - fitted.width / 2, baseY = 145;
  const px = x + apexX * fitted.scale, py = baseY - apexY * fitted.scale;
  const points = [point(x, baseY), point(px, py), point(x + fitted.width, baseY)];
  const centroid = polygonCentroid(points);
  return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Trójkąt w rzeczywistych proporcjach"><path d="M${x} ${baseY}L${px} ${py}L${x + fitted.width} ${baseY}Z" class="${fillClass}"/>${polygonAngleMarkup(points)}${edgeLabelMarkup(points[0], points[1], centroid, `b=${valueLabel(values.b)}`)}${edgeLabelMarkup(points[1], points[2], centroid, `a=${valueLabel(values.a)}`)}${edgeLabelMarkup(points[2], points[0], centroid, `c=${valueLabel(values.c)}`)}</svg>`;
}

function shapeSvg(type, values, mode) {
  const fillClass = mode === "surface" ? "shape-surface" : mode === "perimeter" ? "shape-perimeter" : "shape-fill";
  const rValue = positive(values.radius, 3);
  const aValue = positive(values.a ?? values.side ?? values.base, 4);
  const bValue = positive(values.b ?? values.height, 2.5);
  const r = valueLabel(values.radius);
  const a = valueLabel(values.a ?? values.side ?? values.base);
  const b = valueLabel(values.b ?? values.height);
  switch (type) {
    case "circle":
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Koło"><circle cx="110" cy="82" r="58" class="${fillClass}"/><line x1="110" y1="82" x2="168" y2="82" class="shape-measure"/><text x="132" y="75" class="shape-label">r=${r}</text><circle cx="110" cy="82" r="2" class="shape-point"/></svg>`;
    case "sector": {
      const angle = clamp(values.angle, .05, Math.PI * 1.98);
      const radius = 59, cx = 89, cy = 105;
      const ex = cx + radius * Math.cos(-angle), ey = cy + radius * Math.sin(-angle);
      const large = angle > Math.PI ? 1 : 0;
      const degrees = angle * 180 / Math.PI;
      const angleText = `${valueLabel(values.angle)} rad · ${valueLabel(degrees)}°`;
      const arcRadius = 18, ax = cx + arcRadius * Math.cos(-angle), ay = cy + arcRadius * Math.sin(-angle);
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Wycinek koła"><path d="M${cx} ${cy}L${cx + radius} ${cy}A${radius} ${radius} 0 ${large} 0 ${ex} ${ey}Z" class="${fillClass}"/><path d="M${cx + arcRadius} ${cy}A${arcRadius} ${arcRadius} 0 ${large} 0 ${ax} ${ay}" class="angle-arc"/><text x="110" y="18" class="angle-label">α=${angleText}</text><text x="155" y="123" class="shape-label middle label-halo">r=${r}</text></svg>`;
    }
    case "rectangle": {
      const fitted = fitDimensions(aValue, bValue);
      const x = 110 - fitted.width / 2, y = 82 - fitted.height / 2;
      const points = [point(x, y), point(x + fitted.width, y), point(x + fitted.width, y + fitted.height), point(x, y + fitted.height)];
      const centroid = polygonCentroid(points);
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Prostokąt w rzeczywistych proporcjach"><rect x="${x}" y="${y}" width="${fitted.width}" height="${fitted.height}" rx="2" class="${fillClass}"/>${polygonAngleMarkup(points)}${edgeLabelMarkup(points[2], points[3], centroid, `a=${a}`)}${edgeLabelMarkup(points[1], points[2], centroid, `b=${b}`)}</svg>`;
    }
    case "square": {
      const side = 118;
      const points = [point(51, 22), point(169, 22), point(169, 140), point(51, 140)];
      const centroid = polygonCentroid(points);
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Kwadrat"><rect x="51" y="22" width="${side}" height="${side}" rx="2" class="${fillClass}"/>${polygonAngleMarkup(points)}${edgeLabelMarkup(points[2], points[3], centroid, `a=${a}`)}</svg>`;
    }
    case "triangle": {
      if (Number.isFinite(values.c) && !Number.isFinite(values.height)) return triangleFromSides(values, fillClass);
      const fitted = fitDimensions(aValue, positive(values.height, 3));
      const x = 110 - fitted.width / 2, baseY = 145, apexX = x + fitted.width / 2, apexY = baseY - fitted.height;
      const points = [point(x, baseY), point(apexX, apexY), point(x + fitted.width, baseY)];
      const centroid = polygonCentroid(points);
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Trójkąt w rzeczywistych proporcjach"><path d="M${x} ${baseY}L${apexX} ${apexY}L${x + fitted.width} ${baseY}Z" class="${fillClass}"/><line x1="${apexX}" y1="${apexY}" x2="${apexX}" y2="${baseY}" class="shape-measure"/>${polygonAngleMarkup(points)}${edgeLabelMarkup(points[2], points[0], centroid, `a=${a}`)}<text x="${apexX + 7}" y="${(baseY + apexY) / 2}" class="shape-label label-halo">h=${valueLabel(values.height)}</text></svg>`;
    }
    case "right-triangle": {
      const fitted = fitDimensions(bValue, aValue);
      const x = 110 - fitted.width / 2, baseY = 145, topY = baseY - fitted.height;
      const marker = Math.min(10, fitted.width * .22, fitted.height * .22);
      const points = [point(x, baseY), point(x, topY), point(x + fitted.width, baseY)];
      const centroid = polygonCentroid(points);
      const hypotenuse = Number.isFinite(values.c) ? values.c : Math.hypot(aValue, bValue);
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Trójkąt prostokątny w proporcji a do b"><path d="M${x} ${baseY}L${x} ${topY}L${x + fitted.width} ${baseY}Z" class="${fillClass}"/><path d="M${x} ${baseY - marker}H${x + marker}V${baseY}" class="shape-measure"/>${polygonAngleMarkup(points)}${edgeLabelMarkup(points[0], points[1], centroid, `a=${a}`)}${edgeLabelMarkup(points[2], points[0], centroid, `b=${b}`)}${edgeLabelMarkup(points[1], points[2], centroid, `c=${valueLabel(hypotenuse)}`)}</svg>`;
    }
    case "parallelogram": {
      const fitted = fitDimensions(aValue, positive(values.height, 2.5), 135, 118);
      const skew = Math.min(32, fitted.width * .24);
      const x = 110 - (fitted.width + skew) / 2, baseY = 145, topY = baseY - fitted.height;
      const points = [point(x, baseY), point(x + skew, topY), point(x + skew + fitted.width, topY), point(x + fitted.width, baseY)];
      const centroid = polygonCentroid(points);
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Równoległobok w rzeczywistych proporcjach"><path d="M${x} ${baseY}L${x + skew} ${topY}H${x + skew + fitted.width}L${x + fitted.width} ${baseY}Z" class="${fillClass}"/><line x1="${x + skew}" y1="${topY}" x2="${x + skew}" y2="${baseY}" class="shape-measure"/>${polygonAngleMarkup(points)}${edgeLabelMarkup(points[3], points[0], centroid, `a=${a}`)}<text x="${x + skew + 7}" y="${(baseY + topY) / 2}" class="shape-label label-halo">h=${valueLabel(values.height)}</text></svg>`;
    }
    case "trapezoid": {
      const baseA = positive(values.a, 5), baseB = positive(values.b, 3), height = positive(values.height, 2.5);
      const fitted = fitDimensions(Math.max(baseA, baseB), height);
      const scale = fitted.scale, widthA = baseA * scale, widthB = baseB * scale;
      const xA = 110 - widthA / 2, xB = 110 - widthB / 2, baseY = 145, topY = baseY - fitted.height;
      const points = [point(xA, baseY), point(xB, topY), point(xB + widthB, topY), point(xA + widthA, baseY)];
      const centroid = polygonCentroid(points);
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Trapez w rzeczywistych proporcjach"><path d="M${xA} ${baseY}L${xB} ${topY}H${xB + widthB}L${xA + widthA} ${baseY}Z" class="${fillClass}"/><line x1="${xB}" y1="${topY}" x2="${xB}" y2="${baseY}" class="shape-measure"/>${polygonAngleMarkup(points)}${edgeLabelMarkup(points[1], points[2], centroid, `b=${b}`)}${edgeLabelMarkup(points[3], points[0], centroid, `a=${a}`)}<text x="${xB + 7}" y="${(baseY + topY) / 2}" class="shape-label label-halo">h=${valueLabel(values.height)}</text></svg>`;
    }
    case "ellipse": {
      const fitted = fitDimensions(aValue * 2, bValue * 2);
      const rx = fitted.width / 2, ry = fitted.height / 2;
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Elipsa w rzeczywistych proporcjach"><ellipse cx="110" cy="82" rx="${rx}" ry="${ry}" class="${fillClass}"/><line x1="110" y1="82" x2="${110 + rx}" y2="82" class="shape-measure"/><line x1="110" y1="82" x2="110" y2="${82 - ry}" class="shape-measure"/><text x="${110 + rx / 2}" y="75" class="shape-label">a=${a}</text><text x="115" y="${82 - ry / 2}" class="shape-label">b=${b}</text></svg>`;
    }
    case "sphere":
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Kula 3D"><circle cx="110" cy="82" r="60" class="${fillClass}"/><ellipse cx="110" cy="82" rx="60" ry="19" class="shape-wire"/><path d="M110 22C84 47 84 117 110 142M110 22C136 47 136 117 110 142" class="shape-wire"/><line x1="110" y1="82" x2="170" y2="82" class="shape-measure"/><text x="135" y="75" class="shape-label">r=${r}</text><text x="188" y="21" class="shape-3d">3D</text></svg>`;
    case "cube": {
      const side = 94, depthX = 31, depthY = 20, x = 48, y = 45;
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Sześcian 3D"><path d="M${x} ${y}H${x + side}L${x + side + depthX} ${y - depthY}H${x + depthX}Z M${x + side} ${y}V${y + side}L${x + side + depthX} ${y + side - depthY}V${y - depthY} M${x} ${y}V${y + side}H${x + side}" class="${fillClass}"/><path d="M${x} ${y}L${x + depthX} ${y - depthY}M${x} ${y + side}L${x + depthX} ${y + side - depthY}H${x + side + depthX}" class="shape-wire"/><text x="98" y="158" class="shape-label">a=${a}</text><text x="190" y="22" class="shape-3d">3D</text></svg>`;
    }
    case "cuboid": {
      const length = positive(values.a, 4), depth = positive(values.b, 3), height = positive(values.c, 2);
      const projectedW = length + depth * .55, projectedH = height + depth * .32;
      const scale = Math.min(160 / projectedW, 120 / projectedH);
      const w = length * scale, h = height * scale, dx = depth * .55 * scale, dy = depth * .32 * scale;
      const x = 110 - (w + dx) / 2, y = 145 - h;
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Prostopadłościan w proporcjach a b c"><path d="M${x} ${y}H${x + w}L${x + w + dx} ${y - dy}H${x + dx}Z M${x + w} ${y}V${y + h}L${x + w + dx} ${y + h - dy}V${y - dy} M${x} ${y}V${y + h}H${x + w}" class="${fillClass}"/><path d="M${x} ${y}L${x + dx} ${y - dy}M${x} ${y + h}L${x + dx} ${y + h - dy}H${x + w + dx}" class="shape-wire"/><text x="${x + w / 2}" y="162" class="shape-label middle">a=${valueLabel(values.a)}</text><text x="${x + w + dx + 4}" y="${y + h / 2}" class="shape-label">c=${valueLabel(values.c)}</text><text x="188" y="20" class="shape-3d">3D</text></svg>`;
    }
    case "cylinder": {
      const height = positive(values.height, 4), diameter = rValue * 2;
      const ellipseFactor = .22;
      const scale = Math.min(150 / diameter, 116 / (height + diameter * ellipseFactor));
      const width = diameter * scale, bodyHeight = height * scale, ellipseRy = diameter * ellipseFactor * scale;
      const cx = 110, topY = 24 + ellipseRy, bottomY = topY + bodyHeight;
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Walec w proporcji średnicy do wysokości"><path d="M${cx - width / 2} ${topY}V${bottomY}C${cx - width / 2} ${bottomY + ellipseRy} ${cx + width / 2} ${bottomY + ellipseRy} ${cx + width / 2} ${bottomY}V${topY}" class="${fillClass}"/><ellipse cx="${cx}" cy="${topY}" rx="${width / 2}" ry="${ellipseRy}" class="shape-top"/><ellipse cx="${cx}" cy="${bottomY}" rx="${width / 2}" ry="${ellipseRy}" class="shape-wire"/><line x1="${cx}" y1="${topY}" x2="${cx + width / 2}" y2="${topY}" class="shape-measure"/><text x="${cx + width / 4}" y="${topY - 7}" class="shape-label">r=${r}</text><text x="${cx + width / 2 + 5}" y="${topY + bodyHeight / 2}" class="shape-label">h=${valueLabel(values.height)}</text><text x="190" y="20" class="shape-3d">3D</text></svg>`;
    }
    case "cone": {
      const height = positive(values.height ?? Math.sqrt(Math.max(0, positive(values.slant, 4.5) ** 2 - rValue ** 2)), 4);
      const diameter = rValue * 2, scale = Math.min(150 / diameter, 124 / (height + diameter * .15));
      const width = diameter * scale, bodyHeight = height * scale, ellipseRy = diameter * .15 * scale;
      const cx = 110, apexY = 20, baseY = apexY + bodyHeight;
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Stożek w proporcji średnicy do wysokości"><path d="M${cx} ${apexY}L${cx - width / 2} ${baseY}C${cx - width / 2} ${baseY + ellipseRy} ${cx + width / 2} ${baseY + ellipseRy} ${cx + width / 2} ${baseY}Z" class="${fillClass}"/><ellipse cx="${cx}" cy="${baseY}" rx="${width / 2}" ry="${ellipseRy}" class="shape-wire"/><line x1="${cx}" y1="${apexY}" x2="${cx}" y2="${baseY}" class="shape-measure"/><text x="${cx + 5}" y="${apexY + bodyHeight / 2}" class="shape-label">h=${valueLabel(values.height ?? values.slant)}</text><text x="190" y="20" class="shape-3d">3D</text></svg>`;
    }
    case "pyramid": {
      const side = Math.sqrt(positive(values.baseArea, 9)), height = positive(values.height, 4);
      const projectedW = side * 1.35, projectedH = height + side * .25, scale = Math.min(156 / projectedW, 124 / projectedH);
      const w = side * scale, dx = side * .35 * scale, dy = side * .25 * scale, h = height * scale;
      const cx = 110, baseY = 145, apexY = baseY - h - dy / 2;
      return `<svg viewBox="0 0 220 170" data-scale-mode="proportional" role="img" aria-label="Ostrosłup w proporcji podstawy do wysokości"><path d="M${cx} ${apexY}L${cx - w / 2} ${baseY - dy}L${cx + dx} ${baseY}L${cx + w / 2} ${baseY - dy}Z" class="${fillClass}"/><path d="M${cx} ${apexY}L${cx + dx} ${baseY}M${cx - w / 2} ${baseY - dy}L${cx + w / 2} ${baseY - dy}M${cx} ${apexY}V${baseY - dy / 2}" class="shape-wire"/><text x="${cx + 5}" y="${(apexY + baseY) / 2}" class="shape-label">h=${valueLabel(values.height)}</text><text x="190" y="20" class="shape-3d">3D</text></svg>`;
    }
    default: return "";
  }
}

export function renderFormulaVisual(formula, result) {
  const visual = formula.visualization;
  if (!visual) return "";
  const liveValues = result?.inputs || {};
  const resultValue = result?.outputs?.[formula.output.id];
  const values = { ...(visual.defaults || {}), ...liveValues };
  if (Number.isFinite(resultValue)) {
    values[formula.output.id] = resultValue;
    values[formula.output.symbol] = resultValue;
  }
  const isLive = formula.inputs.every((port) => typeof liveValues[port.id] === "number");
  const isPlot = visual.type.startsWith("plot-");
  const svg = isPlot ? chartSvg(visual.type, values) : shapeSvg(visual.type, values, visual.mode);
  const modeLabel = visualLanguage === "pl"
    ? ({ area: "POLE", volume: "OBJĘTOŚĆ", surface: "POWIERZCHNIA", perimeter: "OBWÓD", length: "DŁUGOŚĆ" })[visual.mode] || "WYKRES"
    : ({ area: "AREA", volume: "VOLUME", surface: "SURFACE", perimeter: "PERIMETER", length: "LENGTH" })[visual.mode] || "PLOT";
  return `<div class="node-visual ${isPlot ? "plot" : "shape"} ${isLive ? "live" : "preview"}" data-scale-mode="${isPlot ? "auto" : "proportional"}">
    <div class="visual-topline"><span>${modeLabel}</span><span>${isPlot ? visualText("AUTO SCALE", "AUTOSKALA") : visualText("PROPORTIONS", "PROPORCJE")}</span><span>${isLive ? visualText("GRAPH DATA", "DANE Z GRAFU") : visualText("MODEL PREVIEW", "PODGLĄD MODELU")}</span></div>
    ${svg}
    <div class="visual-result"><span>${escapeHtml(formula.output.symbol)}</span><strong>${isLive && Number.isFinite(resultValue) ? `${formatNumber(resultValue)}${formula.output.unit ? ` ${escapeHtml(formula.output.unit)}` : ""}` : visualText("connect dimensions", "podłącz wymiary")}</strong></div>
  </div>`;
}
