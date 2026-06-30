import { BASE_FORMULAS, CATEGORY_ORDER, getFormulaMap } from "./catalog.js";
import { evaluateGraph, formatNumber, numberForClipboard, portIdentity, setNumberLocale, validateExpression } from "./engine.js";
import { renderFormulaVisual, setVisualLanguage } from "./visuals.js";
import { ProjectRepository } from "./projects.js";

const GRAPH_STORAGE_KEY = "formula-flow.graph.v1";
const CUSTOM_STORAGE_KEY = "formula-flow.custom-formulas.v1";
const LANGUAGE_STORAGE_KEY = "formula-flow.language";
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let language = localStorage.getItem(LANGUAGE_STORAGE_KEY) === "pl" ? "pl" : "en";
setNumberLocale(language === "pl" ? "pl-PL" : "en-US");

const COPY = {
  en: {
    value: "Value", source: "DATA SOURCE", sum: "Sum", resultNode: "Result", finalValue: "FINAL VALUE", connectedValue: "Connected result",
    dropResult: "Connect any formula output", waiting: "waiting", empty: "empty", copy: "Copy", copyFull: "Copy full result",
    output: "Output", input: "Input", result: "Result", missing: "missing", error: "error", cycle: "cycle", unknown: "Unknown formula",
    all: "All", showMore: "Show more", remaining: "remaining", noResults: "No matching formula found.", addBoard: "Add to board",
    formulasCalculated: "formulas calculated", chooseInput: "Choose an input port", connectHint: "Click an output, then an input",
    sourceInspector: "SOURCE", portIdentity: "Port identity", currentValue: "Current value", provenance: "Provenance",
    manualValue: "Manually entered value", manualStart: "This node starts the data chain.", deleteNode: "Delete node",
    operation: "OUTPUT", connectedResults: "Connected result", sumParts: "INPUT", attachAny: "Connect any formula output to display its result.",
    formula: "FORMULA", understand: "How to read it", explicitSources: "EXPLICIT INPUT SOURCES", chain: "PROVENANCE CHAIN",
    noSource: "No connected source", from: "from", waitingData: "Waiting for data", chainAfter: "The chain will appear after data is connected.",
    wire: "DATA WIRE", exactLink: "Exact connection", sourceWord: "Source", target: "Target", transferred: "Transferred value", now: "Now", deleteWire: "Delete wire",
    copied: "Copied full result", resultAdded: "Result component added.", valueAdded: "Value source added.", connectionCancelled: "Connection cancelled.",
    chooseFormulaInput: "Now choose a formula input.", firstOutput: "Click an output port first.", selfLink: "A node cannot connect to itself.",
    details: "Dependency details", detailsCopy: "Select a formula, value or wire to inspect exact identities and result provenance.",
    added: "Added", saving: "Saving recovery draft…", saved: "Saved locally", unsaved: "Unsaved changes"
  },
  pl: {
    value: "Wartość", source: "ŹRÓDŁO DANYCH", sum: "Suma", resultNode: "Wynik", finalValue: "WARTOŚĆ KOŃCOWA", connectedValue: "Podłączony wynik",
    dropResult: "Podłącz dowolne wyjście wzoru", waiting: "czeka", empty: "puste", copy: "Kopiuj", copyFull: "Kopiuj pełny wynik",
    output: "Wyjście", input: "Wejście", result: "Wynik", missing: "brak", error: "błąd", cycle: "cykl", unknown: "Nieznany wzór",
    all: "Wszystkie", showMore: "Pokaż kolejne", remaining: "pozostało", noResults: "Nie znalazłem takiego wzoru.", addBoard: "Dodaj na planszę",
    formulasCalculated: "wzorów obliczonych", chooseInput: "Wybierz port wejściowy", connectHint: "Kliknij wyjście, potem wejście",
    sourceInspector: "ŹRÓDŁO", portIdentity: "Tożsamość portu", currentValue: "Aktualna wartość", provenance: "Pochodzenie",
    manualValue: "Wartość wpisana ręcznie", manualStart: "Ten węzeł rozpoczyna łańcuch danych.", deleteNode: "Usuń węzeł",
    operation: "WYJŚCIE", connectedResults: "Podłączony wynik", sumParts: "WEJŚCIE", attachAny: "Podłącz dowolne wyjście wzoru, aby pokazać jego wynik.",
    formula: "WZÓR", understand: "Jak to rozumieć", explicitSources: "JAWNE ŹRÓDŁA WEJŚĆ", chain: "ŁAŃCUCH POCHODZENIA",
    noSource: "Brak podłączonego źródła", from: "z", waitingData: "Czeka na dane", chainAfter: "Łańcuch pojawi się po podłączeniu danych.",
    wire: "PRZEWÓD DANYCH", exactLink: "Dokładne powiązanie", sourceWord: "Źródło", target: "Cel", transferred: "Przesyłana wartość", now: "Teraz", deleteWire: "Usuń przewód",
    copied: "Skopiowano pełny wynik", resultAdded: "Dodano składnik wyniku.", valueAdded: "Dodano źródło wartości.", connectionCancelled: "Anulowano łączenie.",
    chooseFormulaInput: "Teraz wybierz wejście wzoru.", firstOutput: "Najpierw kliknij port wyjściowy.", selfLink: "Nie można połączyć węzła z nim samym.",
    details: "Szczegóły zależności", detailsCopy: "Zaznacz wzór, wartość albo przewód. Tutaj zobaczysz dokładne identyfikatory i pochodzenie wyniku.",
    added: "Dodano", saving: "Zapisywanie szkicu odzyskiwania…", saved: "Zapisano lokalnie", unsaved: "Niezapisane zmiany"
  }
};

const CATEGORY_EN = {
  "Wszystkie": "All", "Podstawowe": "Basics", "Geometria": "Geometry", "Geometria analityczna": "Analytic geometry", "Geometria 3D": "3D geometry",
  "Trygonometria": "Trigonometry", "Analiza": "Calculus", "Ciągi": "Sequences", "Prawdopodobieństwo": "Probability", "Stałe": "Constants",
  "Fizyka: ruch": "Physics: motion", "Fizyka: siły": "Physics: forces", "Fizyka: energia": "Physics: energy", "Fizyka: grawitacja": "Physics: gravity",
  "Fizyka: ciepło": "Physics: heat", "Fizyka: fale": "Physics: waves", "Optyka": "Optics", "Elektryczność": "Electricity", "Magnetyzm": "Magnetism",
  "Płyny": "Fluids", "Fizyka: atom": "Physics: atomic", "Statystyka": "Statistics", "Finanse": "Finance", "Moje": "Mine"
};

const t = (key) => COPY[language][key] || key;
const humanizeId = (id) => String(id || "result").replace(/^custom-/, "").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const categoryName = (category) => language === "en" ? CATEGORY_EN[category] || category : category;
const formulaName = (formula) => language === "en" && !formula.id.startsWith("custom-") ? humanizeId(formula.id) : formula.name;
const portLabel = (port) => language === "en" ? humanizeId(port.id) : port.label;
const formulaDescription = (formula) => language === "en" ? `Uses connected inputs to calculate ${formulaName(formula)}. Provenance follows the ports, not matching letters.` : formula.description;

let sequence = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${(sequence += 1).toString(36)}`;

function demoGraph() {
  return {
    nodes: [
      { id: "value-a", type: "value", x: 80, y: 105, symbol: "a", label: "Wartość a", value: 12 },
      { id: "value-c", type: "value", x: 80, y: 315, symbol: "c", label: "Wartość c", value: 5 },
      { id: "difference-demo", type: "formula", formulaId: "difference", x: 390, y: 190, symbols: { result: "F" }, equationOverride: "F = a − c" },
      { id: "value-s", type: "value", x: 430, y: 480, symbol: "s", label: "Przesunięcie", value: 3 },
      { id: "work-demo", type: "formula", formulaId: "work", x: 755, y: 245 }
    ],
    edges: [
      { id: "edge-a-difference", sourceNodeId: "value-a", sourcePortId: "value", targetNodeId: "difference-demo", targetPortId: "a" },
      { id: "edge-c-difference", sourceNodeId: "value-c", sourcePortId: "value", targetNodeId: "difference-demo", targetPortId: "c" },
      { id: "edge-difference-work", sourceNodeId: "difference-demo", sourcePortId: "result", targetNodeId: "work-demo", targetPortId: "force" },
      { id: "edge-s-work", sourceNodeId: "value-s", sourcePortId: "value", targetNodeId: "work-demo", targetPortId: "distance" }
    ]
  };
}

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch { return fallback; }
}

let customFormulas = readJson(CUSTOM_STORAGE_KEY, []);
if (!Array.isArray(customFormulas)) customFormulas = [];
let formulaMap = getFormulaMap(customFormulas);
const savedGraph = readJson(GRAPH_STORAGE_KEY, null);
const projectRepository = new ProjectRepository(localStorage, {
  defaultName: language === "en" ? "My project" : "Mój projekt",
  legacyGraph: savedGraph && Array.isArray(savedGraph.nodes) && Array.isArray(savedGraph.edges) ? savedGraph : demoGraph(),
  emptyGraph: { nodes: [], edges: [] }
});
localStorage.removeItem(GRAPH_STORAGE_KEY);
const rawInitialGraph = projectRepository.workingGraph();
const initialGraph = migrateStoredGraph(rawInitialGraph);

const state = {
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  selected: { type: "node", id: initialGraph.nodes.find((node) => node.id === "work-demo")?.id || initialGraph.nodes[0]?.id || null },
  pending: null,
  category: "Wszystkie",
  query: "",
  libraryLimit: 48,
  categoriesExpanded: false,
  projectId: projectRepository.active().id,
  dirty: projectRepository.isDirty()
};

let evaluation = evaluateGraph(state.nodes, state.edges, formulaMap);
let saveTimer = null;
const camera = { x: 0, y: 0, scale: 1, minScale: .2, maxScale: 2.5 };

const elements = {
  formulaList: $("#formula-list"), formulaCount: $("#formula-count"), categoryTabs: $("#category-tabs"), search: $("#formula-search"),
  nodes: $("#nodes-layer"), edges: $("#edge-layer"), surface: $("#graph-surface"), viewport: $("#graph-viewport"),
  inspector: $("#inspector-panel"), empty: $("#empty-state"), connectionHint: $("#connection-hint"), engineState: $("#engine-state"),
  saveState: $("#save-state"), formulaModal: $("#formula-modal"), helpModal: $("#help-modal"), projectsModal: $("#projects-modal"), confirmModal: $("#confirm-modal"), formulaForm: $("#formula-form"),
  formError: $("#formula-form-error"), toasts: $("#toast-region"), zoomLevel: $("#zoom-level"), categoryToggle: $("#category-toggle-button"),
  projectName: $("#project-name-label"), projectList: $("#project-list"), projectCount: $("#project-count"), saveProject: $("#save-project-button")
};

function applyCamera() {
  elements.surface.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
  elements.viewport.style.backgroundSize = `${24 * camera.scale}px ${24 * camera.scale}px`;
  elements.viewport.style.backgroundPosition = `${camera.x}px ${camera.y}px`;
  elements.zoomLevel.textContent = `${Math.round(camera.scale * 100)}%`;
}

function screenToWorld(clientX, clientY) {
  const rect = elements.viewport.getBoundingClientRect();
  return {
    x: (clientX - rect.left - camera.x) / camera.scale,
    y: (clientY - rect.top - camera.y) / camera.scale
  };
}

function zoomAt(clientX, clientY, nextScale) {
  const rect = elements.viewport.getBoundingClientRect();
  const world = screenToWorld(clientX, clientY);
  camera.scale = clamp(nextScale, camera.minScale, camera.maxScale);
  camera.x = clientX - rect.left - world.x * camera.scale;
  camera.y = clientY - rect.top - world.y * camera.scale;
  applyCamera();
}

function zoomFromCenter(factor) {
  const rect = elements.viewport.getBoundingClientRect();
  zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, camera.scale * factor);
}

function saveGraph() {
  state.dirty = true;
  elements.saveState.textContent = t("saving");
  elements.saveState.classList.add("unsaved");
  elements.saveProject.disabled = false;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    projectRepository.saveDraft(state.projectId, graphSnapshot());
    updateProjectChrome();
  }, 120);
}

function graphSnapshot() {
  return { nodes: state.nodes, edges: state.edges };
}

function migrateStoredGraph(graph) {
  const source = graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges) ? graph : { nodes: [], edges: [] };
  const legacyIds = new Set(source.nodes.filter((node) => node.type === "sum").map((node) => node.id));
  const migrated = new Set();
  return {
    nodes: source.nodes.map((node) => node.type === "sum" ? { id: node.id, type: "result", x: node.x, y: node.y } : node),
    edges: source.edges.flatMap((edge) => {
      if (!legacyIds.has(edge.targetNodeId)) return [edge];
      if (migrated.has(edge.targetNodeId)) return [];
      migrated.add(edge.targetNodeId);
      return [{ ...edge, targetPortId: "input" }];
    })
  };
}

function flushProjectDraft() {
  clearTimeout(saveTimer);
  if (state.dirty) projectRepository.saveDraft(state.projectId, graphSnapshot());
}

function updateProjectChrome() {
  const project = projectRepository.active();
  if (!project) return;
  elements.projectName.textContent = project.name;
  elements.saveState.textContent = state.dirty ? t("unsaved") : t("saved");
  elements.saveState.classList.toggle("unsaved", state.dirty);
  elements.saveProject.disabled = !state.dirty;
  elements.saveProject.classList.toggle("dirty", state.dirty);
  document.title = `${project.name} — ${language === "en" ? "Formula" : "Formuła"}`;
}

function saveCurrentProject({ silent = false } = {}) {
  clearTimeout(saveTimer);
  projectRepository.commit(state.projectId, graphSnapshot());
  state.dirty = false;
  updateProjectChrome();
  renderProjectList();
  if (!silent) toast(language === "en" ? "Project saved." : "Projekt zapisany.");
}

function loadProject(projectId, { skipFlush = false } = {}) {
  if (projectId === state.projectId && !skipFlush) { elements.projectsModal.close(); return; }
  if (!skipFlush) flushProjectDraft();
  if (!projectRepository.setActive(projectId)) return;
  const graph = migrateStoredGraph(projectRepository.workingGraph(projectId));
  state.projectId = projectId;
  state.nodes = graph.nodes;
  state.edges = graph.edges;
  state.pending = null;
  state.selected = state.nodes[0] ? { type: "node", id: state.nodes[0].id } : null;
  state.dirty = projectRepository.isDirty(projectId);
  camera.x = 0; camera.y = 0; camera.scale = 1;
  elements.projectsModal.close();
  renderGraph();
  updateProjectChrome();
  setTimeout(centerGraph, 20);
}

function projectDate(timestamp) {
  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

function renderProjectList() {
  const projects = projectRepository.list();
  elements.projectCount.textContent = projects.length;
  elements.projectList.innerHTML = projects.map((project) => {
    const active = project.id === state.projectId;
    const dirty = active ? state.dirty : project.dirty;
    return `<article class="project-row ${active ? "active" : ""}" data-project-id="${escapeHtml(project.id)}">
      <div class="project-row-main">
        <input class="project-row-name" data-project-rename="${escapeHtml(project.id)}" value="${escapeHtml(project.name)}" maxlength="80" aria-label="${language === "en" ? "Project name" : "Nazwa projektu"}" />
        <div class="project-row-meta"><span>${escapeHtml(projectDate(project.updatedAt))}</span>${active ? `<span class="project-active-badge">${language === "en" ? "CURRENT" : "BIEŻĄCY"}</span>` : ""}${dirty ? `<span class="project-dirty-badge">${language === "en" ? "DRAFT" : "SZKIC"}</span>` : ""}</div>
      </div>
      <div class="project-row-actions">
        <button class="button secondary" type="button" data-open-project="${escapeHtml(project.id)}" ${active ? "disabled" : ""}>${active ? (language === "en" ? "Open" : "Otwarty") : (language === "en" ? "Open" : "Otwórz")}</button>
        <button class="project-delete-button" type="button" data-delete-project="${escapeHtml(project.id)}" ${projects.length === 1 ? "disabled" : ""} title="${language === "en" ? "Delete project" : "Usuń projekt"}">×</button>
      </div>
    </article>`;
  }).join("");
  $$('[data-project-rename]', elements.projectList).forEach((input) => input.addEventListener("change", () => {
    const renamed = projectRepository.rename(input.dataset.projectRename, input.value);
    if (!renamed) return;
    input.value = renamed.name;
    if (renamed.id === state.projectId) updateProjectChrome();
  }));
  $$('[data-project-rename]', elements.projectList).forEach((input) => input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); input.blur(); }
  }));
  $$('[data-open-project]', elements.projectList).forEach((button) => button.addEventListener("click", () => loadProject(button.dataset.openProject)));
  $$('[data-delete-project]', elements.projectList).forEach((button) => button.addEventListener("click", async () => {
    const project = projects.find((item) => item.id === button.dataset.deleteProject);
    const message = language === "en" ? `Delete “${project?.name}” with its saved version and draft? This cannot be undone.` : `Usunąć „${project?.name}” wraz z zapisaną wersją i szkicem? Tej operacji nie można cofnąć.`;
    const accepted = await askConfirmation({ title: language === "en" ? "Delete project?" : "Usunąć projekt?", message, acceptLabel: language === "en" ? "Delete" : "Usuń" });
    if (!accepted) return;
    const wasActive = button.dataset.deleteProject === state.projectId;
    if (!projectRepository.remove(button.dataset.deleteProject)) return;
    if (wasActive) loadProject(projectRepository.active().id, { skipFlush: true });
    else renderProjectList();
  }));
}

function saveCustomFormulas() {
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customFormulas));
}

function toast(message, type = "info") {
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  elements.toasts.append(item);
  setTimeout(() => item.remove(), 2800);
}

let pendingConfirmation = null;

function finishConfirmation(accepted) {
  if (!pendingConfirmation) return;
  const resolve = pendingConfirmation;
  pendingConfirmation = null;
  if (elements.confirmModal.open) elements.confirmModal.close();
  resolve(accepted);
}

function askConfirmation({ title, message, acceptLabel }) {
  if (pendingConfirmation) finishConfirmation(false);
  $("#confirm-title").textContent = title;
  $("#confirm-message").textContent = message;
  $("#confirm-accept-button").textContent = acceptLabel;
  $("#confirm-cancel-button").textContent = language === "en" ? "Cancel" : "Anuluj";
  $("#confirm-eyebrow").textContent = language === "en" ? "CONFIRMATION" : "POTWIERDZENIE";
  elements.confirmModal.showModal();
  return new Promise((resolve) => { pendingConfirmation = resolve; });
}

function displaySymbol(node, port) {
  return node.symbols?.[port.id] || port.symbol;
}

function nodeTitle(node) {
  if (!node) return t("unknown");
  if (node.type === "value") return language === "en" ? `${t("value")} ${node.symbol || "x"}` : node.label || `${t("value")} ${node.symbol}`;
  if (node.type === "result") return t("resultNode");
  const formula = formulaMap.get(node.formulaId);
  return formula ? formulaName(formula) : t("unknown");
}

function sourceOutput(node) {
  if (node.type === "value") return { id: "value", symbol: node.symbol || "x", label: t("value"), unit: node.unit || "" };
  if (node.type === "result") return { id: "result", symbol: "=", label: t("resultNode"), unit: "" };
  return formulaMap.get(node.formulaId)?.output || { id: "result", symbol: "?", label: t("result"), unit: "" };
}

function renderLibrary() {
  const formulas = [...BASE_FORMULAS, ...customFormulas];
  const existingCategories = new Set(formulas.map((formula) => formula.category));
  const categories = CATEGORY_ORDER.filter((category) => category === "Wszystkie" || existingCategories.has(category));
  elements.categoryTabs.innerHTML = categories.map((category) => `<button class="category-tab ${state.category === category ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(categoryName(category))}</button>`).join("");
  $$("[data-category]", elements.categoryTabs).forEach((button) => button.addEventListener("click", () => {
    state.category = button.dataset.category;
    state.libraryLimit = 48;
    renderLibrary();
  }));

  const query = state.query.trim().toLocaleLowerCase("pl");
  const filtered = formulas.filter((formula) => {
    const inCategory = state.category === "Wszystkie" || formula.category === state.category;
    const haystack = [formula.name, formula.equation, formula.description, formula.category, ...(formula.tags || [])].join(" ").toLocaleLowerCase("pl");
    return inCategory && (!query || haystack.includes(query));
  });
  elements.formulaCount.textContent = formulas.length;
  const visibleFormulas = filtered.slice(0, state.libraryLimit);
  elements.formulaList.innerHTML = visibleFormulas.length ? visibleFormulas.map((formula) => `
    <article class="formula-card" draggable="true" data-formula-id="${escapeHtml(formula.id)}">
      <div class="formula-card-top">
        <div><span class="card-category">${escapeHtml(categoryName(formula.category))}</span><h3>${escapeHtml(formulaName(formula))}</h3></div>
        <div class="card-actions">${formula.visualization ? `<span class="visual-badge" title="${language === "en" ? "Includes an interactive visualization" : "Ten wzór ma wizualizację"}">◉</span>` : ""}<button class="add-card-button" data-add-formula="${escapeHtml(formula.id)}" title="${t("addBoard")}">+</button></div>
      </div>
      <div class="formula-equation">${escapeHtml(formula.equation)}</div>
      <p>${escapeHtml(formulaDescription(formula))}</p>
    </article>`).join("") + (filtered.length > visibleFormulas.length ? `<button class="button secondary wide show-more-button" id="show-more-formulas">${t("showMore")} · ${t("remaining")} ${filtered.length - visibleFormulas.length}</button>` : "") : `<div class="no-results">${t("noResults")}</div>`;

  $$('[data-add-formula]', elements.formulaList).forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation(); addFormulaNode(button.dataset.addFormula);
  }));
  $$('[data-formula-id]', elements.formulaList).forEach((card) => card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/formula-id", card.dataset.formulaId);
    event.dataTransfer.effectAllowed = "copy";
  }));
  $("#show-more-formulas", elements.formulaList)?.addEventListener("click", () => {
    state.libraryLimit += 48;
    renderLibrary();
  });
}

function renderGraph() {
  evaluation = evaluateGraph(state.nodes, state.edges, formulaMap);
  elements.nodes.innerHTML = state.nodes.map(renderNode).join("");
  elements.empty.hidden = state.nodes.length !== 0;
  bindNodeEvents();
  drawEdges();
  renderInspector();
  renderStatus();
}

function renderNode(node) {
  const selected = state.selected?.type === "node" && state.selected.id === node.id;
  const result = evaluation.results.get(node.id);
  const cycle = evaluation.cycleNodes.has(node.id);
  const classes = ["graph-node", node.type === "value" ? "value-node" : "formula-node", selected ? "selected" : "", !result?.ready ? "unresolved" : "", cycle ? "cycle" : ""].filter(Boolean).join(" ");
  if (node.type === "value") {
    const value = result?.outputs?.value;
    return `<article class="${classes}" data-node-id="${escapeHtml(node.id)}" style="left:${node.x}px;top:${node.y}px">
      <header class="node-header">
        <span class="node-icon">123</span><span class="node-title-wrap"><strong>${escapeHtml(nodeTitle(node))}</strong><small>${t("source")}</small></span>
        <button class="node-menu" data-delete-node="${escapeHtml(node.id)}" title="${t("deleteNode")}">×</button>
      </header>
      <div class="value-editor">
        <div class="value-expression">
          <input class="value-symbol-input" data-value-symbol value="${escapeHtml(node.symbol || "x")}" aria-label="${language === "en" ? "Value symbol" : "Symbol wartości"}" />
          <input class="value-number-input" data-value-number type="number" step="any" value="${escapeHtml(node.value)}" aria-label="${language === "en" ? "Numeric value" : "Wartość liczbowa"}" />
        </div>
        <div class="value-output"><span>${t("output").toUpperCase()}</span><strong>${formatNumber(value)}</strong><button class="port-button output ${state.pending?.nodeId === node.id ? "pending" : ""}" data-port-role="output" data-node-id="${escapeHtml(node.id)}" data-port-id="value" title="${t("output")} ${escapeHtml(node.symbol)}"></button></div>
      </div>
    </article>`;
  }
  if (node.type === "result") return renderResultNode(node, classes, result);

  const formula = formulaMap.get(node.formulaId);
  if (!formula) return `<article class="${classes}" data-node-id="${escapeHtml(node.id)}" style="left:${node.x}px;top:${node.y}px"><header class="node-header"><span class="node-icon">!</span><span class="node-title-wrap"><strong>${t("unknown")}</strong><small>${escapeHtml(node.formulaId)}</small></span><button class="node-menu" data-delete-node="${escapeHtml(node.id)}">×</button></header></article>`;
  const inputRows = formula.inputs.map((port) => {
    const edge = evaluation.incoming.get(portIdentity(node.id, port.id));
    const value = result?.inputs?.[port.id];
    const status = typeof value === "number" ? formatNumber(value) : edge ? t("waiting") : t("missing");
    return `<div class="port-row ${edge ? "connected" : ""}">
      <button class="port-button input" data-port-role="input" data-node-id="${escapeHtml(node.id)}" data-port-id="${escapeHtml(port.id)}" title="${t("input")} ${escapeHtml(portLabel(port))}"></button>
      <span class="port-symbol">${escapeHtml(displaySymbol(node, port))}</span><span class="port-label">${escapeHtml(portLabel(port))}</span>
      <span class="port-value ${typeof value !== "number" ? "missing" : ""}">${status}${typeof value === "number" && port.unit ? ` ${escapeHtml(port.unit)}` : ""}</span>
    </div>`;
  }).join("");
  const outputValue = result?.outputs?.[formula.output.id];
  const outputSymbol = displaySymbol(node, formula.output);
  const visualization = renderFormulaVisual(formula, result);
  return `<article class="${classes}" data-node-id="${escapeHtml(node.id)}" style="left:${node.x}px;top:${node.y}px">
    <header class="node-header">
      <span class="node-icon">ƒ</span><span class="node-title-wrap"><strong>${escapeHtml(formulaName(formula))}</strong><small>${escapeHtml(categoryName(formula.category))}</small></span>
      <button class="node-menu" data-delete-node="${escapeHtml(node.id)}" title="${t("deleteNode")}">×</button>
    </header>
    <div class="node-equation">${escapeHtml(node.equationOverride || formula.equation)}</div>${visualization}
    <div class="port-list">${inputRows}</div>
    <div class="port-row output-row">
      <span class="port-label">${escapeHtml(portLabel(formula.output))}</span><span class="port-symbol">${escapeHtml(outputSymbol)}</span>
      <span class="port-value ${typeof outputValue !== "number" ? "missing" : ""}">${typeof outputValue === "number" ? `${formatNumber(outputValue)}${formula.output.unit ? ` ${escapeHtml(formula.output.unit)}` : ""}` : cycle ? t("cycle") : result?.error ? t("error") : t("waiting")}</span>
      <button class="port-button output ${state.pending?.nodeId === node.id ? "pending" : ""}" data-port-role="output" data-node-id="${escapeHtml(node.id)}" data-port-id="${escapeHtml(formula.output.id)}" title="${t("output")} ${escapeHtml(portLabel(formula.output))}"></button>
    </div>
  </article>`;
}

function renderResultNode(node, classes, result) {
  const edge = evaluation.incoming.get(portIdentity(node.id, "input"));
  const value = result?.outputs?.result;
  return `<article class="${classes} result-node" data-node-id="${escapeHtml(node.id)}" style="left:${node.x}px;top:${node.y}px">
    <header class="node-header"><span class="node-icon">=</span><span class="node-title-wrap"><strong>${t("resultNode")}</strong><small>${t("finalValue")}</small></span><button class="node-menu" data-delete-node="${escapeHtml(node.id)}" title="${t("deleteNode")}">×</button></header>
    <div class="result-display">
      <span>${t("connectedResults")}</span>
      <strong title="${typeof value === "number" ? escapeHtml(String(value)) : ""}">${typeof value === "number" ? formatNumber(value) : "—"}</strong>
      <button class="copy-result-button" data-copy-result="${escapeHtml(node.id)}" ${typeof value !== "number" ? "disabled" : ""} title="${t("copyFull")}">${t("copy")}</button>
    </div>
    <div class="port-row result-input ${edge ? "connected" : ""}">
      <button class="port-button input" data-port-role="input" data-node-id="${escapeHtml(node.id)}" data-port-id="input" title="${t("resultNode")} ${t("input").toLowerCase()}"></button>
      <span class="port-symbol">→</span><span class="port-label">${edge ? t("connectedValue") : t("dropResult")}</span>
      <span class="port-value ${typeof value !== "number" ? "missing" : ""}">${edge ? (typeof value === "number" ? formatNumber(value) : t("waiting")) : t("empty")}</span>
    </div>
  </article>`;
}

function bindNodeEvents() {
  $$(".graph-node", elements.nodes).forEach((nodeElement) => {
    const nodeId = nodeElement.dataset.nodeId;
    nodeElement.addEventListener("click", (event) => {
      if (event.target.closest("button,input")) return;
      state.selected = { type: "node", id: nodeId };
      renderGraph();
    });
    const header = $(".node-header", nodeElement);
    header?.addEventListener("pointerdown", (event) => startNodeDrag(event, nodeId, nodeElement));

    $("[data-value-number]", nodeElement)?.addEventListener("change", (event) => {
      const node = state.nodes.find((item) => item.id === nodeId);
      node.value = event.target.value === "" ? "" : Number(event.target.value);
      saveGraph(); renderGraph();
    });
    $("[data-value-symbol]", nodeElement)?.addEventListener("change", (event) => {
      const node = state.nodes.find((item) => item.id === nodeId);
      node.symbol = event.target.value.trim() || "x";
      node.label = `Wartość ${node.symbol}`;
      saveGraph(); renderGraph();
    });
  });

  $$('[data-delete-node]', elements.nodes).forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation(); deleteNode(button.dataset.deleteNode);
  }));
  $$('[data-port-role]', elements.nodes).forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation(); handlePortClick(button.dataset.portRole, button.dataset.nodeId, button.dataset.portId);
  }));
  $$('[data-copy-result]', elements.nodes).forEach((button) => button.addEventListener("click", async (event) => {
    event.stopPropagation();
    await copyNodeResult(button.dataset.copyResult);
  }));
}

async function copyNodeResult(nodeId) {
  const value = evaluation.results.get(nodeId)?.outputs?.result;
  if (typeof value !== "number") return;
  const fullValue = numberForClipboard(value);
  try {
    await navigator.clipboard.writeText(fullValue);
    toast(`${t("copied")}: ${fullValue}`);
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = fullValue;
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.append(temporary);
    temporary.select();
    document.execCommand("copy");
    temporary.remove();
    toast(`${t("copied")}: ${fullValue}`);
  }
}

function startNodeDrag(event, nodeId, nodeElement) {
  if (event.button !== 0 || event.target.closest("button,input")) return;
  const node = state.nodes.find((item) => item.id === nodeId);
  if (!node) return;
  state.selected = { type: "node", id: nodeId };
  const start = { x: event.clientX, y: event.clientY, nodeX: node.x, nodeY: node.y };
  const dragHandle = event.currentTarget;
  dragHandle.setPointerCapture(event.pointerId);
  const move = (moveEvent) => {
    node.x = start.nodeX + (moveEvent.clientX - start.x) / camera.scale;
    node.y = start.nodeY + (moveEvent.clientY - start.y) / camera.scale;
    nodeElement.style.left = `${node.x}px`;
    nodeElement.style.top = `${node.y}px`;
    drawEdges();
  };
  const end = () => {
    dragHandle.removeEventListener("pointermove", move);
    dragHandle.removeEventListener("pointerup", end);
    dragHandle.removeEventListener("pointercancel", end);
    saveGraph(); renderGraph();
  };
  dragHandle.addEventListener("pointermove", move);
  dragHandle.addEventListener("pointerup", end);
  dragHandle.addEventListener("pointercancel", end);
}

function handlePortClick(role, nodeId, portId) {
  if (role === "output") {
    if (state.pending?.nodeId === nodeId && state.pending?.portId === portId) {
      state.pending = null;
      toast(t("connectionCancelled"));
    } else {
      state.pending = { nodeId, portId };
      toast(t("chooseFormulaInput"));
    }
    renderGraph();
    return;
  }
  if (!state.pending) { toast(t("firstOutput")); return; }
  if (state.pending.nodeId === nodeId) { toast(t("selfLink"), "error"); return; }
  state.edges = state.edges.filter((edge) => !(edge.targetNodeId === nodeId && edge.targetPortId === portId));
  const edge = { id: uid("edge"), sourceNodeId: state.pending.nodeId, sourcePortId: state.pending.portId, targetNodeId: nodeId, targetPortId: portId };
  state.edges.push(edge);
  state.pending = null;
  state.selected = { type: "edge", id: edge.id };
  saveGraph(); renderGraph();
}

function drawEdges() {
  const surfaceRect = elements.surface.getBoundingClientRect();
  const pieces = [];
  for (const edge of state.edges) {
    const source = $(`[data-port-role="output"][data-node-id="${CSS.escape(edge.sourceNodeId)}"][data-port-id="${CSS.escape(edge.sourcePortId)}"]`, elements.nodes);
    const target = $(`[data-port-role="input"][data-node-id="${CSS.escape(edge.targetNodeId)}"][data-port-id="${CSS.escape(edge.targetPortId)}"]`, elements.nodes);
    if (!source || !target) continue;
    const a = source.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const x1 = (a.left + a.width / 2 - surfaceRect.left) / camera.scale;
    const y1 = (a.top + a.height / 2 - surfaceRect.top) / camera.scale;
    const x2 = (b.left + b.width / 2 - surfaceRect.left) / camera.scale;
    const y2 = (b.top + b.height / 2 - surfaceRect.top) / camera.scale;
    const bend = Math.max(72, Math.min(210, Math.abs(x2 - x1) * .48));
    const path = `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
    const midX = (x1 + 3 * (x1 + bend) + 3 * (x2 - bend) + x2) / 8;
    const midY = (y1 + 3 * y1 + 3 * y2 + y2) / 8;
    const sourceValue = evaluation.results.get(edge.sourceNodeId)?.outputs?.[edge.sourcePortId];
    const label = typeof sourceValue === "number" ? formatNumber(sourceValue) : "…";
    const labelWidth = Math.max(31, label.length * 7 + 12);
    const selected = state.selected?.type === "edge" && state.selected.id === edge.id;
    pieces.push(`<g data-edge-group="${escapeHtml(edge.id)}">
      <path class="edge ${typeof sourceValue !== "number" ? "muted" : ""} ${selected ? "selected" : ""}" d="${path}" />
      <path class="edge-hit" data-edge-id="${escapeHtml(edge.id)}" d="${path}" />
      <rect class="edge-value-bg" x="${midX - labelWidth / 2}" y="${midY - 10}" width="${labelWidth}" height="20" rx="7" />
      <text class="edge-value" x="${midX}" y="${midY}">${escapeHtml(label)}</text>
    </g>`);
  }
  elements.edges.innerHTML = pieces.join("");
  $$('[data-edge-id]', elements.edges).forEach((path) => path.addEventListener("click", (event) => {
    event.stopPropagation(); state.selected = { type: "edge", id: path.dataset.edgeId }; renderGraph();
  }));
}

function renderStatus() {
  const formulaNodes = state.nodes.filter((node) => node.type === "formula");
  const ready = formulaNodes.filter((node) => evaluation.results.get(node.id)?.ready).length;
  if (evaluation.cycleNodes.size) {
    elements.engineState.textContent = language === "en" ? `Cycle detected (${evaluation.cycleNodes.size})` : `Wykryto cykl (${evaluation.cycleNodes.size})`;
    elements.engineState.classList.add("error");
  } else {
    elements.engineState.textContent = `${ready}/${formulaNodes.length} ${t("formulasCalculated")}`;
    elements.engineState.classList.remove("error");
  }
  elements.connectionHint.classList.toggle("connecting", Boolean(state.pending));
  elements.connectionHint.lastChild.textContent = state.pending ? t("chooseInput") : t("connectHint");
}

function renderInspector() {
  const selection = state.selected;
  if (!selection?.id) {
    elements.inspector.innerHTML = `<div class="inspector-empty"><span class="empty-glyph">⌁</span><h2>${t("details")}</h2><p>${t("detailsCopy")}</p></div>`;
    return;
  }
  if (selection.type === "edge") { renderEdgeInspector(selection.id); return; }
  const node = state.nodes.find((item) => item.id === selection.id);
  if (!node) { state.selected = null; renderInspector(); return; }
  const result = evaluation.results.get(node.id);
  const output = sourceOutput(node);
  const outputValue = result?.outputs?.[output.id];
  if (node.type === "value") {
    elements.inspector.innerHTML = `
      <div class="inspector-header"><p class="eyebrow">${t("sourceInspector")}</p><h2>${escapeHtml(nodeTitle(node))}</h2><p>${escapeHtml(node.symbol)} = ${formatNumber(outputValue)}</p></div>
      <section class="inspector-section"><h3>${t("portIdentity")}</h3><span class="identity-code">${escapeHtml(portIdentity(node.id, "value"))}</span><div class="metric"><span>${t("currentValue")}</span><strong>${formatNumber(outputValue)}</strong></div></section>
      <section class="inspector-section"><h3>${t("provenance")}</h3><div class="source-row resolved"><strong>${t("manualValue")}</strong><span>${t("manualStart")}</span></div></section>
      <section class="inspector-section"><button class="button danger wide" data-inspector-delete>${t("deleteNode")}</button></section>`;
    $("[data-inspector-delete]", elements.inspector).addEventListener("click", () => deleteNode(node.id));
    return;
  }
  if (node.type === "result") {
    const edge = evaluation.incoming.get(portIdentity(node.id, "input"));
    const source = edge ? state.nodes.find((item) => item.id === edge.sourceNodeId) : null;
    const sourceMarkup = source ? `<div class="source-row resolved"><strong>${escapeHtml(nodeTitle(source))}</strong><span>${escapeHtml(portIdentity(source.id, edge.sourcePortId))}${typeof outputValue === "number" ? ` · ${formatNumber(outputValue)}` : ""}</span></div>` : `<div class="source-row"><span>${t("attachAny")}</span></div>`;
    elements.inspector.innerHTML = `
      <div class="inspector-header"><p class="eyebrow">${t("operation")}</p><h2>${t("resultNode")}</h2><p>${t("connectedResults")}</p></div>
      <section class="inspector-section"><h3>${t("result")}</h3><div class="metric"><span>=</span><strong title="${typeof outputValue === "number" ? escapeHtml(String(outputValue)) : ""}">${typeof outputValue === "number" ? formatNumber(outputValue) : t("waitingData")}</strong></div><span class="identity-code">${escapeHtml(portIdentity(node.id, "result"))}</span><button class="button secondary wide" data-inspector-copy ${typeof outputValue !== "number" ? "disabled" : ""}>${t("copyFull")}</button></section>
      <section class="inspector-section"><h3>${t("sumParts")}</h3>${sourceMarkup}</section>
      <section class="inspector-section"><button class="button danger wide" data-inspector-delete>${t("deleteNode")}</button></section>`;
    $("[data-inspector-copy]", elements.inspector)?.addEventListener("click", () => copyNodeResult(node.id));
    $("[data-inspector-delete]", elements.inspector).addEventListener("click", () => deleteNode(node.id));
    return;
  }
  const formula = formulaMap.get(node.formulaId);
  const sources = formula.inputs.map((port) => {
    const edge = evaluation.incoming.get(portIdentity(node.id, port.id));
    const source = edge ? state.nodes.find((item) => item.id === edge.sourceNodeId) : null;
    return `<div class="source-row ${source ? "resolved" : ""}"><strong>${escapeHtml(displaySymbol(node, port))} · ${escapeHtml(portLabel(port))}</strong><span>${source ? `${t("from")} “${escapeHtml(nodeTitle(source))}” · ${escapeHtml(portIdentity(source.id, edge.sourcePortId))}` : t("noSource")}</span></div>`;
  }).join("");
  const provenance = buildProvenance(node.id).map((item) => `<li><strong>${escapeHtml(item.label)}</strong><br><code>${escapeHtml(item.identity)}</code>${typeof item.value === "number" ? ` · ${formatNumber(item.value)}` : ""}</li>`).join("");
  const assumptions = (formula.assumptions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  elements.inspector.innerHTML = `
    <div class="inspector-header"><p class="eyebrow">${t("formula")} · ${escapeHtml(categoryName(formula.category))}</p><h2>${escapeHtml(formulaName(formula))}</h2><p>${escapeHtml(node.equationOverride || formula.equation)}</p></div>
    <section class="inspector-section learning-section"><h3>${t("understand")}</h3><p class="learning-copy">${escapeHtml(formulaDescription(formula))}</p>${language === "pl" && assumptions ? `<ul class="assumption-list">${assumptions}</ul>` : ""}</section>
    <section class="inspector-section"><h3>${t("result")}</h3><div class="metric"><span>${escapeHtml(displaySymbol(node, formula.output))}</span><strong>${typeof outputValue === "number" ? `${formatNumber(outputValue)} ${escapeHtml(formula.output.unit)}` : result?.error || t("waitingData")}</strong></div><span class="identity-code">${escapeHtml(portIdentity(node.id, formula.output.id))}</span></section>
    <section class="inspector-section"><h3>${t("explicitSources")}</h3>${sources}</section>
    <section class="inspector-section"><h3>${t("chain")}</h3>${provenance ? `<ol class="provenance">${provenance}</ol>` : `<div class="source-row"><span>${t("chainAfter")}</span></div>`}</section>
    <section class="inspector-section"><button class="button danger wide" data-inspector-delete>${t("deleteNode")}</button></section>`;
  $("[data-inspector-delete]", elements.inspector).addEventListener("click", () => deleteNode(node.id));
}

function renderEdgeInspector(edgeId) {
  const edge = state.edges.find((item) => item.id === edgeId);
  if (!edge) { state.selected = null; renderInspector(); return; }
  const source = state.nodes.find((node) => node.id === edge.sourceNodeId);
  const target = state.nodes.find((node) => node.id === edge.targetNodeId);
  const targetFormula = formulaMap.get(target?.formulaId);
  const input = target?.type === "result" ? { id: "input", symbol: "→", label: t("connectedValue") } : targetFormula?.inputs.find((port) => port.id === edge.targetPortId);
  const value = evaluation.results.get(edge.sourceNodeId)?.outputs?.[edge.sourcePortId];
  elements.inspector.innerHTML = `
    <div class="inspector-header"><p class="eyebrow">${t("wire")}</p><h2>${escapeHtml(nodeTitle(source))} → ${escapeHtml(nodeTitle(target))}</h2><p>${escapeHtml(sourceOutput(source).symbol)} → ${escapeHtml(input?.symbol || edge.targetPortId)}</p></div>
    <section class="inspector-section"><h3>${t("exactLink")}</h3><div class="source-row resolved"><strong>${t("sourceWord")}</strong><span class="identity-code">${escapeHtml(portIdentity(edge.sourceNodeId, edge.sourcePortId))}</span></div><div class="source-row resolved"><strong>${t("target")}</strong><span class="identity-code">${escapeHtml(portIdentity(edge.targetNodeId, edge.targetPortId))}</span></div></section>
    <section class="inspector-section"><h3>${t("transferred")}</h3><div class="metric"><span>${t("now")}</span><strong>${formatNumber(value)}</strong></div><p style="color:var(--muted);font-size:10px;line-height:1.5">${language === "en" ? "Letters are labels only. Port identities define the actual semantics of this connection." : "Litery po obu stronach są tylko etykietami. Ten zapis portów jest faktyczną semantyką połączenia."}</p></section>
    <section class="inspector-section"><button class="button danger wide" data-delete-edge>${t("deleteWire")}</button></section>`;
  $("[data-delete-edge]", elements.inspector).addEventListener("click", () => deleteEdge(edge.id));
}

function buildProvenance(nodeId) {
  const items = [];
  const visited = new Set();
  const walk = (currentId) => {
    if (visited.has(currentId)) return;
    visited.add(currentId);
    const current = state.nodes.find((node) => node.id === currentId);
    if (!current) return;
    if (current.type === "formula" || current.type === "result") {
      const ports = current.type === "result" ? [{ id: "input" }] : formulaMap.get(current.formulaId)?.inputs || [];
      for (const port of ports) {
        const edge = evaluation.incoming.get(portIdentity(current.id, port.id));
        if (edge) walk(edge.sourceNodeId);
      }
    }
    const output = sourceOutput(current);
    items.push({ label: nodeTitle(current), identity: portIdentity(current.id, output.id), value: evaluation.results.get(current.id)?.outputs?.[output.id] });
  };
  walk(nodeId);
  return items;
}

function findOpenPosition(estimatedHeight, preferred = null) {
  const width = 246;
  const gap = 24;
  const boxes = state.nodes.map((node) => {
    const element = $(`[data-node-id="${CSS.escape(node.id)}"]`, elements.nodes);
    return { x: node.x, y: node.y, width, height: element?.offsetHeight || 210 };
  });
  const viewportRect = elements.viewport.getBoundingClientRect();
  const center = screenToWorld(viewportRect.left + viewportRect.width / 2, viewportRect.top + viewportRect.height / 2);
  const preferredX = preferred?.x ?? center.x - width / 2;
  const preferredY = preferred?.y ?? center.y - estimatedHeight / 2;
  const candidates = [];
  for (let ring = 0; ring < 8; ring += 1) {
    for (const dy of [0, estimatedHeight + gap, -(estimatedHeight + gap)]) {
      for (const dx of [0, width + gap, -(width + gap)]) {
        candidates.push({ x: preferredX + dx * ring, y: preferredY + dy * ring });
      }
    }
  }
  const collides = (candidate) => boxes.some((box) => !(
    candidate.x + width + gap <= box.x || box.x + box.width + gap <= candidate.x ||
    candidate.y + estimatedHeight + gap <= box.y || box.y + box.height + gap <= candidate.y
  ));
  return candidates.find((candidate) => !collides(candidate)) || { x: preferredX, y: preferredY };
}

function revealNode(node, estimatedHeight) {
  setTimeout(() => {
    camera.x = elements.viewport.clientWidth / 2 - (node.x + 123) * camera.scale;
    camera.y = elements.viewport.clientHeight / 2 - (node.y + estimatedHeight / 2) * camera.scale;
    applyCamera();
  }, 30);
}

function addFormulaNode(formulaId, point = null) {
  const formula = formulaMap.get(formulaId);
  if (!formula) return;
  const visualHeight = formula.visualization ? (formula.visualization.type.startsWith("plot-") ? 285 : 225) : 0;
  const estimatedHeight = 130 + formula.inputs.length * 34 + visualHeight;
  const position = point || findOpenPosition(estimatedHeight);
  const node = { id: uid(formulaId), type: "formula", formulaId, x: position.x, y: position.y };
  state.nodes.push(node);
  state.selected = { type: "node", id: node.id };
  saveGraph(); renderGraph();
  revealNode(node, estimatedHeight);
  toast(`${t("added")}: ${formulaName(formula)}`);
}

function addResultNode(point = null) {
  const estimatedHeight = 145;
  const position = point || findOpenPosition(estimatedHeight);
  const node = { id: uid("result"), type: "result", x: position.x, y: position.y };
  state.nodes.push(node);
  state.selected = { type: "node", id: node.id };
  saveGraph(); renderGraph(); revealNode(node, estimatedHeight); toast(t("resultAdded"));
}

function addValueNode(point = null) {
  const index = state.nodes.filter((node) => node.type === "value").length + 1;
  const position = point || findOpenPosition(150);
  const node = {
    id: uid("value"), type: "value", symbol: `x${index}`, label: `Wartość x${index}`, value: 1,
    x: position.x, y: position.y
  };
  state.nodes.push(node); state.selected = { type: "node", id: node.id };
  saveGraph(); renderGraph(); revealNode(node, 150); toast(t("valueAdded"));
}

function deleteNode(nodeId) {
  state.nodes = state.nodes.filter((node) => node.id !== nodeId);
  state.edges = state.edges.filter((edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId);
  if (state.selected?.id === nodeId) state.selected = null;
  if (state.pending?.nodeId === nodeId) state.pending = null;
  saveGraph(); renderGraph();
}

function deleteEdge(edgeId) {
  state.edges = state.edges.filter((edge) => edge.id !== edgeId);
  state.selected = null; saveGraph(); renderGraph();
}

function centerGraph() {
  if (!state.nodes.length) {
    camera.x = elements.viewport.clientWidth / 2;
    camera.y = elements.viewport.clientHeight / 2;
    camera.scale = 1;
    applyCamera();
    return;
  }
  const minX = Math.min(...state.nodes.map((node) => node.x));
  const maxX = Math.max(...state.nodes.map((node) => node.x + 246));
  const minY = Math.min(...state.nodes.map((node) => node.y));
  const maxY = Math.max(...state.nodes.map((node) => {
    const element = $(`[data-node-id="${CSS.escape(node.id)}"]`, elements.nodes);
    return node.y + (element?.offsetHeight || 190);
  }));
  const graphWidth = Math.max(1, maxX - minX);
  const graphHeight = Math.max(1, maxY - minY);
  camera.scale = clamp(Math.min((elements.viewport.clientWidth - 80) / graphWidth, (elements.viewport.clientHeight - 80) / graphHeight), camera.minScale, 1.25);
  camera.x = (elements.viewport.clientWidth - graphWidth * camera.scale) / 2 - minX * camera.scale;
  camera.y = (elements.viewport.clientHeight - graphHeight * camera.scale) / 2 - minY * camera.scale;
  applyCamera();
}

async function loadDemo() {
  if (state.nodes.length || state.edges.length) {
    const accepted = await askConfirmation({
      title: language === "en" ? "Load the example?" : "Wczytać przykład?",
      message: language === "en" ? "The current working version will be replaced. The saved project version stays unchanged until you click Save." : "Bieżąca wersja robocza zostanie zastąpiona. Zapisana wersja projektu pozostanie bez zmian, dopóki nie klikniesz Zapisz.",
      acceptLabel: language === "en" ? "Load example" : "Wczytaj przykład"
    });
    if (!accepted) return;
  }
  const demo = demoGraph();
  state.nodes = demo.nodes; state.edges = demo.edges; state.pending = null; state.selected = { type: "node", id: "work-demo" };
  saveGraph(); renderGraph(); setTimeout(centerGraph, 20); toast(language === "en" ? "Loaded example F = a − c → W = F·s." : "Wczytano przykład F = a − c → W = F·s.");
}

function parseInputDefinitions(source) {
  const parts = source.split(",").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Podaj przynajmniej jedno wejście.");
  const seen = new Set();
  return parts.map((part) => {
    const [rawId, ...labelParts] = part.split(":");
    const id = rawId.trim();
    const label = labelParts.join(":").trim() || id;
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(id)) throw new Error(`„${id}” nie jest poprawnym identyfikatorem wejścia.`);
    if (["pi", "e"].includes(id)) throw new Error(`„${id}” jest zarezerwowaną stałą.`);
    if (seen.has(id)) throw new Error(`Wejście „${id}” występuje dwa razy.`);
    seen.add(id);
    return { id, symbol: id, label, unit: "" };
  });
}

function createCustomFormula(formData) {
  const name = String(formData.get("name")).trim();
  const rawCategory = String(formData.get("category")).trim() || "Moje";
  const category = rawCategory === "Mine" ? "Moje" : rawCategory;
  const inputs = parseInputDefinitions(String(formData.get("inputs")));
  const expression = String(formData.get("expression")).trim();
  validateExpression(expression, inputs.map((item) => item.id));
  const outputSymbol = String(formData.get("outputSymbol")).trim();
  const equation = String(formData.get("equation")).trim() || `${outputSymbol} = ${expression.replaceAll("*", "×")}`;
  return {
    id: `custom-${name.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`,
    name, category, equation, description: "Własna definicja", inputs,
    output: { id: "result", symbol: outputSymbol, label: String(formData.get("outputLabel")).trim(), unit: "" }, expression, tags: ["własny"]
  };
}

function applyLanguage() {
  const english = language === "en";
  document.documentElement.lang = language;
  document.title = english ? "Formula — dependency map" : "Formuła — mapa zależności";
  setNumberLocale(english ? "en-US" : "pl-PL");
  setVisualLanguage(language);
  $("#language-select").value = language;
  $(".brand").setAttribute("aria-label", english ? "Formula — home" : "Formuła — strona główna");
  $(".brand small").textContent = english ? "dependency map" : "mapa zależności";
  $("#project-menu-button").setAttribute("aria-label", english ? "Open project list" : "Otwórz listę projektów");
  elements.saveProject.textContent = english ? "Save" : "Zapisz";
  elements.saveProject.title = english ? "Save project (Ctrl+S)" : "Zapisz projekt (Ctrl+S)";
  $("#help-button").textContent = english ? "How it works" : "Jak to działa?";
  $("#new-formula-button").textContent = english ? "+ New formula" : "+ Nowy wzór";
  $(".library-panel").setAttribute("aria-label", english ? "Formula library" : "Biblioteka wzorów");
  $(".panel-heading .eyebrow").textContent = english ? "LIBRARY" : "BIBLIOTEKA";
  $(".panel-heading h1").textContent = english ? "Formulas" : "Wzory";
  elements.search.placeholder = english ? "Search formula or symbol…" : "Szukaj wzoru lub symbolu…";
  elements.categoryTabs.setAttribute("aria-label", english ? "Categories" : "Kategorie");
  elements.categoryToggle.innerHTML = `${state.categoriesExpanded ? (english ? "Fewer categories" : "Mniej działów") : (english ? "More categories" : "Więcej działów")} <span>⌄</span>`;
  $("#add-value-button").textContent = english ? "+ Add value" : "+ Dodaj wartość";
  $("#add-result-button").textContent = english ? "= Result" : "= Wynik";
  $(".library-footer p").innerHTML = english ? "A value is a data source, e.g. <strong>m = 12 kg</strong>." : "Wartość jest źródłem danych, np. <strong>m = 12 kg</strong>.";
  $("#demo-button").title = english ? "Load example" : "Wczytaj przykład";
  $("#clear-button").title = english ? "Clear board" : "Wyczyść planszę";
  $("#zoom-out-button").title = english ? "Zoom out" : "Oddal";
  $("#zoom-in-button").title = english ? "Zoom in" : "Przybliż";
  $("#center-button").title = english ? "Fit entire graph" : "Dopasuj cały graf";
  $("#empty-state h2").textContent = english ? "A dependency starts here" : "Tu zaczyna się zależność";
  $("#empty-state p").textContent = english ? "Add a value and a formula, then connect their ports." : "Dodaj wartość i wzór z biblioteki, a potem połącz ich porty.";
  $("#empty-demo-button").textContent = english ? "Show example" : "Pokaż przykład";

  $("#projects-eyebrow").textContent = english ? "LOCAL FILES" : "PLIKI LOKALNE";
  $("#projects-title").textContent = english ? "Projects" : "Projekty";
  $("#projects-lead").textContent = english ? "Each project has its own board. Recovery drafts are kept automatically, while Save commits the current version." : "Każdy projekt ma własną planszę. Szkice są odzyskiwane automatycznie, a przycisk Zapisz zatwierdza bieżącą wersję.";
  $("#project-create-label").textContent = english ? "New project name" : "Nazwa nowego projektu";
  $("#project-create-name").placeholder = english ? "e.g. Mechanics — exercise 1" : "np. Mechanika — zadanie 1";
  $("#create-project-button").textContent = english ? "+ Create" : "+ Utwórz";
  $("#project-list-label").textContent = english ? "Your projects" : "Twoje projekty";
  $("#close-projects-button").textContent = english ? "Close" : "Zamknij";

  const formulaHeader = $("#formula-modal .modal-header");
  $(".eyebrow", formulaHeader).textContent = english ? "CUSTOM DEFINITION" : "WŁASNA DEFINICJA";
  $("h2", formulaHeader).textContent = english ? "Add a formula to the library" : "Dodaj wzór do biblioteki";
  $("#formula-modal .modal-lead").textContent = english ? "Symbols are labels. Ports and explicit wires determine where a value actually comes from." : "Symbole są etykietami. To porty i jawne przewody określają, skąd naprawdę pochodzi wartość.";
  const formLabels = $$("#formula-modal .form-grid label > span");
  const labelCopies = english
    ? ["Formula name", "Category", "Inputs <small>(identifier: label, comma-separated)</small>", "Result symbol", "Result name", "Calculation expression", "Display notation <small>(optional)</small>"]
    : ["Nazwa wzoru", "Kategoria", "Wejścia <small>(identyfikator: etykieta, po przecinku)</small>", "Symbol wyniku", "Nazwa wyniku", "Wyrażenie obliczeniowe", "Zapis do pokazania <small>(opcjonalnie)</small>"];
  formLabels.forEach((label, index) => { label.innerHTML = labelCopies[index]; });
  const formInputs = elements.formulaForm.elements;
  formInputs.name.placeholder = english ? "e.g. Trapezoid area" : "np. Pole trapezu";
  formInputs.inputs.placeholder = english ? "a: base A, b: base B, h: height" : "a: podstawa A, b: podstawa B, h: wysokość";
  if (formInputs.category.value === "Moje" || formInputs.category.value === "Mine") formInputs.category.value = english ? "Mine" : "Moje";
  if (formInputs.outputLabel.value === "Wynik" || formInputs.outputLabel.value === "Result") formInputs.outputLabel.value = english ? "Result" : "Wynik";
  $("#formula-modal .modal-actions .ghost").textContent = english ? "Cancel" : "Anuluj";
  $("#save-formula-button").textContent = english ? "Save and add" : "Zapisz i dodaj";
  $("#formula-modal .form-grid label > small").textContent = english ? "Operators: + − * / ^. Functions: sqrt, sin, cos, tan, abs, log, ln, min, max." : "Operatory: + − * / ^. Funkcje: sqrt, sin, cos, tan, abs, log, ln, min, max.";

  const helpHeader = $("#help-modal .modal-header");
  $(".eyebrow", helpHeader).textContent = english ? "30 SECONDS" : "30 SEKUND";
  $("h2", helpHeader).textContent = english ? "Build a dependency" : "Jak zbudować zależność";
  $("#help-modal .help-steps").innerHTML = english ? `
    <li><span>1</span><div><strong>Add a source</strong><p>A value has a concrete output, e.g. <code>value-1::value</code>.</p></div></li>
    <li><span>2</span><div><strong>Add a formula</strong><p>Every input has its own unique identity.</p></div></li>
    <li><span>3</span><div><strong>Connect ports</strong><p>Click an output dot, then an input dot. Letters may differ — the wire is what matters.</p></div></li>
    <li><span>4</span><div><strong>Trace the result</strong><p>The engine calculates the graph and shows full provenance.</p></div></li>
    <li><span>5</span><div><strong>Save the project</strong><p>Recovery drafts are automatic. Use Save or <code>Ctrl+S</code> to commit the version.</p></div></li>` : `
    <li><span>1</span><div><strong>Dodaj źródło</strong><p>Wartość ma konkretne wyjście, np. <code>wartosc-1::value</code>.</p></div></li>
    <li><span>2</span><div><strong>Dodaj wzór</strong><p>Każde wejście wzoru ma własną, niepowtarzalną tożsamość.</p></div></li>
    <li><span>3</span><div><strong>Połącz porty</strong><p>Kliknij kropkę wyjściową, a potem wejściową. Litery mogą być różne — liczy się przewód.</p></div></li>
    <li><span>4</span><div><strong>Śledź wynik</strong><p>Silnik oblicza graf i pokazuje pełne pochodzenie wartości.</p></div></li>
    <li><span>5</span><div><strong>Zapisz projekt</strong><p>Szkic odzyskiwania powstaje automatycznie. Kliknij Zapisz lub <code>Ctrl+S</code>, aby zatwierdzić wersję.</p></div></li>`;
  $("#help-modal .modal-actions .primary").textContent = english ? "Got it" : "Rozumiem";
  $$('.modal-close').forEach((button) => button.setAttribute("aria-label", english ? "Close" : "Zamknij"));
  renderLibrary();
  renderGraph();
  renderProjectList();
  updateProjectChrome();
}

elements.search.addEventListener("input", (event) => { state.query = event.target.value; state.libraryLimit = 48; renderLibrary(); });
$("#language-select").addEventListener("change", (event) => {
  language = event.target.value === "pl" ? "pl" : "en";
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  applyLanguage();
});
elements.categoryToggle.addEventListener("click", () => {
  state.categoriesExpanded = !state.categoriesExpanded;
  elements.categoryTabs.classList.toggle("expanded", state.categoriesExpanded);
  elements.categoryToggle.setAttribute("aria-expanded", String(state.categoriesExpanded));
  elements.categoryToggle.firstChild.textContent = state.categoriesExpanded ? (language === "en" ? "Fewer categories " : "Mniej działów ") : (language === "en" ? "More categories " : "Więcej działów ");
});
$("#add-value-button").addEventListener("click", () => addValueNode());
$("#add-result-button").addEventListener("click", () => addResultNode());
$("#project-menu-button").addEventListener("click", () => {
  flushProjectDraft();
  renderProjectList();
  elements.projectsModal.showModal();
});
elements.saveProject.addEventListener("click", () => saveCurrentProject());
$("#project-create-form").addEventListener("submit", (event) => {
  event.preventDefault();
  flushProjectDraft();
  const input = $("#project-create-name");
  const fallback = `${language === "en" ? "New project" : "Nowy projekt"} ${projectRepository.list().length + 1}`;
  const project = projectRepository.create(input.value || fallback, { nodes: [], edges: [] });
  input.value = "";
  loadProject(project.id, { skipFlush: true });
  toast(language === "en" ? `Created “${project.name}”.` : `Utworzono „${project.name}”.`);
});
$("#new-formula-button").addEventListener("click", () => { elements.formError.textContent = ""; elements.formulaModal.showModal(); });
$("#help-button").addEventListener("click", () => elements.helpModal.showModal());
$$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => button.closest("dialog")?.close()));
$$('dialog.modal').forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  if (dialog === elements.confirmModal) finishConfirmation(false);
  else dialog.close();
}));
$("#confirm-cancel-button").addEventListener("click", () => finishConfirmation(false));
$("#confirm-accept-button").addEventListener("click", () => finishConfirmation(true));
elements.confirmModal.addEventListener("cancel", (event) => { event.preventDefault(); finishConfirmation(false); });
$("#demo-button").addEventListener("click", loadDemo);
$("#empty-demo-button").addEventListener("click", loadDemo);
$("#center-button").addEventListener("click", centerGraph);
$("#zoom-in-button").addEventListener("click", () => zoomFromCenter(1.2));
$("#zoom-out-button").addEventListener("click", () => zoomFromCenter(1 / 1.2));
$("#clear-button").addEventListener("click", async () => {
  if (state.nodes.length || state.edges.length) {
    const accepted = await askConfirmation({
      title: language === "en" ? "Clear the board?" : "Wyczyścić planszę?",
      message: language === "en" ? "The current working version will be replaced. The saved project version stays unchanged until you click Save." : "Bieżąca wersja robocza zostanie zastąpiona. Zapisana wersja projektu pozostanie bez zmian, dopóki nie klikniesz Zapisz.",
      acceptLabel: language === "en" ? "Clear" : "Wyczyść"
    });
    if (!accepted) return;
  }
  state.nodes = []; state.edges = []; state.pending = null; state.selected = null; saveGraph(); renderGraph();
});

elements.formulaForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") { elements.formulaModal.close(); return; }
  try {
    const formula = createCustomFormula(new FormData(elements.formulaForm));
    customFormulas.push(formula); formulaMap = getFormulaMap(customFormulas); saveCustomFormulas();
    elements.formulaModal.close(); elements.formulaForm.reset();
    renderLibrary(); addFormulaNode(formula.id); toast("Własny wzór trafił do biblioteki.");
  } catch (error) { elements.formError.textContent = error.message; }
});

elements.surface.addEventListener("click", (event) => {
  if (event.target !== elements.surface && event.target !== elements.nodes && event.target !== elements.edges) return;
  state.selected = null; state.pending = null; renderGraph();
});
elements.viewport.addEventListener("dragover", (event) => { if (event.dataTransfer.types.includes("text/formula-id")) event.preventDefault(); });
elements.viewport.addEventListener("drop", (event) => {
  const formulaId = event.dataTransfer.getData("text/formula-id");
  if (!formulaId) return;
  event.preventDefault();
  const point = screenToWorld(event.clientX, event.clientY);
  addFormulaNode(formulaId, { x: point.x - 123, y: point.y - 30 });
});

let panState = null;
elements.viewport.addEventListener("pointerdown", (event) => {
  if (![0, 1].includes(event.button) || event.target.closest(".graph-node, .edge-hit")) return;
  panState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, cameraX: camera.x, cameraY: camera.y, moved: false };
  elements.viewport.setPointerCapture(event.pointerId);
  elements.viewport.classList.add("panning");
  event.preventDefault();
});
elements.viewport.addEventListener("pointermove", (event) => {
  if (!panState || panState.pointerId !== event.pointerId) return;
  const dx = event.clientX - panState.startX;
  const dy = event.clientY - panState.startY;
  if (Math.abs(dx) + Math.abs(dy) > 4) panState.moved = true;
  camera.x = panState.cameraX + dx;
  camera.y = panState.cameraY + dy;
  applyCamera();
});
const endPan = (event) => {
  if (!panState || panState.pointerId !== event.pointerId) return;
  const moved = panState.moved;
  panState = null;
  elements.viewport.classList.remove("panning");
  if (!moved) { state.selected = null; state.pending = null; renderGraph(); }
};
elements.viewport.addEventListener("pointerup", endPan);
elements.viewport.addEventListener("pointercancel", endPan);
elements.viewport.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoomAt(event.clientX, event.clientY, camera.scale * Math.exp(-event.deltaY * .0015));
}, { passive: false });

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveCurrentProject();
    return;
  }
  if ((event.key === "Delete" || event.key === "Backspace") && !event.target.closest("input") && state.selected?.id) {
    if (state.selected.type === "node") deleteNode(state.selected.id); else deleteEdge(state.selected.id);
  }
  if (event.key === "Escape" && state.pending) { state.pending = null; renderGraph(); }
  if (!event.target.closest("input") && (event.key === "+" || event.key === "=")) zoomFromCenter(1.2);
  if (!event.target.closest("input") && event.key === "-") zoomFromCenter(1 / 1.2);
  if (!event.target.closest("input") && event.key === "0") centerGraph();
});
window.addEventListener("resize", () => { applyCamera(); drawEdges(); });
window.addEventListener("beforeunload", flushProjectDraft);

applyLanguage();
applyCamera();
setTimeout(centerGraph, 60);
