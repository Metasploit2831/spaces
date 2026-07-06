import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Space } from "../types/space";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

export function isCloudSyncConfigured() {
  return Boolean(url && anonKey);
}

export function getSupabaseClient() {
  if (!isCloudSyncConfigured()) return null;
  client ||= createClient(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export async function getCloudUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function sendSignInLink(email: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  });
  if (error) throw error;
}

export async function signOutCloud() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthChange(callback: (user: User | null) => void) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session?.user || null));
  void getCloudUser().then(callback);
  return () => data.subscription.unsubscribe();
}

export async function mirrorSpacesToCloud(spaces: Space[]) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const user = await getCloudUser();
  if (!user) return;

  const rows = spaces.map((space) => ({
    user_id: user.id,
    space_id: space.id,
    payload: space,
    updated_at: space.updatedAt,
  }));
  if (!rows.length) return;

  const { error } = await supabase.from("spaces").upsert(rows, { onConflict: "user_id,space_id" });
  if (error) console.warn("Unable to mirror Spaces to Supabase", error);
}

export async function loadCloudSpaces(): Promise<Space[]> {
  const supabase = getSupabaseClient();
  const user = await getCloudUser();
  if (!supabase || !user) return [];

  const { data, error } = await supabase.from("spaces").select("payload").eq("user_id", user.id);
  if (error) {
    console.warn("Unable to load cloud Spaces", error);
    return [];
  }
  return (data || []).map((row) => row.payload as Space);
}

export function subscribeToCloudSpaces(onRemoteSpaces: (spaces: Space[]) => void) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => undefined;

  let disposed = false;
  void getCloudUser().then((user) => {
    if (!user || disposed) return;
    const channel = supabase
      .channel(`spaces:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spaces", filter: `user_id=eq.${user.id}` },
        async () => onRemoteSpaces(await loadCloudSpaces()),
      )
      .subscribe();

    cleanup = () => {
      disposed = true;
      void supabase.removeChannel(channel);
    };
  });

  let cleanup = () => {
    disposed = true;
  };
  return () => cleanup();
}

export function mergeSpaces(local: Space[], remote: Space[]) {
  const byId = new Map<string, Space>();
  for (const space of [...local, ...remote]) {
    const current = byId.get(space.id);
    if (!current || new Date(space.updatedAt).getTime() >= new Date(current.updatedAt).getTime()) {
      byId.set(space.id, space);
    }
  }
  return Array.from(byId.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
