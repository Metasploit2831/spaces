import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Home, Maximize2, PanelRightClose, Save, X } from "lucide-react";
import { PointerEvent, useEffect, useMemo, useState } from "react";
import {
  createSpace,
  deleteSpace as deleteStoredSpace,
  duplicateSpace,
  getActiveSpaceId,
  getSpaces,
  saveSpaces,
  setActiveSpaceId,
  updateSpace,
} from "../lib/storage";
import { loadCloudSpaces, mergeSpaces, onAuthChange, subscribeToCloudSpaces } from "../lib/cloudSync";
import { nowIso } from "../lib/sourceMetadata";
import { Space } from "../types/space";
import { SpaceCanvas } from "./SpaceCanvas";
import { SpacesHome } from "./SpacesHome";
import { Button, IconButton } from "@spaces/ui";
import { ViewCanvasModal } from "./ViewCanvasModal";
import { AuthStatus } from "./AuthStatus";

type SaveState = "Save" | "Saving..." | "Saved";

export function SpacesSidebar() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [screen, setScreen] = useState<"home" | "canvas">("home");
  const [saveState, setSaveState] = useState<SaveState>("Save");
  const [collapsed, setCollapsed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [syncEmail, setSyncEmail] = useState<string | undefined>();
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("spaces:sidebar-width") : null;
    const width = stored ? Number(stored) : 420;
    return Number.isFinite(width) ? Math.min(680, Math.max(400, width)) : 420;
  });

  useEffect(() => {
    window.localStorage.setItem("spaces:sidebar-width", String(sidebarWidth));
  }, [sidebarWidth]);

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    const move = (moveEvent: globalThis.PointerEvent) => {
      const next = Math.min(680, Math.max(400, startWidth - (moveEvent.clientX - startX)));
      setSidebarWidth(next);
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  useEffect(() => {
    Promise.all([getSpaces(), getActiveSpaceId()]).then(([loaded, activeId]) => {
      setSpaces(loaded);
      const active = loaded.find((space) => space.id === activeId);
      if (active) {
        setActiveSpace(active);
        setScreen("canvas");
      }
    });
  }, []);

  useEffect(() => {
    return onAuthChange((user) => {
      setSyncEmail(user?.email);
      if (!user) return;
      void loadCloudSpaces().then(async (remote) => {
        const local = await getSpaces();
        const next = mergeSpaces(local, remote);
        setSpaces(next);
        await saveSpaces(next);
      });
    });
  }, []);

  useEffect(() => {
    return subscribeToCloudSpaces((remote) => {
      setSpaces((current) => {
        const next = mergeSpaces(current, remote);
        void saveSpaces(next);
        if (activeSpace) {
          const remoteActive = next.find((space) => space.id === activeSpace.id);
          if (remoteActive && remoteActive.updatedAt !== activeSpace.updatedAt) setActiveSpace(remoteActive);
        }
        return next;
      });
    });
  }, [activeSpace]);

  const activeIsSaved = useMemo(
    () => Boolean(activeSpace && spaces.some((space) => space.id === activeSpace.id)),
    [activeSpace, spaces],
  );

  const persist = async (next: Space[]) => {
    setSpaces(next);
    await saveSpaces(next);
  };

  const openSpace = async (space: Space) => {
    setActiveSpace(space);
    setScreen("canvas");
    setSaveState("Saved");
    await setActiveSpaceId(space.id);
  };

  const createNew = async () => {
    const next = createSpace();
    setActiveSpace(next);
    setScreen("canvas");
    setSaveState("Save");
    await setActiveSpaceId(next.id);
  };

  const changeActive = (space: Space) => {
    setActiveSpace(space);
    setSaveState("Save");
    if (spaces.some((item) => item.id === space.id)) {
      const next = updateSpace(spaces, space);
      setSpaces(next);
      saveSpaces(next);
    }
  };

  const saveActive = async () => {
    if (!activeSpace) return;
    setSaveState("Saving...");
    const nextSpace = { ...activeSpace, updatedAt: nowIso() };
    const next = updateSpace(spaces, nextSpace);
    await persist(next);
    setActiveSpace(nextSpace);
    await setActiveSpaceId(nextSpace.id);
    setSaveState("Saved");
    setTimeout(() => {
      setScreen("home");
      setSaveState("Save");
    }, activeIsSaved ? 650 : 450);
  };

  const renameSpace = async (space: Space, title: string) => {
    const next = updateSpace(spaces, { ...space, title });
    await persist(next);
    if (activeSpace?.id === space.id) setActiveSpace({ ...activeSpace, title });
  };

  const removeSpace = async (space: Space) => {
    const next = deleteStoredSpace(spaces, space.id);
    await persist(next);
    if (activeSpace?.id === space.id) {
      setActiveSpace(null);
      setScreen("home");
      await setActiveSpaceId(null);
    }
  };

  const duplicate = async (space: Space) => {
    await persist([duplicateSpace(space), ...spaces]);
  };

  if (collapsed) {
    return (
      <button
        data-spaces-root
        onClick={() => setCollapsed(false)}
        className="fixed right-3 top-1/2 z-[2147483644] flex -translate-y-1/2 items-center gap-2 rounded-md border border-[#23252a] bg-[#161718] px-3 py-2 text-[12px] font-medium tracking-[-0.01em] text-[#f7f8f8] shadow-[rgba(8,9,10,0.6)_0px_4px_32px_0px]"
      >
        <ChevronRight size={15} className="rotate-180 text-[#e4f222]" />
        Spaces
      </button>
    );
  }

  return (
    <>
      <motion.aside
        data-spaces-root
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`fixed right-0 top-0 z-[2147483644] flex h-screen flex-col overflow-hidden border-l border-[#23252a] bg-[#08090a] text-[#f7f8f8] shadow-[rgba(8,9,10,0.6)_0px_4px_32px_0px] transition ${
          dragActive ? "ring-2 ring-inset ring-[#5e6ad2]/50" : ""
        }`}
        style={{ width: sidebarWidth }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={() => setDragActive(false)}
      >
        <div
          className="absolute left-0 top-0 h-full w-2 cursor-col-resize bg-transparent"
          onPointerDown={startResize}
          title="Resize sidebar"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(94,106,210,0.12),transparent_55%)]" />
        <header className="relative flex min-h-[68px] items-center gap-2 border-b border-[#23252a] bg-[#08090a] px-2 py-4 text-[#f7f8f8]">
          {screen === "canvas" ? (
            <IconButton label="Back to Spaces Home" onClick={() => setScreen("home")}>
              <Home size={16} />
            </IconButton>
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-md border border-[#23252a] bg-[#161718] text-[#e4f222]">
              <PanelRightClose size={17} />
            </div>
          )}

          {screen === "home" ? (
            <div>
              <h1 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#f7f8f8]">Spaces</h1>
              <p className="mt-1 text-[11px] font-normal text-[#8a8f98]">Save anything. Find it by platform.</p>
            </div>
          ) : activeSpace ? (
            <input
              value={activeSpace.title}
              onChange={(event) => changeActive({ ...activeSpace, title: event.target.value })}
              className="min-w-0 flex-1 bg-transparent text-[17px] font-medium tracking-[-0.01em] text-[#f7f8f8] outline-none placeholder:text-[#8a8f98]"
              aria-label="Space title"
            />
          ) : null}

          <div className="ml-auto flex items-center gap-1.5">
            {screen === "canvas" && activeSpace ? (
              <>
                <Button variant="secondary" onClick={() => setModalOpen(true)} className="px-2.5">
                  <Maximize2 size={14} /> View Canvas
                </Button>
                <Button onClick={saveActive} className="px-2.5">
                  <Save size={14} /> {saveState}
                </Button>
              </>
            ) : null}
            <IconButton label="Collapse Spaces" onClick={() => setCollapsed(true)}>
              <X size={16} />
            </IconButton>
          </div>
        </header>

        <AuthStatus email={syncEmail} />

        <AnimatePresence mode="wait">
          {screen === "home" ? (
            <motion.div
              key="home"
              className="flex min-h-0 flex-1 flex-col bg-[#08090a]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              <SpacesHome spaces={spaces} onCreate={createNew} onOpen={openSpace} onRename={renameSpace} onDuplicate={duplicate} onDelete={removeSpace} />
            </motion.div>
          ) : activeSpace ? (
            <motion.div
              key="canvas"
              className="flex min-h-0 flex-1 flex-col bg-[#08090a]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              <SpaceCanvas space={activeSpace} onChange={changeActive} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.aside>

      {modalOpen && activeSpace ? (
        <ViewCanvasModal
          space={activeSpace}
          onChange={changeActive}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}
