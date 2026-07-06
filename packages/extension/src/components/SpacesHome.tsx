import { Copy, Edit3, FolderOpen, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { domainFromUrl, relativeTime } from "../lib/sourceMetadata";
import { Space } from "../types/space";
import { Button, IconButton, Input, Menu, MenuItem } from "@spaces/ui";

type SpacesHomeProps = {
  spaces: Space[];
  onCreate: () => void;
  onOpen: (space: Space) => void;
  onRename: (space: Space, title: string) => void;
  onDuplicate: (space: Space) => void;
  onDelete: (space: Space) => void;
};

function Preview({ space }: { space: Space }) {
  return (
    <div className="relative h-20 overflow-hidden rounded-md border border-[#23252a] bg-[#0f1011]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(94,106,210,0.22),transparent_24%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:auto,18px_18px,18px_18px]" />
      {space.groups.slice(0, 2).map((group) => (
        <div
          key={group.id}
          className="absolute rounded-md border border-[#323334] bg-[#161718]"
          style={{ left: group.x / 5, top: group.y / 5, width: group.width / 5, height: group.height / 5 }}
        />
      ))}
      {space.cards.slice(0, 5).map((card, index) => (
        <div
          key={card.id}
          className={`absolute rounded-[4px] border border-[#323334] ${card.type === "text" ? "bg-[#23252a]" : card.type === "link" ? "bg-[#5e6ad2]/30" : "bg-[#161718]"}`}
          style={{ left: 8 + (card.x / 6) % 230, top: 8 + (card.y / 6) % 52, width: 32 + index * 3, height: 22 }}
        />
      ))}
    </div>
  );
}

export function SpacesHome({ spaces, onCreate, onOpen, onRename, onDuplicate, onDelete }: SpacesHomeProps) {
  const [query, setQuery] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const filtered = useMemo(
    () => spaces.filter((space) => space.title.toLowerCase().includes(query.toLowerCase())),
    [spaces, query],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 text-[#62666d]" size={15} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search spaces" className="w-full pl-9" />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-5">
        {spaces.length > 0 ? (
          <button
            onClick={onCreate}
            className="group flex w-full items-center gap-3 rounded-md border border-[#23252a] bg-[#161718] p-3 text-left transition hover:bg-[#23252a]"
          >
            <div className="grid h-11 w-11 place-items-center rounded-md border border-[#23252a] bg-[#0f1011] text-[#e4f222] transition group-hover:border-[#323334]">
              <Plus size={22} />
            </div>
            <div>
              <p className="text-[15px] font-medium tracking-[-0.01em] text-[#f7f8f8]">Add New Space</p>
              <p className="mt-0.5 text-xs font-normal text-[#8a8f98]">Start a blank canvas</p>
            </div>
          </button>
        ) : null}

        {spaces.length === 0 ? (
          <div className="rounded-md border border-[#23252a] bg-[#0f1011] p-5 shadow-[rgba(0,0,0,0.4)_0px_2px_4px_0px]">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-md border border-[#23252a] bg-[#161718] text-[#e4f222]">
              <Plus size={24} />
            </div>
            <h2 className="text-[24px] font-medium tracking-[-0.01em] text-[#f7f8f8]">Create your first Space</h2>
            <p className="mt-2 text-sm leading-6 text-[#8a8f98]">Capture ideas from anywhere on the web.</p>
            <Button className="mt-5" onClick={onCreate}>
              <Plus size={14} /> Add New Space
            </Button>
          </div>
        ) : null}

        {filtered.map((space) => (
          <article key={space.id} className="relative rounded-md border border-[#23252a] bg-[#0f1011] p-3 text-[#f7f8f8] shadow-[rgba(0,0,0,0.4)_0px_2px_4px_0px] transition hover:bg-[#161718]">
            <Preview space={space} />
            <div className="mt-3 flex items-start gap-3">
              <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(space)}>
                <h3 className="truncate text-[17px] font-medium tracking-[-0.01em]">{space.title}</h3>
                <p className="mt-1 text-xs text-[#8a8f98]">
                  Updated {relativeTime(space.updatedAt)} · {space.cards.length} items · {space.groups.length} groups
                </p>
                <p className="mt-1 truncate text-[11px] text-[#62666d]">
                  {domainFromUrl(space.cards[0]?.sourceUrl || space.cards[0]?.url)}
                </p>
              </button>
              <IconButton label="Space actions" onClick={() => setMenuId(menuId === space.id ? null : space.id)}>
                <MoreHorizontal size={15} />
              </IconButton>
            </div>
            {menuId === space.id ? (
              <Menu className="absolute right-3 top-28 z-40 w-36">
                <MenuItem onClick={() => onOpen(space)}><FolderOpen size={13} /> Open</MenuItem>
                <MenuItem onClick={() => onRename(space, prompt("Rename space", space.title) || space.title)}><Edit3 size={13} /> Rename</MenuItem>
                <MenuItem onClick={() => onDuplicate(space)}><Copy size={13} /> Duplicate</MenuItem>
                <MenuItem danger onClick={() => onDelete(space)}><Trash2 size={13} /> Delete</MenuItem>
              </Menu>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
