import { useMemo, useState } from "react";
import { domainFromUrl, relativeTime } from "../lib/sourceMetadata";
import { Space } from "../types/space";
import { GallerySpace, SpacesGallery } from "@spaces/ui";

type SpacesHomeProps = {
  spaces: Space[];
  onCreate: () => void;
  onOpen: (space: Space) => void;
  onRename: (space: Space, title: string) => void;
  onDuplicate: (space: Space) => void;
  onDelete: (space: Space) => void;
};

function toGallerySpace(space: Space): GallerySpace {
  const source = space.cards.find((card) => card.sourceUrl || card.url);
  return {
    id: space.id,
    title: space.title,
    saveCount: space.cards.length,
    updatedLabel: `Updated ${relativeTime(space.updatedAt)}`,
    sourceLabel: domainFromUrl(source?.sourceUrl || source?.url),
    previewUrls: space.cards
      .filter((card) => card.type === "image" || card.type === "screenshot")
      .map((card) => card.src)
      .filter((src): src is string => Boolean(src))
      .slice(0, 4),
  };
}

export function SpacesHome({ spaces, onCreate, onOpen, onRename, onDuplicate, onDelete }: SpacesHomeProps) {
  const [query, setQuery] = useState("");
  const gallerySpaces = useMemo(() => spaces.map(toGallerySpace), [spaces]);
  const byId = useMemo(() => new Map(spaces.map((space) => [space.id, space])), [spaces]);

  const getSpace = (id: string) => byId.get(id);

  return (
    <SpacesGallery
      spaces={gallerySpaces}
      query={query}
      onQueryChange={setQuery}
      onCreate={onCreate}
      onOpen={(id) => {
        const space = getSpace(id);
        if (space) onOpen(space);
      }}
      onRename={(id) => {
        const space = getSpace(id);
        if (space) onRename(space, prompt("Rename space", space.title) || space.title);
      }}
      onDuplicate={(id) => {
        const space = getSpace(id);
        if (space) onDuplicate(space);
      }}
      onDelete={(id) => {
        const space = getSpace(id);
        if (space) onDelete(space);
      }}
    />
  );
}
