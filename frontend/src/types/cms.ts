// Types matching Strapi v5's flattened REST response shape (fields sit
// directly on the object — no v4-style `data.attributes` nesting).

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

export interface StrapiMedia {
  id: number;
  url: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: StrapiMedia | null;
  author: string;
  // Comma-separated (plain text field — Strapi 5.50.1's JSON field admin
  // editor is broken, see cms schema comments).
  tags?: string | null;
  publishedAt: string;
}

export type BlogPostSummary = Pick<
  BlogPost,
  'id' | 'documentId' | 'title' | 'slug' | 'excerpt' | 'coverImage' | 'author' | 'publishedAt'
>;

export interface GearSetup {
  id: number;
  telescope?: string | null;
  camera?: string | null;
  mount?: string | null;
  filters?: string | null;
  exposureTotal?: string | null;
  subExposure?: string | null;
  isoOrGain?: string | null;
  guiding?: string | null;
  softwareUsed?: string | null;
  bortleScale?: string | null;
}

export interface ProfessionalComparison {
  id: number;
  image: StrapiMedia;
  sourceLabel: string;
  credit?: string | null;
  sourceUrl?: string | null;
}

export interface GalleryPhoto {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  objectName?: string | null;
  objectType?: string | null;
  description: string;
  capturedImage: StrapiMedia;
  additionalImages?: StrapiMedia[] | null;
  captureDate?: string | null;
  location?: string | null;
  gearSetup?: GearSetup | null;
  professionalComparison?: ProfessionalComparison | null;
  // Comma-separated (plain text field — Strapi 5.50.1's JSON field admin
  // editor is broken, see cms schema comments).
  tags?: string | null;
  publishedAt: string;
}

export type GalleryPhotoSummary = Pick<
  GalleryPhoto,
  'id' | 'documentId' | 'title' | 'slug' | 'objectName' | 'objectType' | 'capturedImage' | 'publishedAt'
>;

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
