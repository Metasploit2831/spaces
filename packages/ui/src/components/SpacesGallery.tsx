import {
  ChevronDown,
  Command,
  Compass,
  Copy,
  Edit3,
  FolderOpen,
  Grid2X2,
  Maximize2,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { IconButton, Menu, MenuItem } from "./ui";

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

const filters = ["All", "Saved", "Unsorted", "Trash"] as const;

function AppLogo() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#141416]">
      <div className="h-3.5 w-3.5 rounded-[4px] bg-[#e4f222]" />
    </div>
  );
}

function SafeImage({ src, alt = "", className }: { src?: string; alt?: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img src={src} alt={alt} className={className} draggable={false} onError={() => setFailed(true)} />;
}

function CommandPalette({
  open,
  onClose,
  query,
  onQueryChange,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  onCreate: () => void;
}) {
  if (!open) return null;
  const commands = [
    ["New collection", "⌘N", undefined],
    ["New space", "⌘⇧N", onCreate],
    ["Capture screenshot", "⌘⇧S", undefined],
    ["Rediscover", "⌘⇧R", undefined],
    ["Go to library", "⌘1", undefined],
    ["Go to collections", "⌘2", undefined],
    ["Go to spaces", "⌘3", undefined],
    ["Toggle theme", "", undefined],
  ] as const;
  return (
    <div className="fixed inset-0 z-[2147483647] grid place-items-start bg-black/48 px-4 pt-[14vh]" onClick={onClose}>
      <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.10)] bg-[#101012]" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-14 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-4">
          <Search size={17} className="text-[#8A8F98]" />
          <input
            autoFocus
            placeholder="Search or run a command..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#F5F6F7] outline-none placeholder:text-[#8A8F98]"
          />
        </div>
        <div className="p-2">
          {commands.map(([label, shortcut, action]) => (
            <button
              key={label}
              className="flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[13px] text-[#D0D3D7] hover:bg-[#1A1B1D] hover:text-[#F5F6F7]"
              onClick={() => {
                action?.();
                onClose();
              }}
            >
              <Command size={14} className="text-[#8A8F98]" />
              <span className="flex-1">{label}</span>
              {shortcut ? <span className="text-[11px] text-[#8A8F98]">{shortcut}</span> : null}
            </button>
          ))}
        </div>
        <footer className="flex items-center gap-4 border-t border-[rgba(255,255,255,0.06)] px-4 py-2 text-[11px] text-[#8A8F98]">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>&gt; commands only</span>
        </footer>
      </div>
    </div>
  );
}

function PreviewMosaic({ urls }: { urls: string[] }) {
  const slots = [0, 1, 2, 3].map((index) => urls[index]);
  return (
    <div className="grid aspect-[4/5] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-[16px] bg-[#141416]">
      {slots.map((url, index) =>
        url ? (
          <SafeImage key={`${url}-${index}`} src={url} className="h-full w-full object-cover" />
        ) : (
          <div key={index} className="bg-[#1A1B1D]" />
        ),
      )}
    </div>
  );
}

function SpaceCollectionCard({
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
  return (
    <article className="relative mb-[14px] inline-block w-full break-inside-avoid align-top">
      <button className="group relative block w-full pb-12 text-left" onClick={onOpen}>
        <div className="absolute left-3 right-3 top-3 aspect-[4/5] rotate-[-4deg] rounded-[16px] bg-[#1A1B1D]" />
        <div className="absolute left-2 right-2 top-2 aspect-[4/5] rotate-[3deg] rounded-[16px] bg-[#222226]" />
        <div className="relative">
          <PreviewMosaic urls={space.previewUrls} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2 pt-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[13px] font-medium text-[#F5F6F7]">{space.title}</h3>
            <p className="mt-0.5 text-[12px] text-[#8A8F98]">{space.saveCount} saves</p>
          </div>
        </div>
      </button>
      <IconButton label="Space actions" onClick={onMenu} className="absolute bottom-2 right-0 h-7 w-7">
        <MoreHorizontal size={15} />
      </IconButton>
      {menuOpen ? (
        <Menu className="absolute right-0 top-8 z-40 w-36">
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
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [density, setDensity] = useState(3);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const filtered = useMemo(
    () => spaces.filter((space) => space.title.toLowerCase().includes(query.toLowerCase())),
    [spaces, query],
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const columnWidth = [240, 210, 180, 150][density] || 180;

  return (
    <div data-spaces-gallery className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0A0A0B] text-[#F5F6F7]">
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} query={query} onQueryChange={onQueryChange} onCreate={onCreate} />
      <header className="shrink-0 border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
        <div className="spaces-app-topbar grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AppLogo />
            <button className="flex min-w-0 items-center gap-1 truncate text-[14px] font-medium">
              Library <ChevronDown size={14} className="text-[#8A8F98]" />
            </button>
          </div>
          <nav className="spaces-segmented mx-auto flex h-10 items-center rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111113] p-1">
            <Search size={15} className="mx-2 text-[#8A8F98]" />
            {["Library", "Collections", "Spaces"].map((segment, index) => (
              <button key={segment} className={`h-8 rounded-full px-3 text-[12px] font-medium ${index === 0 ? "bg-[#2A2A2D] text-[#F5F6F7]" : "text-[#8A8F98]"}`}>
                {segment}
              </button>
            ))}
          </nav>
          <div className="flex justify-end gap-2">
            <button
              className="flex h-9 items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111113] px-3 text-[12px] text-[#8A8F98]"
              onClick={() => setPaletteOpen(true)}
            >
              <Search size={14} />
              <span>Search</span>
              <span className="text-[#696E76]">⌘K</span>
            </button>
            <IconButton label="Explore"><Compass size={15} /></IconButton>
            <IconButton label="Toggle theme"><Moon size={15} /></IconButton>
            <IconButton label="Settings"><Settings size={15} /></IconButton>
          </div>
        </div>

        <div className="spaces-filter-row mt-4 flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-5">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`relative h-7 text-[13px] font-medium ${activeFilter === filter ? "text-[#F5F6F7]" : "text-[#8A8F98]"}`}
              >
                {filter}
                {activeFilter === filter ? <span className="absolute inset-x-0 -bottom-[9px] h-px bg-[#F5F6F7]" /> : null}
              </button>
            ))}
          </div>
          <div className="spaces-density flex items-center gap-2 text-[#8A8F98]">
            <Grid2X2 size={14} />
            <input type="range" min="0" max="3" value={density} onChange={(event) => setDensity(Number(event.target.value))} className="h-1 w-24 accent-[#8A8F98]" />
            <Maximize2 size={14} />
          </div>
          <button className="flex h-8 items-center gap-1 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111113] px-3 text-[12px] text-[#8A8F98]">
            Most recent <ChevronDown size={13} />
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
        <div className="spaces-masonry" style={{ columnWidth, columnGap: 14 }}>
          <button
            className="mb-[14px] inline-flex aspect-[4/5] w-full break-inside-avoid flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[rgba(255,255,255,0.14)] text-[13px] text-[#8A8F98] hover:bg-[#111113] hover:text-[#F5F6F7]"
            onClick={onCreate}
          >
            <Plus size={20} />
            New space
          </button>
          {filtered.map((space) => (
            <SpaceCollectionCard
              key={space.id}
              space={space}
              menuOpen={menuId === space.id}
              onMenu={() => setMenuId(menuId === space.id ? null : space.id)}
              onOpen={() => onOpen(space.id)}
              onRename={() => onRename(space.id)}
              onDuplicate={() => onDuplicate(space.id)}
              onDelete={() => onDelete(space.id)}
            />
          ))}
        </div>
      </main>

      <button
        aria-label="Create space"
        className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-[#F5F6F7] text-[#0A0A0B] shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:bg-white"
        onClick={onCreate}
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
