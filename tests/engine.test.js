import test from "node:test";
import assert from "node:assert/strict";
import { evaluateExpression, evaluateGraph, findCycleNodes, formatNumber, numberForClipboard, setNumberLocale } from "../engine.js";
import { BASE_FORMULAS } from "../catalog.js";
import { renderFormulaVisual } from "../visuals.js";

test("silnik zachowuje kolejność działań i potęgowanie", () => {
  assert.equal(evaluateExpression("2 + 3 * 4"), 14);
  assert.equal(evaluateExpression("2 ^ 3 ^ 2"), 512);
  assert.equal(evaluateExpression("-2 ^ 2"), -4);
});

test("silnik obsługuje zmienne, stałe i funkcje", () => {
  assert.equal(evaluateExpression("sqrt(a ^ 2 + b ^ 2)", { a: 3, b: 4 }), 5);
  assert.ok(Math.abs(evaluateExpression("2 * pi") - 2 * Math.PI) < 1e-12);
});

test("graf liczy tylko po jawnych połączeniach portów", () => {
  const formulas = new Map([
    ["difference", { id: "difference", inputs: [{ id: "a" }, { id: "c" }], output: { id: "result" }, expression: "a - c" }],
    ["work", { id: "work", inputs: [{ id: "force" }, { id: "distance" }], output: { id: "result" }, expression: "force * distance" }]
  ]);
  const nodes = [
    { id: "a", type: "value", value: 12 }, { id: "c", type: "value", value: 5 }, { id: "s", type: "value", value: 3 },
    { id: "difference-1", type: "formula", formulaId: "difference" }, { id: "work-1", type: "formula", formulaId: "work" }
  ];
  const edges = [
    { sourceNodeId: "a", sourcePortId: "value", targetNodeId: "difference-1", targetPortId: "a" },
    { sourceNodeId: "c", sourcePortId: "value", targetNodeId: "difference-1", targetPortId: "c" },
    { sourceNodeId: "difference-1", sourcePortId: "result", targetNodeId: "work-1", targetPortId: "force" },
    { sourceNodeId: "s", sourcePortId: "value", targetNodeId: "work-1", targetPortId: "distance" }
  ];
  const { results } = evaluateGraph(nodes, edges, formulas);
  assert.equal(results.get("difference-1").outputs.result, 7);
  assert.equal(results.get("work-1").outputs.result, 21);
});

test("cykle zależności są wykrywane", () => {
  const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const edges = [
    { sourceNodeId: "a", targetNodeId: "b" },
    { sourceNodeId: "b", targetNodeId: "c" },
    { sourceNodeId: "c", targetNodeId: "a" }
  ];
  assert.deepEqual([...findCycleNodes(nodes, edges)].sort(), ["a", "b", "c"]);
});

test("rozszerzone funkcje matematyczne działają", () => {
  assert.equal(evaluateExpression("factorial(n)", { n: 6 }), 720);
  assert.ok(Math.abs(evaluateExpression("asin(0.5)") - Math.PI / 6) < 1e-12);
});

test("katalog ma unikalne definicje i wszystkie wzory są obliczalne", () => {
  const ids = BASE_FORMULAS.map((formula) => formula.id);
  assert.equal(new Set(ids).size, ids.length);
  const samples = {
    n: 5, k: 2, base: 2, ratio: 0.5, p: 0.4, pA: 0.4, pB: 0.3, pBoth: 0.1,
    p1: 0.4, p2: 0.6, stddev: 1, cold: 300, hot: 600, angle: 0.5, angle1: 0.4,
    gamma: 0.5, alpha: 0.6, beta: 0.8, x1: 1, x2: 3, f1: 2, f2: 4,
    xStart: 1, xEnd: 3, focus: 1, objectDistance: 2, n1: 1, n2: 1.5,
    delta: 4, whole: 4, reference: 1e-12, intensity: 1e-6, G: 6.6743e-11,
    ke: 8.987e9, R: 8.314, lightSpeed: 299792458, planck: 6.626e-34,
    gravity: 9.81, temperature: 300, t1: 300, t2: 330
  };
  const failures = [];
  for (const formula of BASE_FORMULAS) {
    const values = Object.fromEntries(formula.inputs.map((port) => [port.id, samples[port.id] ?? 2]));
    try { evaluateExpression(formula.expression, values); }
    catch (error) { failures.push(`${formula.id}: ${error.message}`); }
  }
  assert.deepEqual(failures, []);
});

test("wizualizacje powstają wewnątrz składnika wzoru", () => {
  const quadratic = BASE_FORMULAS.find((formula) => formula.id === "quadratic-value");
  const graph = renderFormulaVisual(quadratic, { inputs: { a: 1, b: 0, c: -4, x: 3 }, outputs: { result: 5 } });
  assert.match(graph, /<svg/);
  assert.match(graph, /chart-line/);
  assert.match(graph, /data-scale-mode="auto"/);
  assert.match(graph, /GRAPH DATA/);
  const sphere = BASE_FORMULAS.find((formula) => formula.id === "sphere-volume");
  assert.match(renderFormulaVisual(sphere, { inputs: {}, outputs: {} }), /Kula 3D/);
});

test("figury zachowują proporcje wartości wejściowych", () => {
  const pythagorean = BASE_FORMULAS.find((formula) => formula.id === "pythagorean");
  const visual = renderFormulaVisual(pythagorean, { inputs: { a: 10, b: 4 }, outputs: { result: Math.sqrt(116) } });
  assert.match(visual, /data-scale-mode="proportional"/);
  const match = visual.match(/d="M([\d.]+) 145L([\d.]+) ([\d.]+)L([\d.]+) 145Z"/);
  assert.ok(match, "Nie znaleziono geometrii trójkąta.");
  const width = Number(match[4]) - Number(match[1]);
  const height = 145 - Number(match[3]);
  assert.ok(Math.abs(width / height - 0.4) < 1e-6, `Oczekiwano proporcji 4:10, otrzymano ${width}:${height}`);
});

test("autoskalowanie wykresu obejmuje odległy punkt funkcji", () => {
  const quadratic = BASE_FORMULAS.find((formula) => formula.id === "quadratic-value");
  const visual = renderFormulaVisual(quadratic, { inputs: { a: 1, b: 0, c: -4, x: 100 }, outputs: { result: 9996 } });
  const point = visual.match(/class="chart-point" cx="([\d.]+)" cy="([\d.]+)"/);
  assert.ok(point, "Brakuje aktualnego punktu na wykresie.");
  assert.ok(Number(point[1]) >= 31 && Number(point[1]) <= 214);
  assert.ok(Number(point[2]) >= 24 && Number(point[2]) <= 207);
});

test("składnik wyniku przekazuje dokładną wartość bez dodatkowego działania", () => {
  const nodes = [
    { id: "source", type: "value", value: 1 / 3 },
    { id: "result", type: "result" }
  ];
  const edges = [{ sourceNodeId: "source", sourcePortId: "value", targetNodeId: "result", targetPortId: "input" }];
  const { results } = evaluateGraph(nodes, edges, new Map());
  assert.equal(results.get("result").outputs.result, 1 / 3);
});

test("liczby dłuższe niż 10 miejsc są skracane wielokropkiem", () => {
  setNumberLocale("en-US");
  assert.equal(formatNumber(1.25), "1.25");
  assert.match(formatNumber(1 / 3), /\.\.\.$/);
  assert.equal(numberForClipboard(1 / 3), "0.3333333333333333");
});

test("każdy wierzchołek figury ma opis kąta, a boki etykiety zewnętrzne", () => {
  const pythagorean = BASE_FORMULAS.find((formula) => formula.id === "pythagorean");
  const visual = renderFormulaVisual(pythagorean, { inputs: { a: 3, b: 4 }, outputs: { result: 5 } });
  assert.equal((visual.match(/class="angle-label"/g) || []).length, 3);
  assert.equal((visual.match(/class="shape-label middle label-halo"/g) || []).length, 3);
  assert.match(visual, />90°<\/text>/);
  const triangle = visual.match(/d="M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)Z"/).slice(1).map(Number);
  const vertices = [[triangle[0], triangle[1]], [triangle[2], triangle[3]], [triangle[4], triangle[5]]];
  const labels = [...visual.matchAll(/<text x="([\d.]+)" y="([\d.]+)" class="angle-label">/g)].map((match) => [Number(match[1]), Number(match[2])]);
  const sign = (point, start, end) => (point[0] - end[0]) * (start[1] - end[1]) - (start[0] - end[0]) * (point[1] - end[1]);
  const inside = (point) => {
    const values = vertices.map((vertex, index) => sign(point, vertex, vertices[(index + 1) % vertices.length]));
    return values.every((value) => value >= 0) || values.every((value) => value <= 0);
  };
  assert.ok(labels.every((label) => !inside(label)), "Opisy kątów powinny znajdować się na zewnątrz trójkąta.");
});
