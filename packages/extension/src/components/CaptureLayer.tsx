import { toPng } from "html-to-image";
import { useEffect, useState } from "react";
import { CaptureButton } from "./CaptureButton";
import { CapturePill } from "./CapturePill";
import { DraftPayload } from "../types/space";
import { detectPlatform } from "../lib/platform";
import { getPageSource } from "../lib/sourceMetadata";

type HoverCapture = {
  x: number;
  y: number;
  payload: DraftPayload;
};

export function CaptureLayer() {
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [hoverCapture, setHoverCapture] = useState<HoverCapture | null>(null);
  const [picking, setPicking] = useState(false);
  const [path, setPath] = useState<HTMLElement[]>([]);
  const [pathIndex, setPathIndex] = useState(0);

  const pickedElement = path[pathIndex] || null;

  const setElementPath = (element: Element | null) => {
    const nextPath: HTMLElement[] = [];
    let current = element instanceof HTMLElement ? element : null;
    while (current && current !== document.body && current !== document.documentElement) {
      if (!current.closest("[data-spaces-root]")) nextPath.push(current);
      current = current.parentElement;
    }
    setPath(nextPath);
    setPathIndex(0);
  };

  const endPicking = () => {
    setPicking(false);
    setPath([]);
    setPathIndex(0);
    window.dispatchEvent(new CustomEvent("spaces:element-capture-ended"));
  };

  const captureVisibleTab = async () => {
    const response = await chrome.runtime.sendMessage({ type: "SPACES_CAPTURE_VISIBLE_TAB" });
    if (response?.error) throw new Error(response.error);
    return response?.dataUrl as string;
  };

  const cropVisibleTab = async (element: HTMLElement) => {
    element.scrollIntoView({ block: "center", inline: "center" });
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    const rect = element.getBoundingClientRect();
    const dataUrl = await captureVisibleTab();
    const image = new window.Image();
    image.src = dataUrl;
    await image.decode();
    const scaleX = image.naturalWidth / window.innerWidth;
    const scaleY = image.naturalHeight / window.innerHeight;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(rect.width * scaleX));
    canvas.height = Math.max(1, Math.round(rect.height * scaleY));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to crop captured tab");
    context.drawImage(
      image,
      Math.max(0, rect.left * scaleX),
      Math.max(0, rect.top * scaleY),
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    return canvas.toDataURL("image/png");
  };

  const captureElement = async (element: HTMLElement) => {
    const pageSource = getPageSource();
    let src: string;
    try {
      // html-to-image can fail when remote assets/fonts violate CORS; the visible-tab crop below keeps capture usable.
      src = await toPng(element, { cacheBust: true, skipFonts: false } as Parameters<typeof toPng>[1]);
    } catch {
      src = await cropVisibleTab(element);
    }
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[href]")).map((link) => link.href);
    const images = Array.from(element.querySelectorAll<HTMLImageElement>("img[src]")).map((image) => image.currentSrc || image.src);
    const payload: DraftPayload = {
      ...pageSource,
      type: "element",
      src,
      thumbnailUrl: src,
      content: element.innerText.trim(),
      links: Array.from(new Set(links)),
      images: Array.from(new Set(images)),
      platform: detectPlatform(pageSource.sourceUrl),
    };
    window.dispatchEvent(new CustomEvent("spaces:add-payload", { detail: payload }));
  };

  useEffect(() => {
    const startElementCapture = () => {
      setSelection(null);
      setHoverCapture(null);
      setPicking(true);
      window.dispatchEvent(new CustomEvent("spaces:element-capture-started"));
    };
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        startElementCapture();
      }
    };

    window.addEventListener("spaces:start-element-capture", startElementCapture);
    document.addEventListener("keydown", handleShortcut, true);
    return () => {
      window.removeEventListener("spaces:start-element-capture", startElementCapture);
      document.removeEventListener("keydown", handleShortcut, true);
    };
  }, []);

  useEffect(() => {
    if (!picking) return;

    const handleMove = (event: MouseEvent) => {
      setElementPath(document.elementFromPoint(event.clientX, event.clientY));
    };
    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const element = pickedElement;
      if (!element) return;
      void captureElement(element).finally(endPicking);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        endPicking();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setPathIndex((index) => (path.length ? Math.min(path.length - 1, index + 1) : 0));
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setPathIndex((index) => Math.max(0, index - 1));
      }
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setPathIndex((index) => (path.length ? (event.deltaY < 0 ? Math.min(path.length - 1, index + 1) : Math.max(0, index - 1)) : 0));
    };

    document.addEventListener("mousemove", handleMove, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKey, true);
    document.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    return () => {
      document.removeEventListener("mousemove", handleMove, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKey, true);
      document.removeEventListener("wheel", handleWheel, true);
    };
  }, [path.length, pickedElement, picking]);

  useEffect(() => {
    if (picking) return;
    const handleMouseUp = () => {
      setTimeout(() => {
        const active = window.getSelection();
        const text = active?.toString().trim();
        if (!active || !text || active.rangeCount === 0) {
          setSelection(null);
          return;
        }
        const rect = active.getRangeAt(0).getBoundingClientRect();
        setSelection({
          text,
          x: Math.min(window.innerWidth - 170, rect.left + rect.width / 2 - 70),
          y: Math.max(12, rect.top - 46),
        });
      }, 0);
    };

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-spaces-root]")) return;
      const image = target.closest("img") as HTMLImageElement | null;
      const media = target.closest("video,audio") as HTMLMediaElement | null;
      const link = target.closest("a") as HTMLAnchorElement | null;

      if (image) {
        const rect = image.getBoundingClientRect();
        setHoverCapture({
          x: rect.right - 22,
          y: rect.top + 10,
          payload: {
            type: "image",
            src: image.currentSrc || image.src,
            content: image.alt || "Captured image",
          },
        });
        return;
      }

      if (media) {
        const rect = media.getBoundingClientRect();
        setHoverCapture({
          x: rect.right - 22,
          y: rect.top + 10,
          payload: {
            type: media.tagName.toLowerCase() === "audio" ? "audio" : "video",
            src: media.currentSrc || media.getAttribute("src") || undefined,
            url: window.location.href,
            content: document.title,
          },
        });
        return;
      }

      if (link?.href) {
        const rect = link.getBoundingClientRect();
        setHoverCapture({
          x: Math.min(window.innerWidth - 44, rect.right + 8),
          y: rect.top - 2,
          payload: {
            type: /\.(mp4|mov|webm)$/i.test(link.href) ? "video" : /\.(mp3|wav|m4a)$/i.test(link.href) ? "audio" : "link",
            url: link.href,
            content: link.textContent?.trim() || link.href,
          },
        });
      }
    };

    const clearHover = () => setHoverCapture(null);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("scroll", clearHover, true);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("scroll", clearHover, true);
    };
  }, [picking]);

  const rect = pickedElement?.getBoundingClientRect();
  const breadcrumb = pickedElement
    ? `${pickedElement.tagName.toLowerCase()}${pickedElement.id ? `#${pickedElement.id}` : ""}${
        pickedElement.className && typeof pickedElement.className === "string" ? `.${pickedElement.className.trim().split(/\s+/).slice(0, 2).join(".")}` : ""
      }`
    : "Move over an element";

  return (
    <>
      {selection ? <CapturePill {...selection} /> : null}
      {hoverCapture ? <CaptureButton {...hoverCapture} /> : null}
      {picking ? (
        <>
          <div data-spaces-root className="fixed inset-0 z-[2147483645] bg-black/20" style={{ pointerEvents: "none" }} />
          {rect ? (
            <div
              data-spaces-root
              className="fixed z-[2147483646] rounded-sm border-2 border-white bg-white/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.12)]"
              style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height, pointerEvents: "none" }}
            >
              <div className="absolute left-0 top-0 -translate-y-full rounded-t-md bg-white px-2 py-1 text-[11px] font-semibold text-[#0a0a0b]">
                {breadcrumb}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}
