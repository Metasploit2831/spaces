import { Maximize2, X } from "lucide-react";
import { Space } from "../types/space";
import { IconButton } from "./ui";
import { SpaceCanvas } from "./SpaceCanvas";

type ViewCanvasModalProps = {
  space: Space;
  onChange: (space: Space) => void;
  onClose: () => void;
};

export function ViewCanvasModal({ space, onChange, onClose }: ViewCanvasModalProps) {
  return (
    <div className="fixed inset-0 z-[2147483645] bg-black/80 p-8 text-zinc-50" data-spaces-root>
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <header className="flex h-12 items-center gap-3 border-b border-zinc-800 px-4">
          <Maximize2 size={17} className="text-mint" />
          <div className="font-bold">{space.title}</div>
          <div className="ml-auto">
            <IconButton label="Close canvas view" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </div>
        </header>
        <SpaceCanvas space={space} onChange={onChange} expanded />
      </div>
    </div>
  );
}
