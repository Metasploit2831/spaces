import {
  Archive,
  ExternalLink,
  FileText,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  Link2,
  MousePointer2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button, IconButton, Input } from "./ui";

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

const platformColors: Record<GalleryPlatform, string> = {
  instagram: "bg-[#f04f8b] text-white",
  twitter: "bg-[#f5f6f7] text-[#0a0a0b]",
  linkedin: "bg-[#2a6fcb] text-white",
  facebook: "bg-[#3f67d6] text-white",
  youtube: "bg-[#ef4444] text-white",
  tiktok: "bg-[#16f2cf] text-[#0a0a0b]",
  reddit: "bg-[#ff6a35] text-white",
  pinterest: "bg-[#d92d45] text-white",
  github: "bg-[#e8eaed] text-[#0a0a0b]",
  web: "bg-[rgba(255,255,255,0.12)] text-[#f5f6f7]",
};

function tileHeight(item: BookmarkGalleryItem, index: number) {
  if (item.type === "text") return 172;
  if (item.type === "element") return 250;
  if (item.type === "screenshot") return 236;
  if (item.type === "image") return [210, 260, 188, 232][index % 4];
  return [184, 216, 198][index % 3];
}

function Thumbnail({ item }: { item: BookmarkGalleryItem }) {
  if (item.thumbnailUrl) {
    return <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" draggable={false} />;
  }

  if (item.type === "text") {
    return (
      <div className="flex h-full flex-col justify-between bg-[linear-gradient(135deg,#e4f222,#a7dd35)] p-4 text-[#0a0a0b]">
        <FileText size={18} />
        <p className="line-clamp-5 text-[19px] font-semibold leading-6">{item.body || item.title}</p>
      </div>
    );
  }

  return (
    <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#1a1b1d,#0a0a0b_62%,#2c2f36)]">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[rgba(255,255,255,0.08)]">
        {item.type === "link" ? <Link2 size={28} className="text-[#8fb4ff]" /> : <ImageIcon size={28} className="text-[#e4f222]" />}
      </div>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: GalleryPlatform }) {
  return <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${platformColors[platform]}`}>{platformLabels[platform]}</span>;
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
}: BookmarkGalleryProps) {
  const [query, setQuery] = useState("");
  const platforms = useMemo(() => {
    const present = Array.from(new Set(items.map((item) => item.platform)));
    return present.sort((a, b) => platformLabels[a].localeCompare(platformLabels[b]));
  }, [items]);
  const [activePlatform, setActivePlatform] = useState<"all" | GalleryPlatform>("all");
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const platformMatch = activePlatform === "all" || item.platform === activePlatform;
        const queryMatch = `${item.title} ${item.body || ""} ${item.sourceDomain}`.toLowerCase().includes(query.toLowerCase());
        return platformMatch && queryMatch;
      }),
    [activePlatform, items, query],
  );

  return (
    <div
      data-spaces-gallery
      className={`flex min-h-0 flex-1 overflow-hidden bg-[#0A0A0B] text-[#F5F6F7] ${dragActive ? "ring-2 ring-inset ring-[#e4f222]/45" : ""}`}
    >
      <aside className="w-16 shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[#0A0A0B] px-2 py-3">
        <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141416] text-[#e4f222]">
          <Archive size={18} />
        </div>
        <nav className="mt-5 space-y-1">
          {[
            ["Library", Grid2X2],
            ["Spaces", Layers3],
          ].map(([label, Icon]) => (
            <button
              key={label as string}
              title={label as string}
              className="flex h-11 w-full flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-medium text-[#8A8F98] transition hover:bg-[#141416] hover:text-[#F5F6F7]"
            >
              <Icon size={16} />
              <span className="spaces-nav-label">{label as string}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-[rgba(255,255,255,0.06)] bg-[#0A0A0B] px-3 py-3">
          <div className="spaces-gallery-topbar grid grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(120px,220px)_auto] items-center gap-2">
            <h1 className="min-w-0 truncate text-[20px] font-semibold leading-none tracking-0">{title}</h1>
            <Button variant="primary" onClick={onAddText} className="h-8 px-2.5">
              <Plus size={14} /> <span className="spaces-action-label">Text</span>
            </Button>
            {onCaptureElement ? (
              <IconButton
                label={captureElementActive ? "Element picker active" : "Capture element"}
                onClick={onCaptureElement}
                className={`h-8 w-8 ${captureElementActive ? "border-[#e4f222] text-[#e4f222]" : ""}`}
              >
                <MousePointer2 size={15} />
              </IconButton>
            ) : null}
            <IconButton label="Delete selected" onClick={onDeleteSelected} disabled={!selectedIds.length} className="h-8 w-8">
              <Trash2 size={14} />
            </IconButton>
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 text-[#8A8F98]" size={14} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved items" className="h-8 w-full pl-8" />
            </div>
            <button className="h-8 shrink-0 rounded-md border border-[rgba(255,255,255,0.06)] bg-transparent px-2.5 text-[12px] font-medium text-[#8A8F98] hover:bg-[#141416] hover:text-[#F5F6F7]">
              Most recent
            </button>
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            <button
              className={`h-7 shrink-0 rounded-full px-3 text-[12px] font-medium ${activePlatform === "all" ? "bg-[#F5F6F7] text-[#0A0A0B]" : "bg-transparent text-[#8A8F98] hover:bg-[#141416] hover:text-[#F5F6F7]"}`}
              onClick={() => setActivePlatform("all")}
            >
              All
            </button>
            {platforms.map((platform) => (
              <button
                key={platform}
                className={`h-7 shrink-0 rounded-full px-3 text-[12px] font-medium ${activePlatform === platform ? "bg-[#F5F6F7] text-[#0A0A0B]" : "bg-transparent text-[#8A8F98] hover:bg-[#141416] hover:text-[#F5F6F7]"}`}
                onClick={() => setActivePlatform(platform)}
              >
                {platformLabels[platform]}
              </button>
            ))}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
          {items.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-[14px] border border-dashed border-[rgba(255,255,255,0.08)] bg-[#141416] p-6 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#1A1B1D] text-[#e4f222]">
                  <Plus size={24} />
                </div>
                <h2 className="mt-4 text-[21px] font-semibold">Save anything into this Space</h2>
                <p className="mt-2 max-w-[280px] text-[13px] leading-6 text-[#8A8F98]">Drag from the page, paste screenshots, or capture an element.</p>
              </div>
            </div>
          ) : (
            <div className="spaces-masonry" style={{ columnWidth: 158, columnGap: 12 }}>
              {filtered.map((item, index) => {
                const selected = selectedIds.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className={`group mb-3 inline-block w-full cursor-default break-inside-avoid overflow-hidden rounded-[14px] border bg-[#141416] align-top text-[#F5F6F7] transition ${
                      selected ? "border-[#e4f222]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] hover:bg-[#1A1B1D]"
                    }`}
                    onClick={(event) => onSelect(item.id, event.shiftKey || event.metaKey || event.ctrlKey)}
                  >
                    <div className="relative overflow-hidden" style={{ height: tileHeight(item, index) }}>
                      <Thumbnail item={item} />
                      <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,rgba(0,0,0,0.82))] p-2 pt-10">
                        <div className="flex items-center gap-1.5">
                          {item.faviconUrl ? <img src={item.faviconUrl} alt="" className="h-4 w-4 shrink-0 rounded-sm" /> : null}
                          <PlatformBadge platform={item.platform} />
                          <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#F5F6F7]">{item.title}</p>
                          <span className="shrink-0 text-[10px] text-[#8A8F98]">{item.relativeTime}</span>
                          {item.url ? (
                            <button
                              className="hidden shrink-0 text-[#F5F6F7] opacity-80 hover:opacity-100 group-hover:block"
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpen?.(item);
                              }}
                              title="Open source"
                            >
                              <ExternalLink size={13} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
