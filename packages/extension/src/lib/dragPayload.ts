import { DraftPayload } from "../types/space";

export const SPACES_MIME = "application/x-spaces-card";

export function setSpacesPayload(dataTransfer: DataTransfer, payload: DraftPayload) {
  dataTransfer.effectAllowed = "copy";
  dataTransfer.setData(SPACES_MIME, JSON.stringify(payload));
  if (payload.content) dataTransfer.setData("text/plain", payload.content);
  if (payload.url) dataTransfer.setData("text/uri-list", payload.url);
}

export function parseSpacesPayload(dataTransfer: DataTransfer): DraftPayload | null {
  const custom = dataTransfer.getData(SPACES_MIME);
  if (custom) {
    try {
      return JSON.parse(custom) as DraftPayload;
    } catch {
      return null;
    }
  }

  const uri = dataTransfer.getData("text/uri-list");
  if (uri) return { type: "link", url: uri, content: uri };

  const text = dataTransfer.getData("text/plain");
  if (text) {
    const maybeUrl = /^https?:\/\//i.test(text.trim());
    return maybeUrl ? { type: "link", url: text.trim(), content: text.trim() } : { type: "text", content: text };
  }

  return null;
}
