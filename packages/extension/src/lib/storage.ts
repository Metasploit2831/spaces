import { Space } from "../types/space";
import { makeId, nowIso } from "./sourceMetadata";

const SPACES_KEY = "spaces:v1";
const ACTIVE_KEY = "spaces:activeId";

function hasChromeStorage() {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

function chromeGet<T>(key: string, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => resolve((result[key] as T) ?? fallback));
  });
}

function chromeSet(values: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => chrome.storage.local.set(values, resolve));
}

export async function getSpaces(): Promise<Space[]> {
  if (hasChromeStorage()) return chromeGet<Space[]>(SPACES_KEY, []);
  const raw = localStorage.getItem(SPACES_KEY);
  return raw ? (JSON.parse(raw) as Space[]) : [];
}

export async function saveSpaces(spaces: Space[]) {
  if (hasChromeStorage()) return chromeSet({ [SPACES_KEY]: spaces });
  localStorage.setItem(SPACES_KEY, JSON.stringify(spaces));
}

export async function getActiveSpaceId() {
  if (hasChromeStorage()) return chromeGet<string | null>(ACTIVE_KEY, null);
  return localStorage.getItem(ACTIVE_KEY);
}

export async function setActiveSpaceId(id: string | null) {
  if (hasChromeStorage()) return chromeSet({ [ACTIVE_KEY]: id });
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function createSpace(): Space {
  const timestamp = nowIso();
  return {
    id: makeId("space"),
    title: "Untitled Space",
    cards: [],
    groups: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateSpace(spaces: Space[], updated: Space) {
  const next = { ...updated, updatedAt: nowIso() };
  return spaces.some((space) => space.id === updated.id)
    ? spaces.map((space) => (space.id === updated.id ? next : space))
    : [next, ...spaces];
}

export function deleteSpace(spaces: Space[], id: string) {
  return spaces.filter((space) => space.id !== id);
}

export function duplicateSpace(space: Space): Space {
  const timestamp = nowIso();
  const id = makeId("space");
  return {
    ...space,
    id,
    title: `${space.title} copy`,
    cards: space.cards.map((card) => ({ ...card, id: makeId("card"), spaceId: id })),
    groups: space.groups.map((group) => ({ ...group, id: makeId("group"), spaceId: id })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
