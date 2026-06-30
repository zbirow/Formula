const FUNCTIONS = {
  sqrt: Math.sqrt,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  abs: Math.abs,
  log: Math.log10,
  ln: Math.log,
  exp: Math.exp,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  factorial: (value) => {
    if (!Number.isInteger(value) || value < 0 || value > 170) throw new Error("Silnia wymaga liczby całkowitej od 0 do 170.");
    let result = 1;
    for (let number = 2; number <= value; number += 1) result *= number;
    return result;
  }
};

function tokenize(source) {
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const rest = source.slice(index);
    const whitespace = rest.match(/^\s+/);
    if (whitespace) { index += whitespace[0].length; continue; }
    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    if (number) { tokens.push({ type: "number", value: Number(number[0]) }); index += number[0].length; continue; }
    const identifier = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (identifier) { tokens.push({ type: "identifier", value: identifier[0] }); index += identifier[0].length; continue; }
    const char = source[index];
    if ("+-*/^(),".includes(char)) { tokens.push({ type: char, value: char }); index += 1; continue; }
    throw new Error(`Nieznany znak „${char}” na pozycji ${index + 1}.`);
  }
  tokens.push({ type: "eof" });
  return tokens;
}

export function evaluateExpression(source, variables = {}) {
  const tokens = tokenize(source);
  let position = 0;
  const peek = () => tokens[position];
  const take = (type) => {
    const token = tokens[position];
    if (token.type !== type) throw new Error(`Oczekiwano „${type}”, znaleziono „${token.value ?? token.type}”.`);
    position += 1;
    return token;
  };

  const parsePrimary = () => {
    if (peek().type === "number") return take("number").value;
    if (peek().type === "(") {
      take("(");
      const value = parseAdditive();
      take(")");
      return value;
    }
    if (peek().type === "identifier") {
      const name = take("identifier").value;
      if (peek().type === "(") {
        take("(");
        const args = [];
        if (peek().type !== ")") {
          args.push(parseAdditive());
          while (peek().type === ",") { take(","); args.push(parseAdditive()); }
        }
        take(")");
        if (!FUNCTIONS[name]) throw new Error(`Nieznana funkcja „${name}”.`);
        return FUNCTIONS[name](...args);
      }
      if (name === "pi") return Math.PI;
      if (name === "e") return Math.E;
      if (!Object.prototype.hasOwnProperty.call(variables, name)) throw new Error(`Brak wartości wejścia „${name}”.`);
      return Number(variables[name]);
    }
    throw new Error(`Nieoczekiwany element „${peek().value ?? peek().type}”.`);
  };

  const parsePower = () => {
    const base = parsePrimary();
    return peek().type === "^" ? (take("^"), base ** parseUnary()) : base;
  };
  const parseUnary = () => {
    if (peek().type === "+") { take("+"); return parseUnary(); }
    if (peek().type === "-") { take("-"); return -parseUnary(); }
    return parsePower();
  };
  const parseMultiplicative = () => {
    let value = parseUnary();
    while (peek().type === "*" || peek().type === "/") {
      const operator = tokens[position++].type;
      const right = parseUnary();
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  };
  const parseAdditive = () => {
    let value = parseMultiplicative();
    while (peek().type === "+" || peek().type === "-") {
      const operator = tokens[position++].type;
      const right = parseMultiplicative();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };

  const result = parseAdditive();
  take("eof");
  if (!Number.isFinite(result)) throw new Error("Wynik nie jest skończoną liczbą.");
  return result;
}

export function validateExpression(expression, inputIds) {
  const probe = Object.fromEntries(inputIds.map((id, index) => [id, index + 2]));
  return evaluateExpression(expression, probe);
}

export function evaluateGraph(nodes, edges, formulaMap) {
  const results = new Map();
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const incoming = new Map();
  for (const edge of edges) incoming.set(`${edge.targetNodeId}::${edge.targetPortId}`, edge);

  for (const node of nodes) {
    if (node.type !== "value") continue;
    const value = Number(node.value);
    results.set(node.id, Number.isFinite(value)
      ? { ready: true, inputs: {}, outputs: { value }, error: null }
      : { ready: false, inputs: {}, outputs: {}, error: "Wpisz poprawną liczbę." });
  }

  for (let pass = 0; pass < nodes.length + 1; pass += 1) {
    let progressed = false;
    for (const node of nodes) {
      if ((node.type !== "formula" && node.type !== "result") || results.get(node.id)?.ready) continue;
      if (node.type === "result") {
        const edge = incoming.get(`${node.id}::input`);
        if (!edge) continue;
        const value = results.get(edge.sourceNodeId)?.outputs?.[edge.sourcePortId];
        if (typeof value !== "number") continue;
        results.set(node.id, { ready: true, inputs: { input: value }, outputs: { result: value }, error: null });
        progressed = true;
        continue;
      }
      const formula = formulaMap.get(node.formulaId);
      if (!formula) {
        results.set(node.id, { ready: false, inputs: {}, outputs: {}, error: "Brak definicji wzoru." });
        continue;
      }
      const values = {};
      let allReady = true;
      for (const port of formula.inputs) {
        const edge = incoming.get(`${node.id}::${port.id}`);
        const source = edge ? results.get(edge.sourceNodeId) : null;
        const value = source?.outputs?.[edge?.sourcePortId];
        if (typeof value !== "number") allReady = false;
        else values[port.id] = value;
      }
      if (!allReady) continue;
      try {
        const value = evaluateExpression(formula.expression, values);
        results.set(node.id, { ready: true, inputs: values, outputs: { [formula.output.id]: value }, error: null });
      } catch (error) {
        results.set(node.id, { ready: false, inputs: values, outputs: {}, error: error.message });
      }
      progressed = true;
    }
    if (!progressed) break;
  }

  for (const node of nodes) {
    if (results.has(node.id)) continue;
    if (node.type === "result") {
      const edge = incoming.get(`${node.id}::input`);
      const value = edge ? results.get(edge.sourceNodeId)?.outputs?.[edge.sourcePortId] : undefined;
      results.set(node.id, { ready: false, inputs: typeof value === "number" ? { input: value } : {}, outputs: {}, error: null });
      continue;
    }
    const formula = formulaMap.get(node.formulaId);
    const inputValues = {};
    for (const port of formula?.inputs || []) {
      const edge = incoming.get(`${node.id}::${port.id}`);
      const source = edge ? results.get(edge.sourceNodeId) : null;
      const value = source?.outputs?.[edge?.sourcePortId];
      if (typeof value === "number") inputValues[port.id] = value;
    }
    results.set(node.id, { ready: false, inputs: inputValues, outputs: {}, error: null });
  }

  return { results, incoming, nodeMap, cycleNodes: findCycleNodes(nodes, edges) };
}

export function findCycleNodes(nodes, edges) {
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  edges.forEach((edge) => adjacency.get(edge.sourceNodeId)?.push(edge.targetNodeId));
  const visiting = new Set();
  const visited = new Set();
  const cycles = new Set();
  const stack = [];

  const visit = (id) => {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      stack.slice(start).forEach((nodeId) => cycles.add(nodeId));
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id); stack.push(id);
    for (const next of adjacency.get(id) || []) visit(next);
    stack.pop(); visiting.delete(id); visited.add(id);
  };
  nodes.forEach((node) => visit(node.id));
  return cycles;
}

let numberLocale = "en-US";

export function setNumberLocale(locale) {
  numberLocale = locale || "en-US";
}

function decimalPlaces(value) {
  const [coefficient, exponentText] = Math.abs(value).toString().toLowerCase().split("e");
  const coefficientDecimals = coefficient.split(".")[1]?.length || 0;
  const exponent = Number(exponentText || 0);
  return Math.max(0, coefficientDecimals - exponent);
}

export function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const absolute = Math.abs(value);
  const hasMore = decimalPlaces(value) > 10;
  if ((absolute !== 0 && absolute < 1e-9) || absolute >= 1e12) {
    const [coefficient, exponent] = value.toExponential(10).split("e");
    const cleaned = coefficient.replace(/0+$/, "").replace(/\.$/, "");
    const localized = numberLocale.startsWith("pl") ? cleaned.replace(".", ",") : cleaned;
    return `${localized}${hasMore ? "..." : ""}e${exponent}`;
  }
  const formatted = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 10 }).format(value);
  return formatted + (hasMore ? "..." : "");
}

export function numberForClipboard(value) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

export function portIdentity(nodeId, portId) {
  return `${nodeId}::${portId}`;
}
