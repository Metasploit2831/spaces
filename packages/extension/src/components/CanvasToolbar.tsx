import { FileText, Trash2 } from "lucide-react";
import { IconButton } from "@spaces/ui";

type CanvasToolbarProps = {
  hasSelection: boolean;
  onAddText: () => void;
  onDelete: () => void;
};

export function CanvasToolbar({ hasSelection, onAddText, onDelete }: CanvasToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 border-y border-[#23252a] bg-[#08090a] px-3 py-2">
      <IconButton label="Add text note" onClick={onAddText}>
        <FileText size={15} />
      </IconButton>
      <IconButton label="Delete selected" onClick={onDelete} disabled={!hasSelection} className={!hasSelection ? "opacity-35" : ""}>
        <Trash2 size={15} />
      </IconButton>
      <div className="ml-auto rounded-full border border-[#23252a] bg-[#161718] px-2.5 py-1 text-[11px] font-medium text-[#8a8f98]">
        Paste Cmd + V
      </div>
    </div>
  );
}
