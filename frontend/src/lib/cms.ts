// Typed Strapi client. This site is a static export (`output: 'export'` in
// next.config.js), so every function here only ever runs at `next build`
// time (inside async Server Components / generateStaticParams) — there is
// no request-time server to call Strapi from once deployed. Publishing new
// content in Strapi requires a rebuild, by design.

import type {
  BlogPost,
  BlogPostSummary,
  GalleryPhoto,
  GalleryPhotoSummary,
  StrapiListResponse,
} from '@/types/cms';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';

export function resolveMediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

async function strapiFetch<T>(path: string): Promise<T> {
  // Plain fetch (default caching) — required for `output: 'export'`, which
  // needs every fetch to be staticly cacheable within the build. Staleness
  // *across* separate build invocations is handled by clearing
  // .next/cache before each build (see the "prebuild" npm script), not by
  // opting out of caching here.
  const res = await fetch(`${STRAPI_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Strapi request failed (${res.status}): ${STRAPI_URL}${path}`);
  }
  return res.json() as Promise<T>;
}

export async function getAllBlogPosts(): Promise<BlogPostSummary[]> {
  const query =
    '/api/blog-posts?' +
    'fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=author&fields[4]=publishedAt' +
    '&populate[coverImage]=true' +
    '&sort=publishedAt:desc' +
    '&pagination[pageSize]=100';
  const json = await strapiFetch<StrapiListResponse<BlogPostSummary>>(query);
  return json.data;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = `/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[coverImage]=true`;
  const json = await strapiFetch<StrapiListResponse<BlogPost>>(query);
  return json.data[0] ?? null;
}

export async function getAllGalleryPhotos(): Promise<GalleryPhotoSummary[]> {
  const query =
    '/api/gallery-photos?' +
    'fields[0]=title&fields[1]=slug&fields[2]=objectName&fields[3]=objectType&fields[4]=publishedAt' +
    '&populate[capturedImage]=true' +
    '&sort=publishedAt:desc' +
    '&pagination[pageSize]=100';
  const json = await strapiFetch<StrapiListResponse<GalleryPhotoSummary>>(query);
  return json.data;
}

export async function getGalleryPhotoBySlug(slug: string): Promise<GalleryPhoto | null> {
  const query =
    `/api/gallery-photos?filters[slug][$eq]=${encodeURIComponent(slug)}` +
    '&populate[capturedImage]=true' +
    '&populate[additionalImages]=true' +
    '&populate[gearSetup]=true' +
    '&populate[professionalComparison][populate][image]=true';
  const json = await strapiFetch<StrapiListResponse<GalleryPhoto>>(query);
  return json.data[0] ?? null;
}
