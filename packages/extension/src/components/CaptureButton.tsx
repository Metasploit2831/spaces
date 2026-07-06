import { Plus } from "lucide-react";
import { setSpacesPayload } from "../lib/dragPayload";
import { getPageSource } from "../lib/sourceMetadata";
import { DraftPayload } from "../types/space";

type CaptureButtonProps = {
  x: number;
  y: number;
  payload: DraftPayload;
};

export function CaptureButton({ x, y, payload }: CaptureButtonProps) {
  return (
    <button
      data-spaces-root
      draggable
      onDragStart={(event) => {
        event.stopPropagation();
        setSpacesPayload(event.dataTransfer, { ...payload, ...getPageSource() });
      }}
      className="fixed z-[2147483646] grid h-8 w-8 cursor-grab place-items-center rounded-md border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl transition hover:scale-105 active:cursor-grabbing"
      style={{ left: x, top: y }}
      title="Add to Spaces"
      aria-label="Add to Spaces"
    >
      <Plus size={16} />
    </button>
  );
}
