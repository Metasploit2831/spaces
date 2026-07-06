import {
  Archive,
  Copy,
  Edit3,
  FolderOpen,
  Grid2X2,
  Layers3,
  MoreHorizontal,
  Plus,
  Search,
  Shapes,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button, IconButton, Input, Menu, MenuItem } from "./ui";

export type GallerySpace = {
  id: string;
  title: string;
  saveCount: number;
  updatedLabel: string;
  sourceLabel: string;
  previewUrls: string[];
};

export type SpacesGalleryProps = {
  spaces: GallerySpace[];
  query: string;
  onQueryChange: (query: string) => void;
  onCreate: () => void;
  onOpen: (spaceId: string) => void;
  onRename: (spaceId: string) => void;
  onDuplicate: (spaceId: string) => void;
  onDelete: (spaceId: string) => void;
};

const navItems = [
  { label: "Library", Icon: Grid2X2 },
  { label: "Collections", Icon: Layers3 },
  { label: "Spaces", Icon: Shapes },
];

const filters = ["All Bookmarks", "Unsorted", "Trash"];

function PreviewTile({ src, index }: { src?: string; index: number }) {
  if (src) {
    return <img src={src} alt="" className="h-full w-full rounded-md object-cover" draggable={false} />;
  }

  const variants = [
    "bg-[linear-gradient(135deg,#24262a,#0d0f10_58%,#4c5bd8)]",
    "bg-[radial-gradient(circle_at_30%_25%,#e4f222_0,#e4f222_18%,transparent_19%),linear-gradient(145deg,#1d1f22,#0b0c0d)]",
    "bg-[linear-gradient(160deg,#2c3034,#111315),repeating-linear-gradient(90deg,transparent_0,transparent_8px,rgba(255,255,255,0.06)_9px)]",
    "bg-[radial-gradient(circle_at_70%_22%,#8fb4ff_0,#8fb4ff_16%,transparent_17%),linear-gradient(135deg,#202326,#0f1011)]",
  ];

  return (
    <div className={`h-full w-full rounded-md border border-white/5 ${variants[index % variants.length]}`}>
      <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:18px_18px]" />
    </div>
  );
}

function SpaceCard({
  space,
  menuOpen,
  onMenu,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: {
  space: GallerySpace;
  menuOpen: boolean;
  onMenu: () => void;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const previewSlots = [0, 1, 2, 3].map((index) => space.previewUrls[index]);

  return (
    <article className="relative break-inside-avoid rounded-lg border border-[#24262a] bg-[#111315] p-2.5 text-[#f7f8f8] shadow-[rgba(0,0,0,0.32)_0px_10px_36px_0px] transition hover:border-[#35383d] hover:bg-[#151719]">
      <button className="block w-full text-left" onClick={onOpen}>
        <div className="grid h-[188px] grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-md bg-[#090a0b] p-2">
          {previewSlots.map((src, index) => (
            <PreviewTile key={`${space.id}-${index}`} src={src} index={index} />
          ))}
        </div>
      </button>
      <div className="mt-3 flex items-start gap-2 px-0.5 pb-0.5">
        <button className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <h3 className="truncate text-[15px] font-semibold text-[#f7f8f8]">{space.title}</h3>
          <p className="mt-1 text-[12px] text-[#8a8f98]">{space.saveCount} saves</p>
          <p className="mt-1 truncate text-[11px] text-[#62666d]">
            {space.updatedLabel} · {space.sourceLabel}
          </p>
        </button>
        <IconButton label="Space actions" onClick={onMenu} className="h-7 w-7 border-transparent bg-transparent">
          <MoreHorizontal size={15} />
        </IconButton>
      </div>

      {menuOpen ? (
        <Menu className="absolute right-3 top-36 z-40 w-36">
          <MenuItem onClick={onOpen}><FolderOpen size={13} /> Open</MenuItem>
          <MenuItem onClick={onRename}><Edit3 size={13} /> Rename</MenuItem>
          <MenuItem onClick={onDuplicate}><Copy size={13} /> Duplicate</MenuItem>
          <MenuItem danger onClick={onDelete}><Trash2 size={13} /> Delete</MenuItem>
        </Menu>
      ) : null}
    </article>
  );
}

export function SpacesGallery({
  spaces,
  query,
  onQueryChange,
  onCreate,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: SpacesGalleryProps) {
  const [activeNav, setActiveNav] = useState("Library");
  const [activeFilter, setActiveFilter] = useState("All Bookmarks");
  const [menuId, setMenuId] = useState<string | null>(null);
  const filtered = useMemo(
    () => spaces.filter((space) => space.title.toLowerCase().includes(query.toLowerCase())),
    [spaces, query],
  );

  return (
    <div className="flex min-h-0 flex-1 bg-[#08090a] text-[#f7f8f8]">
      <aside className="hidden w-[112px] shrink-0 border-r border-[#202226] bg-[#0b0c0d] px-3 py-4 min-[560px]:block">
        <div className="grid h-9 w-9 place-items-center rounded-md border border-[#2b2e33] bg-[#151719] text-[#e4f222]">
          <Archive size={18} />
        </div>
        <nav className="mt-6 space-y-1">
          {navItems.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              className={`flex w-full flex-col items-center gap-1 rounded-md px-2 py-2.5 text-[10px] font-medium transition ${
                activeNav === label ? "bg-[#191b1e] text-[#f7f8f8]" : "text-[#747982] hover:bg-[#141618] hover:text-[#d0d6e0]"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-[#202226] bg-[#08090a] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-[24px] font-semibold leading-none text-[#f7f8f8]">Library</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`h-7 rounded-md px-2.5 text-[12px] font-medium transition ${
                      activeFilter === filter ? "bg-[#f7f8f8] text-[#08090a]" : "bg-[#151719] text-[#8a8f98] hover:text-[#f7f8f8]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={onCreate} className="shrink-0">
              <Plus size={14} /> Add
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-[#62666d]" size={15} />
              <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search library" className="w-full pl-9" />
            </div>
            <button className="h-9 shrink-0 rounded-md border border-[#24262a] bg-[#151719] px-3 text-[12px] font-medium text-[#d0d6e0]">
              Most recent
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
          {spaces.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-[#2b2e33] bg-[#0d0f10] p-6 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-md border border-[#2b2e33] bg-[#151719] text-[#e4f222]">
                  <Plus size={24} />
                </div>
                <h2 className="mt-4 text-[22px] font-semibold">Create your first Space</h2>
                <p className="mt-2 text-[13px] leading-6 text-[#8a8f98]">Capture references, screenshots, links, and notes into one visual library.</p>
                <Button className="mt-5" onClick={onCreate}>
                  <Plus size={14} /> Add
                </Button>
              </div>
            </div>
          ) : (
            <div className="columns-1 gap-3 min-[520px]:columns-2 min-[900px]:columns-3">
              {filtered.map((space) => (
                <div key={space.id} className="mb-3">
                  <SpaceCard
                    space={space}
                    menuOpen={menuId === space.id}
                    onMenu={() => setMenuId(menuId === space.id ? null : space.id)}
                    onOpen={() => onOpen(space.id)}
                    onRename={() => onRename(space.id)}
                    onDuplicate={() => onDuplicate(space.id)}
                    onDelete={() => onDelete(space.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
