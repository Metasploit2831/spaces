import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Cloud, CloudOff, LogOut } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookmarkGallery, BookmarkGalleryItem, Button, IconButton, Input } from "@spaces/ui";

type SpaceCard = {
  id: string;
  type: string;
  platform: BookmarkGalleryItem["platform"];
  content?: string;
  src?: string;
  url?: string;
  thumbnailUrl?: string;
  faviconUrl?: string;
  sourceUrl?: string;
  pageTitle?: string;
  fileName?: string;
  createdAt: string;
};

type Space = {
  id: string;
  title: string;
  cards: SpaceCard[];
  updatedAt: string;
};

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const configured = Boolean(url && anonKey);
const supabase: SupabaseClient | null = configured ? createClient(url!, anonKey!) : null;

function domainFromUrl(value?: string) {
  if (!value) return "this page";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value.replace(/^https?:\/\//, "").split("/")[0] || "source";
  }
}

function relativeTime(value?: string) {
  if (!value) return "just now";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function toGalleryItem(card: SpaceCard): BookmarkGalleryItem {
  return {
    id: card.id,
    type: card.type,
    title: card.pageTitle || card.content || card.fileName || card.url || "Saved item",
    body: card.content,
    url: card.url || card.sourceUrl,
    thumbnailUrl: card.thumbnailUrl || (card.type === "image" || card.type === "screenshot" ? card.src : undefined),
    faviconUrl: card.faviconUrl,
    platform: card.platform || "web",
    sourceDomain: domainFromUrl(card.sourceUrl || card.url),
    relativeTime: relativeTime(card.createdAt),
  };
}

async function loadSpaces() {
  if (!supabase) return [];
  const { data } = await supabase.from("spaces").select("payload");
  return (data || []).map((row) => row.payload as Space);
}

function AuthBar({ user }: { user: User | null }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  if (!configured) {
    return (
      <div className="flex h-10 items-center gap-2 border-b border-[#23252a] bg-[#0b0c0d] px-4 text-[12px] text-[#8a8f98]">
        <CloudOff size={14} /> Supabase sync is not configured.
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex h-10 items-center gap-2 border-b border-[#23252a] bg-[#0b0c0d] px-4 text-[12px] text-[#8a8f98]">
        <Cloud size={14} className="text-[#e4f222]" />
        <span className="min-w-0 flex-1 truncate">{user.email}</span>
        <IconButton label="Sign out" onClick={() => void supabase?.auth.signOut()} className="h-7 w-7">
          <LogOut size={13} />
        </IconButton>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    await supabase?.auth.signInWithOtp({ email: email.trim() });
    setMessage("Check your email for the sign-in link.");
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 border-b border-[#23252a] bg-[#0b0c0d] px-4 py-2">
      <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email for sync" className="h-8 min-w-0 flex-1" />
      <Button type="submit" className="h-8">Sync</Button>
      {message ? <span className="text-[11px] text-[#8a8f98]">{message}</span> : null}
    </form>
  );
}

export function App() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) void loadSpaces().then(setSpaces);
    });
    void supabase.auth.getUser().then(({ data: userData }) => {
      setUser(userData.user);
      if (userData.user) void loadSpaces().then(setSpaces);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !user) return;
    const channel = supabase
      .channel(`spaces-desktop:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "spaces", filter: `user_id=eq.${user.id}` }, () => {
        void loadSpaces().then(setSpaces);
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const items = useMemo(
    () =>
      spaces
        .flatMap((space) => space.cards)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(toGalleryItem),
    [spaces],
  );

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#08090a] text-[#f7f8f8]">
      <AuthBar user={user} />
      <BookmarkGallery
        title="Spaces Library"
        items={items}
        selectedIds={selectedIds}
        onAddText={() => undefined}
        onDeleteSelected={() => undefined}
        onSelect={(id, multi) => setSelectedIds((ids) => (multi ? (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]) : [id]))}
        onOpen={(item) => {
          if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
        }}
      />
    </main>
  );
}
