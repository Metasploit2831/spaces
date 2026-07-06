import { Maximize2, X } from "lucide-react";
import { Space } from "../types/space";
import { IconButton } from "@spaces/ui";
import { SpaceCanvas } from "./SpaceCanvas";

type ViewCanvasModalProps = {
  space: Space;
  onChange: (space: Space) => void;
  onClose: () => void;
};

export function ViewCanvasModal({ space, onChange, onClose }: ViewCanvasModalProps) {
  return (
    <div className="fixed inset-0 z-[2147483645] bg-[rgba(8,9,10,0.84)] p-8 text-[#f7f8f8]" data-spaces-root>
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[#23252a] bg-[#08090a] shadow-[rgba(8,9,10,0.6)_0px_4px_32px_0px]">
        <header className="flex h-14 items-center gap-3 border-b border-[#23252a] bg-[#0f1011] px-4">
          <Maximize2 size={17} className="text-[#e4f222]" />
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
