import { Group, MoreHorizontal, Scissors, Sparkles, Trash2 } from "lucide-react";
import { PointerEvent, useState } from "react";
import { SpaceGroup } from "../types/space";
import { Menu, MenuItem } from "./ui";

type GroupContainerProps = {
  group: SpaceGroup;
  itemCount: number;
  selected: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onMove: (dx: number, dy: number) => void;
  onUngroup: () => void;
  onDelete: () => void;
};

export function GroupContainer({ group, itemCount, selected, onSelect, onRename, onMove, onUngroup, onDelete }: GroupContainerProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("input,button")) return;
    onSelect();
    setDragStart({ x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    onMove(event.clientX - dragStart.x, event.clientY - dragStart.y);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  return (
    <div
      data-group-node
      className={`absolute z-[1] rounded-lg border bg-[#10251f] shadow-[0_18px_46px_rgba(0,0,0,0.22)] ${
        selected ? "border-mint/80" : "border-mint/35"
      }`}
      style={{ left: group.x, top: group.y, width: group.width, height: group.height }}
      onContextMenu={(event) => {
        event.preventDefault();
        onSelect();
        setMenuOpen(true);
      }}
    >
      <div
        data-group-control
        className="pointer-events-auto absolute left-2 top-2 flex cursor-grab items-center gap-1.5 rounded-md border border-mint/35 bg-zinc-900 px-2 py-1 text-[12px] font-bold text-zinc-50 shadow-lg"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={() => setDragStart(null)}
      >
        <Group size={13} className="text-mint" />
        <input
          value={group.title}
          onChange={(event) => onRename(event.target.value)}
          className="w-24 bg-transparent outline-none"
          aria-label="Group title"
        />
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-black text-zinc-300">{itemCount}</span>
        <button className="rounded p-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50" onClick={() => setMenuOpen((value) => !value)}>
          <MoreHorizontal size={13} />
        </button>
        <button className="rounded p-0.5 text-amber/70 opacity-55" disabled title="Analyze group">
          <Sparkles size={13} />
        </button>
      </div>
      {menuOpen ? (
        <Menu className="absolute left-2 top-10 z-50 w-40">
          <MenuItem onClick={() => onRename(prompt("Rename group", group.title) || group.title)}>Rename group</MenuItem>
          <MenuItem onClick={onUngroup}><Scissors size={13} /> Ungroup</MenuItem>
          <MenuItem danger onClick={onDelete}><Trash2 size={13} /> Delete group</MenuItem>
        </Menu>
      ) : null}
    </div>
  );
}
