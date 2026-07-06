import { ClipboardEvent as ReactClipboardEvent, DragEvent as ReactDragEvent, KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BookmarkGallery, BookmarkGalleryItem } from "@spaces/ui";
import { fileToDataUrl, payloadsFromPaste } from "../lib/clipboard";
import { cardFromPayload } from "../lib/cards";
import { parseSpacesPayload } from "../lib/dragPayload";
import { domainFromUrl, getPageSource, nowIso, relativeTime } from "../lib/sourceMetadata";
import { DraftPayload, Space, SpaceCard } from "../types/space";

type SpaceCanvasProps = {
  space: Space;
  onChange: (space: Space) => void;
  expanded?: boolean;
};

function toGalleryItem(card: SpaceCard): BookmarkGalleryItem {
  const captures = [card.thumbnailUrl, card.src].filter((value): value is string => Boolean(value));
  return {
    id: card.id,
    type: card.type,
    title: card.pageTitle || card.content || card.fileName || card.url || "Saved item",
    body: card.content,
    url: card.url || card.sourceUrl,
    thumbnailUrl: card.thumbnailUrl || (card.type === "image" || card.type === "screenshot" || card.type === "element" ? card.src : undefined),
    captures: card.captures || (captures.length ? captures : undefined),
    faviconUrl: card.faviconUrl,
    platform: card.platform,
    sourceDomain: domainFromUrl(card.sourceUrl || card.url),
    relativeTime: relativeTime(card.createdAt),
  };
}

export function SpaceCanvas({ space, onChange }: SpaceCanvasProps) {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [captureElementActive, setCaptureElementActive] = useState(false);

  const update = useCallback(
    (next: Space) => onChange({ ...next, updatedAt: nowIso() }),
    [onChange],
  );

  const galleryItems = useMemo(
    () => [...space.cards].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(toGalleryItem),
    [space.cards],
  );

  const addPayloads = async (payloads: DraftPayload[]) => {
    const cards = payloads.map((payload) => cardFromPayload(space.id, payload));
    update({ ...space, cards: [...cards, ...space.cards] });
    setSelectedCardIds(cards.map((card) => card.id));
  };

  const payloadsFromFiles = async (files: File[]): Promise<DraftPayload[]> => {
    return Promise.all(
      files.map(async (file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");
        const imageDataUrl = isImage ? await fileToDataUrl(file) : undefined;
        return {
          ...getPageSource(),
          type: isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "file",
          src: imageDataUrl || URL.createObjectURL(file),
          thumbnailUrl: imageDataUrl,
          content: file.name,
          fileName: file.name,
          fileType: file.type || "Unknown file",
          fileSize: file.size,
        };
      }),
    );
  };

  const addTextNote = () => {
    void addPayloads([{ type: "text", content: "New note" }]);
  };

  const deleteSelection = () => {
    if (!selectedCardIds.length) return;
    const deleteIds = new Set(selectedCardIds);
    update({ ...space, cards: space.cards.filter((card) => !deleteIds.has(card.id)) });
    setSelectedCardIds([]);
  };

  const handleDrop = async (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length) {
      await addPayloads(await payloadsFromFiles(Array.from(event.dataTransfer.files)));
      return;
    }
    const payload = parseSpacesPayload(event.dataTransfer);
    if (payload) await addPayloads([payload]);
  };

  const handlePaste = async (event: ReactClipboardEvent<HTMLDivElement>) => {
    const payloads = await payloadsFromPaste(event.nativeEvent);
    if (!payloads.length) return;
    event.preventDefault();
    await addPayloads(payloads);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((event.key === "Delete" || event.key === "Backspace") && selectedCardIds.length) deleteSelection();
  };

  useEffect(() => {
    const started = () => setCaptureElementActive(true);
    const ended = () => setCaptureElementActive(false);
    window.addEventListener("spaces:element-capture-started", started);
    window.addEventListener("spaces:element-capture-ended", ended);
    return () => {
      window.removeEventListener("spaces:element-capture-started", started);
      window.removeEventListener("spaces:element-capture-ended", ended);
    };
  }, []);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col outline-none"
      tabIndex={0}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
    >
      <BookmarkGallery
        title={space.title}
        items={galleryItems}
        selectedIds={selectedCardIds}
        dragActive={dragOver}
        captureElementActive={captureElementActive}
        onAddText={addTextNote}
        onCaptureElement={() => window.dispatchEvent(new CustomEvent("spaces:start-element-capture"))}
        onDeleteSelected={deleteSelection}
        onSelect={(id, multi) => {
          setSelectedCardIds((ids) => (multi ? (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]) : [id]));
        }}
        onOpen={(item) => {
          if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
        }}
      />
    </div>
  );
}
