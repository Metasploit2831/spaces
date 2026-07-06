export type CardType = "text" | "image" | "link" | "video" | "audio" | "screenshot" | "file" | "element";

export type Platform =
  | "instagram"
  | "twitter"
  | "linkedin"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "reddit"
  | "pinterest"
  | "github"
  | "web";

export type SpaceCard = {
  id: string;
  spaceId: string;
  type: CardType;
  platform: Platform;
  content?: string;
  src?: string;
  url?: string;
  thumbnailUrl?: string;
  faviconUrl?: string;
  links?: string[];
  images?: string[];
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

export type Space = {
  id: string;
  title: string;
  cards: SpaceCard[];
  createdAt: string;
  updatedAt: string;
};

export type DraftPayload = Partial<SpaceCard> & {
  type: CardType;
};
