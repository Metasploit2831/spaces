import {
  Camera,
  ChevronDown,
  Command,
  Compass,
  Grid2X2,
  Maximize2,
  Moon,
  MousePointer2,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, IconButton } from "./ui";

export type GalleryPlatform =
  | "instagram"
  | "twitter"
  | "linkedin"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "reddit"
  | "pinterest"
  | "github"
  | "web";

export type BookmarkGalleryItem = {
  id: string;
  type: string;
  title: string;
  body?: string;
  url?: string;
  thumbnailUrl?: string;
  faviconUrl?: string;
  captures?: string[];
  platform: GalleryPlatform;
  sourceDomain: string;
  relativeTime: string;
};

export type BookmarkGalleryProps = {
  title: string;
  items: BookmarkGalleryItem[];
  selectedIds: string[];
  dragActive?: boolean;
  captureElementActive?: boolean;
  onAddText: () => void;
  onCaptureElement?: () => void;
  onDeleteSelected: () => void;
  onSelect: (id: string, multi: boolean) => void;
  onOpen?: (item: BookmarkGalleryItem) => void;
  onNewSpace?: () => void;
  onNewCollection?: () => void;
  onCaptureScreenshot?: () => void;
};

const platformLabels: Record<GalleryPlatform, string> = {
  instagram: "Instagram",
  twitter: "X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  reddit: "Reddit",
  pinterest: "Pinterest",
  github: "GitHub",
  web: "Web",
};

const filterTabs = ["All", "Saved", "Unsorted", "Trash"] as const;

function firstCapture(item: BookmarkGalleryItem) {
  return item.captures?.[0] || item.thumbnailUrl;
}

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
  onNewCollection,
  onNewSpace,
  onCaptureScreenshot,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  onNewCollection?: () => void;
  onNewSpace?: () => void;
  onCaptureScreenshot?: () => void;
}) {
  if (!open) return null;

  const commands = [
    ["New collection", "⌘N", onNewCollection],
    ["New space", "⌘⇧N", onNewSpace],
    ["Capture screenshot", "⌘⇧S", onCaptureScreenshot],
    ["Rediscover", "⌘⇧R", undefined],
    ["Go to library", "⌘1", undefined],
    ["Go to collections", "⌘2", undefined],
    ["Go to spaces", "⌘3", undefined],
    ["Toggle theme", "", undefined],
  ] as const;

  return (
    <div className="fixed inset-0 z-[2147483647] grid place-items-start bg-black/48 px-4 pt-[14vh]" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.10)] bg-[#101012] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
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

function Thumbnail({ item }: { item: BookmarkGalleryItem }) {
  const [failed, setFailed] = useState(false);
  const image = firstCapture(item);
  if (image && !failed) {
    return <img src={image} alt="" className="block h-auto w-full rounded-[16px] object-cover" draggable={false} onError={() => setFailed(true)} />;
  }

  if (item.type === "text") {
    return (
      <div className="rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[#141416] p-4">
        <p className="line-clamp-5 text-[13px] leading-5 text-[#D0D3D7]">{item.body || item.title}</p>
      </div>
    );
  }

  return <div className="aspect-[4/5] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[#141416]" />;
}

function ItemCard({
  item,
  selected,
  index,
  onSelect,
  onOpen,
}: {
  item: BookmarkGalleryItem;
  selected: boolean;
  index: number;
  onSelect: (multi: boolean) => void;
  onOpen?: () => void;
}) {
  const captureCount = item.captures?.length || (item.thumbnailUrl ? 1 : 0);
  const isVideo = item.type === "video";
  const image = firstCapture(item);
  const fallbackHeights = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[5/6]"];

  return (
    <article
      className="group relative mb-[14px] inline-block w-full break-inside-avoid align-top"
      onClick={(event) => onSelect(event.shiftKey || event.metaKey || event.ctrlKey)}
    >
      <div
        className={`relative overflow-hidden rounded-[16px] ${selected ? "outline outline-2 outline-[#F5F6F7]" : ""} ${
          image ? "" : fallbackHeights[index % fallbackHeights.length]
        }`}
      >
        <Thumbnail item={item} />
        {captureCount > 1 ? (
          <div className="absolute right-2 top-2 rounded-full bg-black/62 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
            1/{captureCount}
          </div>
        ) : null}
        {isVideo ? (
          <div className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/62 text-white backdrop-blur">
            <Camera size={14} />
          </div>
        ) : null}
        <button
          className="absolute inset-0 hidden bg-black/42 p-3 text-left group-hover:block"
          onClick={(event) => {
            event.stopPropagation();
            onOpen?.();
          }}
        >
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="flex items-center gap-2">
              <SafeImage src={item.faviconUrl} className="h-4 w-4 rounded-sm" />
              <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-white">{item.title}</p>
              <span className="text-[11px] text-white/70">{item.relativeTime}</span>
            </div>
            <p className="mt-1 truncate text-[11px] text-white/58">{item.sourceDomain}</p>
          </div>
        </button>
      </div>
    </article>
  );
}

export function BookmarkGallery({
  title,
  items,
  selectedIds,
  dragActive = false,
  captureElementActive = false,
  onAddText,
  onCaptureElement,
  onDeleteSelected,
  onSelect,
  onOpen,
  onNewSpace,
  onNewCollection,
  onCaptureScreenshot,
}: BookmarkGalleryProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filterTabs)[number]>("All");
  const [activePlatform, setActivePlatform] = useState<"all" | GalleryPlatform>("all");
  const [density, setDensity] = useState(3);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const platforms = useMemo(() => {
    const present = Array.from(new Set(items.map((item) => item.platform)));
    return present.sort((a, b) => platformLabels[a].localeCompare(platformLabels[b]));
  }, [items]);
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const platformMatch = activePlatform === "all" || item.platform === activePlatform;
        const queryMatch = `${item.title} ${item.body || ""} ${item.sourceDomain}`.toLowerCase().includes(query.toLowerCase());
        return platformMatch && queryMatch;
      }),
    [activePlatform, items, query],
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

  const columnWidth = [230, 190, 160, 132][density] || 160;

  return (
    <div
      data-spaces-gallery
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0A0A0B] text-[#F5F6F7] ${dragActive ? "ring-1 ring-inset ring-white/18" : ""}`}
    >
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        query={query}
        onQueryChange={setQuery}
        onNewCollection={onNewCollection}
        onNewSpace={onNewSpace}
        onCaptureScreenshot={onCaptureScreenshot}
      />

      <header className="shrink-0 border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
        <div className="spaces-app-topbar grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AppLogo />
            <button className="flex min-w-0 items-center gap-1 truncate text-[14px] font-medium text-[#F5F6F7]">
              <span className="truncate">{title || "Library"}</span>
              <ChevronDown size={14} className="shrink-0 text-[#8A8F98]" />
            </button>
          </div>

          <nav className="spaces-segmented mx-auto flex h-10 items-center rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111113] p-1">
            <Search size={15} className="mx-2 text-[#8A8F98]" />
            {["Library", "Collections", "Spaces"].map((segment, index) => (
              <button
                key={segment}
                className={`h-8 rounded-full px-3 text-[12px] font-medium transition ${
                  index === 0 ? "bg-[#2A2A2D] text-[#F5F6F7]" : "text-[#8A8F98] hover:text-[#F5F6F7]"
                }`}
              >
                {segment}
              </button>
            ))}
          </nav>

          <div className="flex min-w-0 justify-end gap-2">
            <button
              className="flex h-9 items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111113] px-3 text-[12px] text-[#8A8F98] hover:bg-[#1A1B1D] hover:text-[#F5F6F7]"
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
            {filterTabs.map((tab) => (
              <button
                key={tab}
                className={`relative h-7 text-[13px] font-medium ${activeFilter === tab ? "text-[#F5F6F7]" : "text-[#8A8F98] hover:text-[#F5F6F7]"}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
                {activeFilter === tab ? <span className="absolute inset-x-0 -bottom-[9px] h-px bg-[#F5F6F7]" /> : null}
              </button>
            ))}
            {platforms.length ? (
              <select
                value={activePlatform}
                onChange={(event) => setActivePlatform(event.target.value as "all" | GalleryPlatform)}
                className="h-8 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111113] px-3 text-[12px] text-[#8A8F98] outline-none"
              >
                <option value="all">All platforms</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>{platformLabels[platform]}</option>
                ))}
              </select>
            ) : null}
          </div>
          <div className="spaces-density flex items-center gap-2 text-[#8A8F98]">
            <Grid2X2 size={14} />
            <input
              aria-label="Grid density"
              type="range"
              min="0"
              max="3"
              value={density}
              onChange={(event) => setDensity(Number(event.target.value))}
              className="h-1 w-24 accent-[#8A8F98]"
            />
            <Maximize2 size={14} />
          </div>
          <button className="flex h-8 items-center gap-1 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#111113] px-3 text-[12px] text-[#8A8F98]">
            Most recent <ChevronDown size={13} />
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
        {items.length === 0 ? (
          <div className="grid min-h-[340px] place-items-center rounded-[16px] border border-dashed border-[rgba(255,255,255,0.10)]">
            <div className="text-center">
              <Button variant="secondary" onClick={onAddText}>
                <Plus size={14} /> Add text
              </Button>
              <p className="mt-3 text-[13px] text-[#8A8F98]">Capture elements, screenshots, links, and notes.</p>
            </div>
          </div>
        ) : (
          <div className="spaces-masonry" style={{ columnWidth, columnGap: 14 }}>
            {onNewCollection ? (
              <button
                className="mb-[14px] inline-flex aspect-[4/5] w-full break-inside-avoid flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[rgba(255,255,255,0.14)] text-[13px] text-[#8A8F98] hover:bg-[#111113] hover:text-[#F5F6F7]"
                onClick={onNewCollection}
              >
                <Plus size={20} />
                New collection
              </button>
            ) : null}
            {filtered.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                index={index}
                onSelect={(multi) => onSelect(item.id, multi)}
                onOpen={() => onOpen?.(item)}
              />
            ))}
          </div>
        )}
      </main>

      <div className="absolute bottom-4 right-4 flex gap-2">
        {onCaptureElement ? (
          <IconButton
            label={captureElementActive ? "Element picker active" : "Capture element"}
            onClick={onCaptureElement}
            className={`h-11 w-11 bg-[#202024] text-[#F5F6F7] shadow-[0_12px_32px_rgba(0,0,0,0.35)] ${captureElementActive ? "ring-1 ring-white/40" : ""}`}
          >
            <MousePointer2 size={18} />
          </IconButton>
        ) : null}
        <button
          aria-label="Add text"
          className="grid h-11 w-11 place-items-center rounded-full bg-[#F5F6F7] text-[#0A0A0B] shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:bg-white"
          onClick={onAddText}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
