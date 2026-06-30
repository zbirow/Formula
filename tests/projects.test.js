import test from "node:test";
import assert from "node:assert/strict";
import { ProjectRepository, PROJECTS_STORAGE_KEY } from "../projects.js";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

function repository(storage = new MemoryStorage()) {
  let time = 100;
  let sequence = 0;
  return new ProjectRepository(storage, {
    defaultName: "Mój projekt",
    legacyGraph: { nodes: [{ id: "legacy" }], edges: [] },
    now: () => ++time,
    idFactory: () => `project-${++sequence}`
  });
}

test("dotychczasowa plansza zostaje zmigrowana do pierwszego projektu", () => {
  const storage = new MemoryStorage();
  const projects = repository(storage);
  assert.equal(projects.list().length, 1);
  assert.equal(projects.active().name, "Mój projekt");
  assert.equal(projects.workingGraph().nodes[0].id, "legacy");
  assert.ok(storage.getItem(PROJECTS_STORAGE_KEY));
});

test("szkic przeżywa ponowne otwarcie, a zapis zatwierdza wersję", () => {
  const storage = new MemoryStorage();
  const projects = repository(storage);
  const id = projects.active().id;
  projects.saveDraft(id, { nodes: [{ id: "draft" }], edges: [] });
  const reopened = new ProjectRepository(storage, { defaultName: "Mój projekt" });
  assert.equal(reopened.workingGraph().nodes[0].id, "draft");
  assert.equal(reopened.isDirty(), true);
  reopened.commit(id, reopened.workingGraph());
  assert.equal(reopened.isDirty(), false);
  assert.equal(reopened.active().graph.nodes[0].id, "draft");
});

test("projekty można tworzyć, przełączać, nazywać i usuwać", () => {
  const projects = repository();
  const original = projects.active().id;
  const second = projects.create("Drugi", { nodes: [], edges: [] });
  assert.equal(projects.active().id, second.id);
  projects.rename(second.id, "  Nowa nazwa  ");
  assert.equal(projects.active().name, "Nowa nazwa");
  assert.equal(projects.setActive(original), true);
  assert.equal(projects.remove(second.id), true);
  assert.equal(projects.list().length, 1);
  assert.equal(projects.remove(original), false);
});
