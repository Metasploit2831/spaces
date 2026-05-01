import { AudioLines, Copy, File, FileImage, Film, Image, Link2, LucideIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { CSSProperties, PointerEvent, useState } from "react";
import { formatBytes, domainFromUrl, relativeTime } from "../lib/sourceMetadata";
import { SpaceCard } from "../types/space";
import { Menu, MenuItem } from "./ui";

type CardNodeProps = {
  card: SpaceCard;
  selected: boolean;
  onSelect: (shift: boolean) => void;
  onDrag: (dx: number, dy: number, id: string) => void;
  onUpdate: (card: SpaceCard) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBack: () => void;
};

function typeBadge(card: SpaceCard): [string, LucideIcon] {
  if (card.type === "screenshot") return ["Screenshot", FileImage];
  if (card.type === "image") return ["Image", Image];
  if (card.type === "link") return ["Link", Link2];
  if (card.type === "video") return ["Video", Film];
  if (card.type === "audio") return ["Audio", AudioLines];
  if (card.type === "file") return ["File", File];
  return ["Note", Copy];
}

export function CardNode({
  card,
  selected,
  onSelect,
  onDrag,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBack,
}: CardNodeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [badge, BadgeIcon] = typeBadge(card);

  const style: CSSProperties = {
    transform: `translate(${card.x}px, ${card.y}px)`,
    width: card.width,
    minHeight: card.height,
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button,textarea,input,a")) return;
    onSelect(event.shiftKey);
    setDragStart({ x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;
    if (Math.abs(dx) + Math.abs(dy) > 0) {
      onDrag(dx, dy, card.id);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  return (
    <div
      data-card-node
      className={`absolute left-0 top-0 z-10 cursor-grab select-none rounded-lg border bg-zinc-900 text-zinc-50 shadow-xl transition ${
        selected ? "border-mint shadow-glow" : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
      } ${card.type === "text" ? "bg-[#29251b]" : ""}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragStart(null)}
      onContextMenu={(event) => {
        event.preventDefault();
        setMenuOpen(true);
        onSelect(false);
      }}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-2.5 py-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-300">
          <BadgeIcon size={12} /> {badge}
        </span>
        <button className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50" onClick={() => setMenuOpen((value) => !value)}>
          <MoreHorizontal size={15} />
        </button>
      </div>

      {(card.type === "image" || card.type === "screenshot") && card.src ? (
        <img className="max-h-44 w-full object-cover" src={card.src} alt={card.content || "Captured visual"} />
      ) : null}

      {card.type === "text" ? (
        <textarea
          value={card.content || ""}
          onChange={(event) => onUpdate({ ...card, content: event.target.value })}
          className="min-h-[88px] w-full resize-y bg-transparent p-3 text-[13px] leading-5 text-[#fff4d2] outline-none placeholder:text-zinc-500"
          placeholder="Write a note..."
        />
      ) : card.type === "link" ? (
        <a href={card.url} target="_blank" className="block p-3" rel="noreferrer">
          <div className="mb-2 grid h-8 w-8 place-items-center rounded bg-mint/15 text-mint">
            <Link2 size={16} />
          </div>
          <p className="line-clamp-3 text-sm font-bold leading-5">{card.content || card.url}</p>
          <p className="mt-2 text-xs text-mint/75">{domainFromUrl(card.url)}</p>
        </a>
      ) : card.type === "file" || card.type === "audio" || card.type === "video" ? (
        <div className="p-3">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded bg-zinc-800 text-zinc-300">
            {card.type === "audio" ? <AudioLines size={18} /> : card.type === "video" ? <Film size={18} /> : <File size={18} />}
          </div>
          <p className="line-clamp-2 text-sm font-bold">{card.fileName || card.content || card.url || "Captured file"}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {card.fileType || domainFromUrl(card.url || card.sourceUrl)} {card.fileSize ? `· ${formatBytes(card.fileSize)}` : ""}
          </p>
        </div>
      ) : card.src ? null : (
        <div className="p-3 text-sm font-bold">{card.content || "Captured item"}</div>
      )}

      <div className="flex items-center justify-between border-t border-zinc-800 px-2.5 py-2 text-[11px] text-zinc-400">
        <span>{domainFromUrl(card.sourceUrl || card.url)}</span>
        <span>{relativeTime(card.createdAt)}</span>
      </div>

      {menuOpen ? (
        <Menu className="absolute right-2 top-9 z-50 w-40">
          <MenuItem onClick={onDuplicate}><Copy size={13} /> Duplicate</MenuItem>
          <MenuItem onClick={() => navigator.clipboard?.writeText(card.sourceUrl || card.url || "")}>Copy source URL</MenuItem>
          <MenuItem onClick={onBringForward}>Bring to front</MenuItem>
          <MenuItem onClick={onSendBack}>Send to back</MenuItem>
          <MenuItem danger onClick={onDelete}><Trash2 size={13} /> Delete</MenuItem>
        </Menu>
      ) : null}
    </div>
  );
}
