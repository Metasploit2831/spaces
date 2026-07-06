import { toPng } from "html-to-image";
import { useEffect, useMemo, useState } from "react";
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
  const [overlayHidden, setOverlayHidden] = useState(false);

  const pickedElement = path[path.length - 1] || null;

  const isSpacesElement = (element: Element | null) => Boolean(element?.closest("[data-spaces-ui], [data-spaces-root]"));

  const readElementFromPoint = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y);
    if (!(element instanceof HTMLElement) || isSpacesElement(element)) return null;
    return element;
  };

  const resetPathToLeaf = (element: HTMLElement | null) => {
    setPath((current) => {
      if (!element) return [];
      if (current[0] === element) return current;
      return [element];
    });
  };

  const growSelection = () => {
    setPath((current) => {
      const selected = current[current.length - 1];
      const parent = selected?.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement || isSpacesElement(parent)) return current;
      return [...current, parent];
    });
  };

  const shrinkSelection = () => {
    setPath((current) => (current.length > 1 ? current.slice(0, -1) : current));
  };

  const endPicking = () => {
    setPicking(false);
    setPath([]);
    setOverlayHidden(false);
    window.dispatchEvent(new CustomEvent("spaces:element-capture-ended"));
  };

  const captureVisibleTab = async () => {
    const response = await chrome.runtime.sendMessage({ type: "SPACES_CAPTURE_VISIBLE_TAB" });
    if (response?.error) throw new Error(response.error);
    return response?.dataUrl as string;
  };

  const cropVisibleTab = async (element: HTMLElement) => {
    element.scrollIntoView({ block: "center", inline: "center" });
    await new Promise((resolve) => window.setTimeout(resolve, 160));
    const rect = element.getBoundingClientRect();
    const dataUrl = await captureVisibleTab();
    const image = new window.Image();
    image.src = dataUrl;
    await image.decode();
    const scaleX = image.naturalWidth / window.innerWidth;
    const scaleY = image.naturalHeight / window.innerHeight;
    const sourceLeft = Math.max(0, rect.left);
    const sourceTop = Math.max(0, rect.top);
    const sourceRight = Math.min(window.innerWidth, rect.right);
    const sourceBottom = Math.min(window.innerHeight, rect.bottom);
    const sourceWidth = Math.max(1, sourceRight - sourceLeft);
    const sourceHeight = Math.max(1, sourceBottom - sourceTop);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sourceWidth * scaleX));
    canvas.height = Math.max(1, Math.round(sourceHeight * scaleY));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to crop captured tab");
    context.drawImage(
      image,
      sourceLeft * scaleX,
      sourceTop * scaleY,
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
    setOverlayHidden(true);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    try {
      // Remote images/fonts can still fail under CORS; the visible-tab crop below keeps capture usable.
      src = await toPng(element, { cacheBust: true, pixelRatio: 2 });
    } catch {
      // Large elements taller than the viewport are captured fully by html-to-image; this fallback only captures the visible portion.
      src = await cropVisibleTab(element);
    }
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[href]")).map((link) => link.href);
    const images = Array.from(element.querySelectorAll<HTMLImageElement>("img[src]")).map((image) => image.currentSrc || image.src);
    const payload: DraftPayload = {
      ...pageSource,
      type: "element",
      src,
      thumbnailUrl: src,
      captures: [src],
      content: element.innerText.trim(),
      links: Array.from(new Set(links)),
      images: Array.from(new Set(images)),
      sourceUrl: window.location.href,
      pageTitle: document.title || pageSource.pageTitle,
      platform: detectPlatform(window.location.href),
    };
    window.dispatchEvent(new CustomEvent("spaces:add-payload", { detail: payload }));
  };

  useEffect(() => {
    const startElementCapture = () => {
      setSelection(null);
      setHoverCapture(null);
      setPath([]);
      setOverlayHidden(false);
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
      resetPathToLeaf(readElementFromPoint(event.clientX, event.clientY));
    };
    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const element = pickedElement;
      if (!element) return;
      void captureElement(element).finally(endPicking);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        endPicking();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        growSelection();
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        shrinkSelection();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        const element = pickedElement;
        if (!element) return;
        void captureElement(element).finally(endPicking);
      }
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.deltaY < 0) growSelection();
      else shrinkSelection();
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
  }, [pickedElement, picking]);

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
      if (!target || target.closest("[data-spaces-ui], [data-spaces-root]")) return;
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
  const describeElement = (element: HTMLElement) =>
    `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${
      element.className && typeof element.className === "string" ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}` : ""
    }`;
  const breadcrumb = useMemo(() => (path.length ? path.map(describeElement).join(" › ") : "Move over an element"), [path]);
  const label = pickedElement && rect ? `${describeElement(pickedElement)} ${Math.round(rect.width)}×${Math.round(rect.height)}` : "Move over an element";

  return (
    <>
      {selection ? <CapturePill {...selection} /> : null}
      {hoverCapture ? <CaptureButton {...hoverCapture} /> : null}
      {picking && !overlayHidden ? (
        <>
          <div data-spaces-root data-spaces-ui className="fixed inset-0 z-[2147483645] bg-black/20" style={{ pointerEvents: "none" }} />
          {rect ? (
            <div
              data-spaces-root
              data-spaces-ui
              className="fixed z-[2147483646] rounded-sm border-2 border-white bg-white/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.12)]"
              style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height, pointerEvents: "none" }}
            >
              <div className="absolute left-0 top-0 max-w-[min(420px,calc(100vw-24px))] -translate-y-full rounded-t-md bg-white px-2 py-1 text-[11px] font-semibold text-[#0a0a0b] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                <div className="truncate">{label}</div>
                <div className="truncate text-[10px] font-medium text-[#3f4248]">{breadcrumb}</div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}
