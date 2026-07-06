import { GroupAnalysis } from "@spaces/ui";
import { domainFromUrl } from "./sourceMetadata";
import { CardType, SpaceCard, SpaceGroup } from "../types/space";

const cardTypes: CardType[] = ["text", "image", "link", "video", "audio", "screenshot", "file"];

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

function countsToList(map: Map<string, number>) {
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function analyzeGroup(group: SpaceGroup, cards: SpaceCard[]): GroupAnalysis {
  const groupCards = cards.filter((card) => group.cardIds.includes(card.id));
  const sourceCounts = new Map<string, number>();
  const typeCounts = new Map<CardType, number>(cardTypes.map((type) => [type, 0]));
  const links: string[] = [];
  const screenshotSources: string[] = [];

  for (const card of groupCards) {
    typeCounts.set(card.type, (typeCounts.get(card.type) || 0) + 1);

    if (card.url) links.push(card.url);
    if (card.sourceUrl) links.push(card.sourceUrl);

    const source = card.url || card.sourceUrl;
    if (source) increment(sourceCounts, domainFromUrl(source));

    if (card.type === "screenshot") {
      const sourceDomain = domainFromUrl(card.sourceUrl);
      screenshotSources.push(`captured from ${sourceDomain}`);
    }
  }

  const sourceBreakdown = countsToList(sourceCounts);
  const typeCensus = countsToList(typeCounts);
  const todoHints: string[] = [];
  const hasScreenshots = groupCards.some((card) => card.type === "screenshot" || card.type === "image");
  const hasText = groupCards.some((card) => card.type === "text" && card.content?.trim());
  const dominantSource = sourceBreakdown[0];
  const linkCount = groupCards.filter((card) => card.type === "link" || card.url).length;

  if (dominantSource && dominantSource.count >= 2) {
    todoHints.push(`Consolidate the ${dominantSource.count} references from ${dominantSource.label}.`);
  }
  if (hasScreenshots && hasText) {
    todoHints.push("Turn the screenshots and notes into a short spec or implementation checklist.");
  }
  if (linkCount >= 3) {
    todoHints.push("Review the link cluster and keep only the strongest references.");
  }
  if (groupCards.some((card) => card.type === "file")) {
    todoHints.push("Name the attached files by purpose so this group is easier to scan later.");
  }
  if (!todoHints.length) {
    todoHints.push("Add one note that explains why these items belong together.");
  }

  return {
    groupTitle: group.title || "Selection",
    itemCount: groupCards.length,
    sourceBreakdown,
    links: unique(links),
    typeCensus,
    screenshotSources: unique(screenshotSources),
    todos: todoHints,
    generatedAt: new Date().toISOString(),
  };
}
