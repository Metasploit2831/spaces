import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Home, Maximize2, Save, X } from "lucide-react";
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
import { cardFromPayload } from "../lib/cards";
import { nowIso } from "../lib/sourceMetadata";
import { DraftPayload, Space } from "../types/space";
import { SpaceCanvas } from "./SpaceCanvas";
import { SpacesHome } from "./SpacesHome";
import { Button, IconButton } from "@spaces/ui";
import { ViewCanvasModal } from "./ViewCanvasModal";
import { AuthStatus } from "./AuthStatus";

type SaveState = "Save" | "Saving..." | "Saved";
const PANEL_WIDTH_KEY = "spaces:panelWidth";
const DEFAULT_PANEL_WIDTH = 380;
const MIN_PANEL_WIDTH = 320;

function maxPanelWidth() {
  return Math.min(900, Math.round(window.innerWidth * 0.9));
}

function clampPanelWidth(width: number) {
  return Math.min(maxPanelWidth(), Math.max(MIN_PANEL_WIDTH, width));
}

function readPanelWidth(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get([PANEL_WIDTH_KEY], (result) => resolve(clampPanelWidth(Number(result[PANEL_WIDTH_KEY]) || DEFAULT_PANEL_WIDTH)));
      return;
    }
    resolve(clampPanelWidth(Number(window.localStorage.getItem(PANEL_WIDTH_KEY)) || DEFAULT_PANEL_WIDTH));
  });
}

function writePanelWidth(width: number) {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    chrome.storage.local.set({ [PANEL_WIDTH_KEY]: width });
    return;
  }
  window.localStorage.setItem(PANEL_WIDTH_KEY, String(width));
}

export function SpacesSidebar() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [screen, setScreen] = useState<"home" | "canvas">("home");
  const [saveState, setSaveState] = useState<SaveState>("Save");
  const [collapsed, setCollapsed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [syncEmail, setSyncEmail] = useState<string | undefined>();
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_PANEL_WIDTH);

  useEffect(() => {
    void readPanelWidth().then(setSidebarWidth);
  }, []);

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    let currentWidth = startWidth;
    const move = (moveEvent: globalThis.PointerEvent) => {
      const next = clampPanelWidth(startWidth - (moveEvent.clientX - startX));
      currentWidth = next;
      setSidebarWidth(next);
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      writePanelWidth(currentWidth);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  const resetWidth = () => {
    setSidebarWidth(DEFAULT_PANEL_WIDTH);
    writePanelWidth(DEFAULT_PANEL_WIDTH);
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

  useEffect(() => {
    const handlePayload = (event: Event) => {
      const payload = (event as CustomEvent<DraftPayload>).detail;
      if (!payload) return;

      if (activeSpace) {
        const card = cardFromPayload(activeSpace.id, payload);
        const nextSpace = { ...activeSpace, cards: [card, ...activeSpace.cards], updatedAt: nowIso() };
        const nextSpaces = updateSpace(spaces, nextSpace);
        setActiveSpace(nextSpace);
        setSpaces(nextSpaces);
        void saveSpaces(nextSpaces);
        return;
      }

      const nextSpace = createSpace();
      const card = cardFromPayload(nextSpace.id, payload);
      const withCard = { ...nextSpace, cards: [card], updatedAt: nowIso() };
      const nextSpaces = [withCard, ...spaces];
      setActiveSpace(withCard);
      setScreen("canvas");
      setSaveState("Save");
      setSpaces(nextSpaces);
      void saveSpaces(nextSpaces);
      void setActiveSpaceId(withCard.id);
    };

    window.addEventListener("spaces:add-payload", handlePayload);
    return () => window.removeEventListener("spaces:add-payload", handlePayload);
  }, [activeSpace, spaces]);

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
        className={`fixed right-0 top-0 z-[2147483644] flex h-screen flex-col overflow-hidden border-l border-[rgba(255,255,255,0.06)] bg-[#0A0A0B] text-[#F5F6F7] shadow-[rgba(0,0,0,0.5)_0px_12px_48px_0px] transition ${
          dragActive ? "ring-2 ring-inset ring-[#5e6ad2]/50" : ""
        }`}
        style={{ width: sidebarWidth, containerType: "inline-size" }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={() => setDragActive(false)}
      >
        <div
          className="absolute left-0 top-0 z-50 h-full w-2 cursor-ew-resize bg-transparent hover:bg-[#e4f222]/20"
          onPointerDown={startResize}
          onDoubleClick={resetWidth}
          title="Resize sidebar"
        />
        <header className="relative flex min-h-[48px] shrink-0 items-center gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[#0A0A0B] px-2 py-2 text-[#F5F6F7]">
          {screen === "canvas" ? (
            <IconButton label="Back to Spaces Home" onClick={() => setScreen("home")}>
              <Home size={16} />
            </IconButton>
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-md border border-[rgba(255,255,255,0.06)] bg-[#141416] text-[#e4f222]">
              <ChevronRight size={17} className="rotate-180" />
            </div>
          )}

          {screen === "home" ? (
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[18px] font-semibold leading-none text-[#F5F6F7]">Spaces</h1>
            </div>
          ) : activeSpace ? (
            <div className="min-w-0 flex-1" />
          ) : null}

          <div className="ml-auto flex items-center gap-1.5">
            {screen === "canvas" && activeSpace ? (
              <>
                <IconButton label="View canvas" onClick={() => setModalOpen(true)} className="h-8 w-8">
                  <Maximize2 size={14} />
                </IconButton>
                <Button onClick={saveActive} className="h-8 px-2.5">
                  <Save size={14} /> <span className="spaces-action-label">{saveState}</span>
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
