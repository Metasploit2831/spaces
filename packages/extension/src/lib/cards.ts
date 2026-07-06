import { DraftPayload, SpaceCard } from "../types/space";
import { detectPlatform } from "./platform";
import { getPageSource, makeId, nowIso } from "./sourceMetadata";

function defaultSize(type: DraftPayload["type"]) {
  if (type === "image" || type === "screenshot" || type === "element") return { width: 220, height: 180 };
  if (type === "link") return { width: 180, height: 132 };
  if (type === "file" || type === "audio" || type === "video") return { width: 180, height: 118 };
  return { width: 180, height: 128 };
}

export function cardFromPayload(spaceId: string, payload: DraftPayload): SpaceCard {
  const pageSource = getPageSource();
  const sourceUrl = payload.sourceUrl || pageSource.sourceUrl;
  const size = defaultSize(payload.type);
  const thumbnailUrl =
    payload.thumbnailUrl ||
    (payload.type === "image" || payload.type === "screenshot" || payload.type === "element" ? payload.src : pageSource.thumbnailUrl);

  return {
    id: makeId("card"),
    spaceId,
    type: payload.type,
    platform: payload.platform || detectPlatform(sourceUrl || payload.url),
    content: payload.content,
    src: payload.src,
    url: payload.url,
    thumbnailUrl,
    faviconUrl: payload.faviconUrl || pageSource.faviconUrl,
    links: payload.links,
    images: payload.images,
    fileName: payload.fileName,
    fileType: payload.fileType,
    fileSize: payload.fileSize,
    width: payload.width || size.width,
    height: payload.height || size.height,
    x: payload.x || 0,
    y: payload.y || 0,
    sourceUrl,
    pageTitle: payload.pageTitle || pageSource.pageTitle,
    createdAt: nowIso(),
  };
}
