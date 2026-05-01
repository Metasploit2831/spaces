import { SpaceCard } from "../types/space";

export type Rect = { x: number; y: number; width: number; height: number };

export function rectsIntersect(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function normalizeRect(startX: number, startY: number, endX: number, endY: number): Rect {
  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };
}

export function computeBoundingBox(cards: SpaceCard[]): Rect | null {
  if (!cards.length) return null;
  const left = Math.min(...cards.map((card) => card.x));
  const top = Math.min(...cards.map((card) => card.y));
  const right = Math.max(...cards.map((card) => card.x + card.width));
  const bottom = Math.max(...cards.map((card) => card.y + card.height));
  return { x: left - 16, y: top - 24, width: right - left + 32, height: bottom - top + 40 };
}
