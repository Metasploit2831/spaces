import { Clipboard, FileText, Group, MousePointer2, Scissors, Trash2 } from "lucide-react";
import {
  ClipboardEvent as ReactClipboardEvent,
  CSSProperties,
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { fileToDataUrl, payloadsFromPaste } from "../lib/clipboard";
import { parseSpacesPayload } from "../lib/dragPayload";
import { computeBoundingBox, normalizeRect, rectsIntersect, Rect } from "../lib/geometry";
import { getPageSource, makeId, nowIso } from "../lib/sourceMetadata";
import { DraftPayload, Space, SpaceCard, SpaceGroup } from "../types/space";
import { CanvasToolbar } from "./CanvasToolbar";
import { CardNode } from "./CardNode";
import { GroupContainer } from "./GroupContainer";
import { Menu, MenuItem } from "./ui";

type SpaceCanvasProps = {
  space: Space;
  onChange: (space: Space) => void;
  expanded?: boolean;
};

function defaultSize(type: DraftPayload["type"]) {
  if (type === "image" || type === "screenshot") return { width: 190, height: 140 };
  if (type === "link") return { width: 180, height: 132 };
  if (type === "file" || type === "audio" || type === "video") return { width: 180, height: 118 };
  return { width: 180, height: 128 };
}

function cardFromPayload(spaceId: string, payload: DraftPayload, x: number, y: number): SpaceCard {
  const size = defaultSize(payload.type);
  return {
    id: makeId("card"),
    spaceId,
    type: payload.type,
    content: payload.content,
    src: payload.src,
    url: payload.url,
    fileName: payload.fileName,
    fileType: payload.fileType,
    fileSize: payload.fileSize,
    width: payload.width || size.width,
    height: payload.height || size.height,
    x,
    y,
    sourceUrl: payload.sourceUrl || getPageSource().sourceUrl,
    pageTitle: payload.pageTitle || getPageSource().pageTitle,
    createdAt: nowIso(),
  };
}

export function SpaceCanvas({ space, onChange, expanded = false }: SpaceCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const baseSelectionRef = useRef<string[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number } | null>(null);

  const selectedCards = useMemo(
    () => space.cards.filter((card) => selectedCardIds.includes(card.id)),
    [space.cards, selectedCardIds],
  );

  const update = useCallback(
    (next: Space) => onChange({ ...next, updatedAt: nowIso() }),
    [onChange],
  );

  const pointFromEvent = (event: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 24, y: 24 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left + canvas.scrollLeft,
      y: event.clientY - rect.top + canvas.scrollTop,
    };
  };

  const addPayloads = async (payloads: DraftPayload[], x: number, y: number) => {
    const cards = payloads.map((payload, index) => cardFromPayload(space.id, payload, x + index * 18, y + index * 18));
    update({ ...space, cards: [...space.cards, ...cards] });
    setSelectedCardIds(cards.map((card) => card.id));
  };

  const payloadsFromFiles = async (files: File[]): Promise<DraftPayload[]> => {
    return Promise.all(
      files.map(async (file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");
        return {
          type: isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "file",
          src: isImage ? await fileToDataUrl(file) : URL.createObjectURL(file),
          content: file.name,
          fileName: file.name,
          fileType: file.type || "Unknown file",
          fileSize: file.size,
          ...getPageSource(),
        };
      }),
    );
  };

  const addTextNote = () => {
    addPayloads([{ type: "text", content: "New note" }], 28, 34);
  };

  const deleteSelection = () => {
    if (!selectedCardIds.length && !selectedGroupId) return;
    const deleteIds = new Set(selectedCardIds);
    const groups = selectedGroupId
      ? space.groups.filter((group) => group.id !== selectedGroupId)
      : space.groups.map((group) => ({ ...group, cardIds: group.cardIds.filter((id) => !deleteIds.has(id)) }));
    update({
      ...space,
      cards: space.cards.filter((card) => !deleteIds.has(card.id)),
      groups,
    });
    setSelectedCardIds([]);
    setSelectedGroupId(null);
  };

  const groupSelected = () => {
    const bounds = computeBoundingBox(selectedCards);
    if (!bounds || selectedCards.length < 2) return;
    const orderedCards = [...selectedCards].sort((a, b) => {
      const first = space.cards.findIndex((card) => card.id === a.id);
      const second = space.cards.findIndex((card) => card.id === b.id);
      return first - second;
    });
    const stackX = Math.max(12, bounds.x + 18);
    const stackY = Math.max(42, bounds.y + 46);
    const offset = 14;
    const maxWidth = Math.max(...orderedCards.map((card) => card.width));
    const maxHeight = Math.max(...orderedCards.map((card) => card.height));
    const group: SpaceGroup = {
      id: makeId("group"),
      spaceId: space.id,
      title: "New Group",
      cardIds: orderedCards.map((card) => card.id),
      x: stackX - 18,
      y: stackY - 42,
      width: maxWidth + orderedCards.length * offset + 36,
      height: maxHeight + orderedCards.length * offset + 64,
      createdAt: nowIso(),
    };
    const stackedIds = new Set(group.cardIds);
    const nextCards = space.cards.map((card) => {
      const stackIndex = orderedCards.findIndex((item) => item.id === card.id);
      return stackedIds.has(card.id) ? { ...card, x: stackX + stackIndex * offset, y: stackY + stackIndex * offset } : card;
    });
    update({ ...space, cards: nextCards, groups: [...space.groups, group] });
    setSelectedGroupId(group.id);
    setSelectedCardIds(group.cardIds);
  };

  const ungroupSelected = () => {
    if (selectedGroupId) {
      update({ ...space, groups: space.groups.filter((group) => group.id !== selectedGroupId) });
      setSelectedGroupId(null);
      return;
    }
    if (!selectedCardIds.length) return;
    update({
      ...space,
      groups: space.groups.filter((group) => !group.cardIds.some((id) => selectedCardIds.includes(id))),
    });
  };

  const moveCards = (dx: number, dy: number, draggedId: string) => {
    const ids = new Set(selectedCardIds.includes(draggedId) ? selectedCardIds : [draggedId]);
    const nextCards = space.cards.map((card) => (ids.has(card.id) ? { ...card, x: card.x + dx, y: card.y + dy } : card));
    update({
      ...space,
      cards: nextCards,
      groups: space.groups.map((group) => {
        if (!group.cardIds.some((id) => ids.has(id))) return group;
        const bounds = computeBoundingBox(nextCards.filter((card) => group.cardIds.includes(card.id)));
        return bounds ? { ...group, ...bounds } : group;
      }),
    });
  };

  const moveGroup = (group: SpaceGroup, dx: number, dy: number) => {
    const ids = new Set(group.cardIds);
    const nextCards = space.cards.map((card) => (ids.has(card.id) ? { ...card, x: card.x + dx, y: card.y + dy } : card));
    const nextBounds = computeBoundingBox(nextCards.filter((card) => ids.has(card.id)));
    update({
      ...space,
      groups: space.groups.map((candidate) =>
        candidate.id === group.id && nextBounds ? { ...candidate, ...nextBounds } : candidate,
      ),
      cards: nextCards,
    });
  };

  const handleCanvasPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-card-node], [data-group-control], button, input, textarea, a")) return;
    const point = pointFromEvent(event);
    setCanvasMenu(null);
    baseSelectionRef.current = event.shiftKey ? selectedCardIds : [];
    setSelectionStart(point);
    setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 });
    setSelectedGroupId(null);
    if (!event.shiftKey) setSelectedCardIds([]);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCanvasPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!selectionStart) return;
    const point = pointFromEvent(event);
    const rect = normalizeRect(selectionStart.x, selectionStart.y, point.x, point.y);
    setSelectionRect(rect);
    const marqueeIds = space.cards
      .filter((card) => rectsIntersect(rect, { x: card.x, y: card.y, width: card.width, height: card.height }))
      .map((card) => card.id);
    setSelectedCardIds(Array.from(new Set([...baseSelectionRef.current, ...marqueeIds])));
  };

  const handleDrop = async (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const point = pointFromEvent(event);
    if (event.dataTransfer.files.length) {
      await addPayloads(await payloadsFromFiles(Array.from(event.dataTransfer.files)), point.x, point.y);
      return;
    }
    const payload = parseSpacesPayload(event.dataTransfer);
    if (payload) await addPayloads([payload], point.x, point.y);
  };

  const handlePaste = async (event: ReactClipboardEvent<HTMLDivElement>) => {
    const payloads = await payloadsFromPaste(event.nativeEvent);
    if (!payloads.length) return;
    event.preventDefault();
    await addPayloads(payloads, 28 + selectedCardIds.length * 12, 34 + selectedCardIds.length * 12);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const mod = event.metaKey || event.ctrlKey;
    if ((event.key === "Delete" || event.key === "Backspace") && selectedCardIds.length) deleteSelection();
    if (mod && event.key.toLowerCase() === "g" && !event.shiftKey) {
      event.preventDefault();
      groupSelected();
    }
    if (mod && event.shiftKey && event.key.toLowerCase() === "g") {
      event.preventDefault();
      ungroupSelected();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!expanded ? (
        <CanvasToolbar
          canGroup={selectedCardIds.length > 1}
          hasSelection={Boolean(selectedCardIds.length || selectedGroupId)}
          onAddText={addTextNote}
          onGroup={groupSelected}
          onUngroup={ungroupSelected}
          onDelete={deleteSelection}
        />
      ) : null}

      <div
        ref={canvasRef}
        tabIndex={0}
        className={`relative min-h-0 flex-1 overflow-auto outline-none transition ${
          dragOver ? "bg-[#11131a] ring-2 ring-inset ring-[#5e6ad2]/45" : "bg-[#08090a]"
        }`}
        onClick={() => canvasRef.current?.focus()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={() => {
          setSelectionStart(null);
          setSelectionRect(null);
          baseSelectionRef.current = [];
        }}
        onContextMenu={(event) => {
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          setCanvasMenu(pointFromEvent(event));
        }}
      >
        <div className={`relative ${expanded ? "h-[1180px] w-[1260px]" : "h-[860px] w-[860px]"}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_12%,rgba(94,106,210,0.18),transparent_18%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:auto,28px_28px,28px_28px]" />

          {space.cards.length === 0 ? (
            <div className="absolute left-8 top-8 max-w-[300px] rounded-md border border-[#23252a] bg-[#0f1011] p-5 text-[#f7f8f8] shadow-[rgba(0,0,0,0.4)_0px_2px_4px_0px]">
              <Clipboard className="mb-4 text-[#e4f222]" size={28} />
              <p className="text-[20px] font-medium tracking-[-0.01em]">Drop anything here or paste screenshots with Cmd + V</p>
              <p className="mt-3 text-sm font-normal text-[#8a8f98]">Text · Images · Links · Files · Screenshots</p>
            </div>
          ) : null}

          {space.groups.map((group) => (
            <GroupContainer
              key={group.id}
              group={group}
              itemCount={group.cardIds.length}
              selected={selectedGroupId === group.id}
              onSelect={() => {
                setSelectedGroupId(group.id);
                setSelectedCardIds(group.cardIds);
              }}
              onRename={(title) => update({ ...space, groups: space.groups.map((item) => (item.id === group.id ? { ...item, title } : item)) })}
              onMove={(dx, dy) => moveGroup(group, dx, dy)}
              onUngroup={() => {
                update({ ...space, groups: space.groups.filter((item) => item.id !== group.id) });
                setSelectedGroupId(null);
              }}
              onDelete={() => {
                const ids = new Set(group.cardIds);
                update({
                  ...space,
                  groups: space.groups.filter((item) => item.id !== group.id),
                  cards: space.cards.filter((card) => !ids.has(card.id)),
                });
                setSelectedCardIds([]);
                setSelectedGroupId(null);
              }}
            />
          ))}

          {space.cards.map((card, index) => (
            <CardNode
              key={card.id}
              card={card}
              selected={selectedCardIds.includes(card.id)}
              onSelect={(shift) => {
                setSelectedGroupId(null);
                setSelectedCardIds((ids) =>
                  shift ? (ids.includes(card.id) ? ids.filter((id) => id !== card.id) : [...ids, card.id]) : [card.id],
                );
              }}
              onDrag={moveCards}
              onUpdate={(updated) => update({ ...space, cards: space.cards.map((item) => (item.id === updated.id ? updated : item)) })}
              onDelete={() => {
                update({ ...space, cards: space.cards.filter((item) => item.id !== card.id) });
                setSelectedCardIds((ids) => ids.filter((id) => id !== card.id));
              }}
              onDuplicate={() => {
                const duplicated = { ...card, id: makeId("card"), x: card.x + 20, y: card.y + 20, createdAt: nowIso() };
                update({ ...space, cards: [...space.cards, duplicated] });
              }}
              onBringForward={() => {
                const cards = space.cards.filter((item) => item.id !== card.id);
                update({ ...space, cards: [...cards, card] });
              }}
              onSendBack={() => {
                const cards = space.cards.filter((item) => item.id !== card.id);
                update({ ...space, cards: [card, ...cards] });
              }}
            />
          ))}

          {selectionRect && selectionRect.width + selectionRect.height > 4 ? (
            <div
              className="pointer-events-none absolute z-40 rounded-md border border-[#5e6ad2]/70 bg-[#5e6ad2]/15"
              style={{ left: selectionRect.x, top: selectionRect.y, width: selectionRect.width, height: selectionRect.height }}
            />
          ) : null}

          {selectedCardIds.length > 1 ? (
            <div className="sticky left-4 top-3 z-50 inline-flex items-center gap-2 rounded-full border border-[#23252a] bg-[#161718] px-3 py-2 text-[12px] font-medium text-[#f7f8f8] shadow-[rgba(8,9,10,0.6)_0px_4px_32px_0px]">
              <MousePointer2 size={14} className="text-[#e4f222]" />
              {selectedCardIds.length} selected
              <button className="rounded-full bg-[#e4f222] px-2 py-1 text-[#08090a]" onClick={groupSelected}>
                <Group size={12} className="mr-1 inline" /> Group
              </button>
              <button className="rounded-full border border-[#23252a] bg-[#0f1011] px-2 py-1 text-[#d0d6e0]" onClick={ungroupSelected}>
                <Scissors size={12} className="mr-1 inline" /> Ungroup
              </button>
              <button className="rounded-full border border-[#3a2020] bg-[#241415] px-2 py-1 text-[#eb5757]" onClick={deleteSelection}>
                <Trash2 size={12} className="mr-1 inline" /> Delete
              </button>
              <span className="text-[#62666d]">Cmd/Ctrl + G</span>
            </div>
          ) : null}

          {canvasMenu ? (
            <Menu className="absolute z-50 w-44" style={{ left: canvasMenu.x, top: canvasMenu.y } as CSSProperties}>
              <MenuItem
                onClick={() =>
                  navigator.clipboard?.readText().then((text) => {
                    if (text) void addPayloads([{ type: "text", content: text }], canvasMenu.x, canvasMenu.y);
                  })
                }
              >
                <Clipboard size={13} /> Paste from clipboard
              </MenuItem>
              <MenuItem onClick={addTextNote}><FileText size={13} /> Create text note</MenuItem>
              <MenuItem onClick={() => setSelectedCardIds([])}><Scissors size={13} /> Clear selection</MenuItem>
            </Menu>
          ) : null}
        </div>
      </div>
    </div>
  );
}
