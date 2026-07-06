import {
  Archive,
  ExternalLink,
  FileText,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  Link2,
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
  onAddText: () => void;
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
  twitter: "bg-[#f7f8f8] text-[#08090a]",
  linkedin: "bg-[#2a6fcb] text-white",
  facebook: "bg-[#3f67d6] text-white",
  youtube: "bg-[#ef4444] text-white",
  tiktok: "bg-[#16f2cf] text-[#08090a]",
  reddit: "bg-[#ff6a35] text-white",
  pinterest: "bg-[#d92d45] text-white",
  github: "bg-[#e8eaed] text-[#08090a]",
  web: "bg-[#383b3f] text-[#f7f8f8]",
};

function Thumbnail({ item }: { item: BookmarkGalleryItem }) {
  if (item.thumbnailUrl) {
    return <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" draggable={false} />;
  }

  if (item.type === "text") {
    return (
      <div className="h-full bg-[#17191c] p-4">
        <FileText size={18} className="mb-3 text-[#e4f222]" />
        <p className="line-clamp-5 text-[13px] leading-5 text-[#d0d6e0]">{item.body || item.title}</p>
      </div>
    );
  }

  return (
    <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#1b1d20,#0b0c0d_62%,#313a89)]">
      {item.type === "link" ? <Link2 size={30} className="text-[#8fb4ff]" /> : <ImageIcon size={30} className="text-[#e4f222]" />}
    </div>
  );
}

function PlatformBadge({ platform }: { platform: GalleryPlatform }) {
  return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${platformColors[platform]}`}>{platformLabels[platform]}</span>;
}

export function BookmarkGallery({
  title,
  items,
  selectedIds,
  dragActive = false,
  onAddText,
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
    <div className={`flex min-h-0 flex-1 bg-[#08090a] text-[#f7f8f8] ${dragActive ? "ring-2 ring-inset ring-[#e4f222]/45" : ""}`}>
      <aside className="hidden w-[96px] shrink-0 border-r border-[#202226] bg-[#0b0c0d] px-3 py-4 min-[620px]:block">
        <div className="grid h-9 w-9 place-items-center rounded-md border border-[#2b2e33] bg-[#151719] text-[#e4f222]">
          <Archive size={18} />
        </div>
        <nav className="mt-6 space-y-1">
          {[
            ["Library", Grid2X2],
            ["Spaces", Layers3],
          ].map(([label, Icon]) => (
            <button
              key={label as string}
              className="flex w-full flex-col items-center gap-1 rounded-md px-2 py-2.5 text-[10px] font-medium text-[#747982] transition hover:bg-[#141618] hover:text-[#d0d6e0]"
            >
              <Icon size={16} />
              <span>{label as string}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-[#202226] bg-[#08090a] px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="min-w-0 flex-1 truncate text-[24px] font-semibold leading-none">{title}</h1>
            <Button variant="secondary" onClick={onAddText}>
              <Plus size={14} /> Text
            </Button>
            <IconButton label="Delete selected" onClick={onDeleteSelected} disabled={!selectedIds.length}>
              <Trash2 size={15} />
            </IconButton>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-[#62666d]" size={15} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved items" className="w-full pl-9" />
            </div>
            <button className="h-9 shrink-0 rounded-md border border-[#24262a] bg-[#151719] px-3 text-[12px] font-medium text-[#d0d6e0]">
              Most recent
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              className={`h-8 shrink-0 rounded-full px-3 text-[12px] font-semibold ${activePlatform === "all" ? "bg-[#f7f8f8] text-[#08090a]" : "bg-[#151719] text-[#8a8f98]"}`}
              onClick={() => setActivePlatform("all")}
            >
              All
            </button>
            {platforms.map((platform) => (
              <button
                key={platform}
                className={`h-8 shrink-0 rounded-full px-3 text-[12px] font-semibold ${activePlatform === platform ? "bg-[#f7f8f8] text-[#08090a]" : "bg-[#151719] text-[#8a8f98]"}`}
                onClick={() => setActivePlatform(platform)}
              >
                {platformLabels[platform]}
              </button>
            ))}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-[#2b2e33] bg-[#0d0f10] p-6 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-md border border-[#2b2e33] bg-[#151719] text-[#e4f222]">
                  <Plus size={24} />
                </div>
                <h2 className="mt-4 text-[22px] font-semibold">Save anything into this Space</h2>
                <p className="mt-2 max-w-[280px] text-[13px] leading-6 text-[#8a8f98]">Drag from the page, paste screenshots, or add a text note.</p>
              </div>
            </div>
          ) : (
            <div className="columns-1 gap-3 min-[520px]:columns-2 min-[980px]:columns-3">
              {filtered.map((item) => {
                const selected = selectedIds.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className={`mb-3 break-inside-avoid overflow-hidden rounded-lg border bg-[#111315] text-[#f7f8f8] shadow-[rgba(0,0,0,0.32)_0px_10px_36px_0px] transition ${
                      selected ? "border-[#e4f222]" : "border-[#24262a] hover:border-[#35383d]"
                    }`}
                    onClick={(event) => onSelect(item.id, event.shiftKey || event.metaKey || event.ctrlKey)}
                  >
                    <div className="h-[190px] overflow-hidden bg-[#0b0c0d]">
                      <Thumbnail item={item} />
                    </div>
                    <div className="p-3">
                      <div className="mb-3 flex items-center gap-2">
                        {item.faviconUrl ? <img src={item.faviconUrl} alt="" className="h-4 w-4 rounded-sm" /> : null}
                        <PlatformBadge platform={item.platform} />
                        {item.url ? (
                          <button
                            className="ml-auto text-[#8a8f98] hover:text-[#f7f8f8]"
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpen?.(item);
                            }}
                          >
                            <ExternalLink size={14} />
                          </button>
                        ) : null}
                      </div>
                      <h3 className="line-clamp-2 text-[15px] font-semibold leading-5">{item.title}</h3>
                      <p className="mt-2 truncate text-[12px] text-[#8a8f98]">{item.sourceDomain}</p>
                      <p className="mt-1 text-[11px] text-[#62666d]">{item.relativeTime}</p>
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
