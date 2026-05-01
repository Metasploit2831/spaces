import { useEffect, useState } from "react";
import { CaptureButton } from "./CaptureButton";
import { CapturePill } from "./CapturePill";
import { DraftPayload } from "../types/space";

type HoverCapture = {
  x: number;
  y: number;
  payload: DraftPayload;
};

export function CaptureLayer() {
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [hoverCapture, setHoverCapture] = useState<HoverCapture | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <>
      {selection ? <CapturePill {...selection} /> : null}
      {hoverCapture ? <CaptureButton {...hoverCapture} /> : null}
    </>
  );
}
