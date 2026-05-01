export type CardType = "text" | "image" | "link" | "video" | "audio" | "screenshot" | "file";

export type SpaceCard = {
  id: string;
  spaceId: string;
  type: CardType;
  content?: string;
  src?: string;
  url?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  sourceUrl?: string;
  pageTitle?: string;
  createdAt: string;
};

export type SpaceGroup = {
  id: string;
  spaceId: string;
  title: string;
  cardIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: string;
};

export type Space = {
  id: string;
  title: string;
  cards: SpaceCard[];
  groups: SpaceGroup[];
  createdAt: string;
  updatedAt: string;
};

export type DraftPayload = Partial<SpaceCard> & {
  type: CardType;
};
