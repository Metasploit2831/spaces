import { GripHorizontal, Plus } from "lucide-react";
import { setSpacesPayload } from "../lib/dragPayload";
import { getPageSource } from "../lib/sourceMetadata";

type CapturePillProps = {
  text: string;
  x: number;
  y: number;
};

export function CapturePill({ text, x, y }: CapturePillProps) {
  return (
    <div
      data-spaces-root
      draggable
      onDragStart={(event) => {
        setSpacesPayload(event.dataTransfer, {
          type: "text",
          content: text,
          ...getPageSource(),
        });
      }}
      className="fixed z-[2147483646] inline-flex cursor-grab items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-[12px] font-bold text-zinc-50 shadow-2xl active:cursor-grabbing"
      style={{ left: x, top: y }}
    >
      <Plus size={14} className="text-zinc-100" />
      Add to Spaces
      <GripHorizontal size={14} className="text-zinc-500" />
    </div>
  );
}
