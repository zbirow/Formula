export const PROJECTS_STORAGE_KEY = "formula-flow.projects.v1";

const clone = (value) => JSON.parse(JSON.stringify(value));
const isGraph = (value) => value && Array.isArray(value.nodes) && Array.isArray(value.edges);

function cleanName(name, fallback) {
  const value = String(name || "").trim().replace(/\s+/g, " ");
  return value.slice(0, 80) || fallback;
}

export class ProjectRepository {
  constructor(storage, options = {}) {
    this.storage = storage;
    this.now = options.now || (() => Date.now());
    this.idFactory = options.idFactory || (() => `project-${this.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`);
    this.defaultName = options.defaultName || "Untitled project";
    this.emptyGraph = isGraph(options.emptyGraph) ? clone(options.emptyGraph) : { nodes: [], edges: [] };
    this.data = this.read();
    if (!this.data) {
      const graph = isGraph(options.legacyGraph) ? options.legacyGraph : this.emptyGraph;
      const project = this.makeProject(this.defaultName, graph);
      this.data = { version: 1, activeProjectId: project.id, projects: [project], drafts: {} };
      this.persist();
    }
    this.repair();
  }

  read() {
    try {
      const data = JSON.parse(this.storage.getItem(PROJECTS_STORAGE_KEY));
      return data && Array.isArray(data.projects) ? data : null;
    } catch { return null; }
  }

  makeProject(name, graph) {
    const timestamp = this.now();
    return { id: this.idFactory(), name: cleanName(name, this.defaultName), createdAt: timestamp, updatedAt: timestamp, graph: clone(graph) };
  }

  repair() {
    this.data.projects = this.data.projects.filter((project) => project?.id && isGraph(project.graph));
    if (!this.data.projects.length) this.data.projects.push(this.makeProject(this.defaultName, this.emptyGraph));
    if (!this.data.projects.some((project) => project.id === this.data.activeProjectId)) this.data.activeProjectId = this.data.projects[0].id;
    if (!this.data.drafts || typeof this.data.drafts !== "object") this.data.drafts = {};
    this.persist();
  }

  persist() {
    this.storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(this.data));
  }

  list() {
    return [...this.data.projects].sort((a, b) => b.updatedAt - a.updatedAt).map(({ graph, ...project }) => ({ ...clone(project), dirty: Boolean(this.data.drafts[project.id]) }));
  }

  active() {
    return this.data.projects.find((project) => project.id === this.data.activeProjectId);
  }

  workingGraph(projectId = this.data.activeProjectId) {
    const project = this.data.projects.find((item) => item.id === projectId);
    if (!project) return clone(this.emptyGraph);
    return clone(this.data.drafts[projectId]?.graph || project.graph);
  }

  isDirty(projectId = this.data.activeProjectId) {
    return Boolean(this.data.drafts[projectId]);
  }

  saveDraft(projectId, graph) {
    if (!this.data.projects.some((project) => project.id === projectId) || !isGraph(graph)) return;
    this.data.drafts[projectId] = { graph: clone(graph), updatedAt: this.now() };
    this.persist();
  }

  commit(projectId, graph) {
    const project = this.data.projects.find((item) => item.id === projectId);
    if (!project || !isGraph(graph)) return null;
    project.graph = clone(graph);
    project.updatedAt = this.now();
    delete this.data.drafts[projectId];
    this.persist();
    return clone(project);
  }

  create(name, graph = this.emptyGraph) {
    const project = this.makeProject(name, graph);
    this.data.projects.push(project);
    this.data.activeProjectId = project.id;
    this.persist();
    return clone(project);
  }

  setActive(projectId) {
    if (!this.data.projects.some((project) => project.id === projectId)) return false;
    this.data.activeProjectId = projectId;
    this.persist();
    return true;
  }

  rename(projectId, name) {
    const project = this.data.projects.find((item) => item.id === projectId);
    if (!project) return null;
    project.name = cleanName(name, project.name);
    project.updatedAt = this.now();
    this.persist();
    return clone(project);
  }

  remove(projectId) {
    if (this.data.projects.length <= 1) return false;
    const index = this.data.projects.findIndex((project) => project.id === projectId);
    if (index < 0) return false;
    this.data.projects.splice(index, 1);
    delete this.data.drafts[projectId];
    if (this.data.activeProjectId === projectId) this.data.activeProjectId = this.list()[0].id;
    this.persist();
    return true;
  }
}
