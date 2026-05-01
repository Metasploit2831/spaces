import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Home, Maximize2, PanelRightClose, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { nowIso } from "../lib/sourceMetadata";
import { Space } from "../types/space";
import { SpaceCanvas } from "./SpaceCanvas";
import { SpacesHome } from "./SpacesHome";
import { Button, IconButton } from "./ui";
import { ViewCanvasModal } from "./ViewCanvasModal";

type SaveState = "Save" | "Saving..." | "Saved";

export function SpacesSidebar() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [screen, setScreen] = useState<"home" | "canvas">("home");
  const [saveState, setSaveState] = useState<SaveState>("Save");
  const [collapsed, setCollapsed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
        className="fixed right-3 top-1/2 z-[2147483644] flex -translate-y-1/2 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-[12px] font-black text-zinc-50 shadow-sidebar"
      >
        <ChevronRight size={15} className="rotate-180 text-mint" />
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
        className={`fixed right-0 top-0 z-[2147483644] flex h-screen w-[410px] flex-col overflow-hidden border-l border-zinc-800 bg-zinc-950 text-zinc-50 shadow-sidebar transition ${
          dragActive ? "ring-2 ring-inset ring-mint/60" : ""
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={() => setDragActive(false)}
      >
        <header className="relative flex h-14 items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4">
          {screen === "canvas" ? (
            <IconButton label="Back to Spaces Home" onClick={() => setScreen("home")}>
              <Home size={16} />
            </IconButton>
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-md bg-mint text-ink">
              <PanelRightClose size={17} />
            </div>
          )}

          {screen === "home" ? (
            <div>
              <h1 className="text-base font-black tracking-tight text-zinc-50">Spaces</h1>
              <p className="-mt-0.5 text-[11px] font-semibold text-zinc-400">Drag anything. Paste anything. Group anything.</p>
            </div>
          ) : activeSpace ? (
            <input
              value={activeSpace.title}
              onChange={(event) => changeActive({ ...activeSpace, title: event.target.value })}
              className="min-w-0 flex-1 bg-transparent text-sm font-black text-zinc-50 outline-none placeholder:text-zinc-500"
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

        <AnimatePresence mode="wait">
          {screen === "home" ? (
            <motion.div key="home" className="flex min-h-0 flex-1 flex-col pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SpacesHome spaces={spaces} onCreate={createNew} onOpen={openSpace} onRename={renameSpace} onDuplicate={duplicate} onDelete={removeSpace} />
            </motion.div>
          ) : activeSpace ? (
            <motion.div key="canvas" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
