import { Cloud, CloudOff, LogOut } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button, IconButton, Input } from "@spaces/ui";
import { isCloudSyncConfigured, sendSignInLink, signOutCloud } from "../lib/cloudSync";

type AuthStatusProps = {
  email?: string;
};

export function AuthStatus({ email }: AuthStatusProps) {
  const [draftEmail, setDraftEmail] = useState("");
  const [message, setMessage] = useState("");

  if (!isCloudSyncConfigured()) {
    return (
      <div className="border-b border-[#23252a] bg-[#0b0c0d] px-3 py-2 text-[11px] text-[#8a8f98]">
        <CloudOff size={13} className="mr-1 inline" /> Sync not configured
      </div>
    );
  }

  if (email) {
    return (
      <div className="flex items-center gap-2 border-b border-[#23252a] bg-[#0b0c0d] px-3 py-2 text-[11px] text-[#8a8f98]">
        <Cloud size={13} className="text-[#e4f222]" />
        <span className="min-w-0 flex-1 truncate">{email}</span>
        <IconButton label="Sign out" onClick={() => void signOutCloud()} className="h-7 w-7">
          <LogOut size={13} />
        </IconButton>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draftEmail.trim()) return;
    await sendSignInLink(draftEmail.trim());
    setMessage("Check your email for the sign-in link.");
  };

  return (
    <form onSubmit={submit} className="space-y-2 border-b border-[#23252a] bg-[#0b0c0d] px-3 py-3">
      <div className="flex gap-2">
        <Input value={draftEmail} onChange={(event) => setDraftEmail(event.target.value)} placeholder="Email for sync" className="h-8 min-w-0 flex-1" />
        <Button type="submit" className="h-8">Sync</Button>
      </div>
      {message ? <p className="text-[11px] text-[#8a8f98]">{message}</p> : null}
    </form>
  );
}
