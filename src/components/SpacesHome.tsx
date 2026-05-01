import { Copy, Edit3, FolderOpen, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { domainFromUrl, relativeTime } from "../lib/sourceMetadata";
import { Space } from "../types/space";
import { Button, IconButton, Input, Menu, MenuItem } from "./ui";

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
    <div className="relative h-20 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
      <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:18px_18px]" />
      {space.groups.slice(0, 2).map((group) => (
        <div
          key={group.id}
          className="absolute rounded border border-mint/40 bg-mint/15"
          style={{ left: group.x / 5, top: group.y / 5, width: group.width / 5, height: group.height / 5 }}
        />
      ))}
      {space.cards.slice(0, 5).map((card, index) => (
        <div
          key={card.id}
          className={`absolute rounded border border-zinc-600 shadow ${card.type === "text" ? "bg-amber/35" : card.type === "link" ? "bg-mint/35" : "bg-zinc-600"}`}
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
          <Search className="pointer-events-none absolute left-3 top-2.5 text-zinc-500" size={15} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search spaces" className="w-full pl-9" />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-5">
        <button
          onClick={onCreate}
          className="group flex w-full items-center gap-3 rounded-lg border border-dashed border-mint/50 bg-zinc-900 p-3 text-left transition hover:border-mint hover:bg-zinc-800"
        >
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-ink shadow-lg shadow-mint/15">
            <Plus size={22} />
          </div>
          <div>
            <p className="text-sm font-black text-zinc-50">Add New Space</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400">Start a blank canvas</p>
          </div>
        </button>

        {spaces.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-zinc-800 text-mint">
              <Plus size={24} />
            </div>
            <h2 className="text-xl font-black text-zinc-50">Create your first Space</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Capture ideas from anywhere on the web.</p>
            <Button className="mt-5" onClick={onCreate}>
              <Plus size={14} /> Add New Space
            </Button>
          </div>
        ) : null}

        {filtered.map((space) => (
          <article key={space.id} className="relative rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-zinc-50 shadow-xl transition hover:border-zinc-700 hover:bg-zinc-800">
            <Preview space={space} />
            <div className="mt-3 flex items-start gap-3">
              <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(space)}>
                <h3 className="truncate text-sm font-black">{space.title}</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Updated {relativeTime(space.updatedAt)} · {space.cards.length} items · {space.groups.length} groups
                </p>
                <p className="mt-1 truncate text-[11px] text-zinc-500">
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
