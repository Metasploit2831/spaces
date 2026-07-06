import { Group, MoreHorizontal, Scissors, Sparkles, Trash2 } from "lucide-react";
import { PointerEvent, useState } from "react";
import { SpaceGroup } from "../types/space";
import { Menu, MenuItem } from "@spaces/ui";

type GroupContainerProps = {
  group: SpaceGroup;
  itemCount: number;
  selected: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onMove: (dx: number, dy: number) => void;
  onAnalyze: () => void;
  onUngroup: () => void;
  onDelete: () => void;
};

export function GroupContainer({ group, itemCount, selected, onSelect, onRename, onMove, onAnalyze, onUngroup, onDelete }: GroupContainerProps) {
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
      className={`pointer-events-none absolute rounded-[24px] ${
        menuOpen || selected ? "z-[40]" : "z-[2]"
      }`}
      style={{ left: group.x, top: group.y, width: group.width, height: group.height }}
      onContextMenu={(event) => {
        event.preventDefault();
        onSelect();
        setMenuOpen(true);
      }}
    >
      <div className="absolute inset-[10px] rounded-[10px] border border-[#23252a] bg-[#0f1011]" />
      <div className="absolute inset-x-[18px] inset-y-[18px] rounded-[8px] border border-[#323334] bg-[#161718]" />
      <div
        className={`absolute inset-x-[14px] inset-y-[14px] rounded-[8px] border bg-[linear-gradient(180deg,rgba(22,23,24,0.95),rgba(15,16,17,0.92))] ${
          selected ? "border-[#5e6ad2]/65" : "border-[#23252a]"
        }`}
      />
      <div
        data-group-control
        className="pointer-events-auto absolute left-3 right-3 top-3 flex cursor-grab items-center gap-2 rounded-md border border-[#23252a] bg-[#161718] px-3 py-2 text-[12px] font-medium text-[#f7f8f8] shadow-[rgba(0,0,0,0.4)_0px_2px_4px_0px]"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={() => setDragStart(null)}
      >
        <Group size={14} className="text-[#e4f222]" />
        <input
          value={group.title}
          onChange={(event) => onRename(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-medium tracking-[-0.01em] text-[#f7f8f8] outline-none"
          aria-label="Group title"
        />
        <span className="rounded-[4px] bg-[#383b3f] px-2 py-1 text-[10px] font-medium text-[#8a8f98]">{itemCount}</span>
        <button className="rounded-md p-1 text-[#8a8f98] hover:bg-[#23252a] hover:text-[#f7f8f8]" onClick={() => setMenuOpen((value) => !value)}>
          <MoreHorizontal size={13} />
        </button>
        <button
          className="rounded-md p-1 text-[#8a8f98] hover:bg-[#23252a] hover:text-[#f7f8f8]"
          title="Analyze group"
          onClick={() => {
            onSelect();
            onAnalyze();
          }}
        >
          <Sparkles size={13} />
        </button>
      </div>
      {menuOpen ? (
        <Menu className="pointer-events-auto absolute right-3 top-14 z-[60] w-44">
          <MenuItem onClick={() => onRename(prompt("Rename group", group.title) || group.title)}>Rename group</MenuItem>
          <MenuItem onClick={onUngroup}><Scissors size={13} /> Ungroup</MenuItem>
          <MenuItem danger onClick={onDelete}><Trash2 size={13} /> Delete group</MenuItem>
        </Menu>
      ) : null}
    </div>
  );
}
