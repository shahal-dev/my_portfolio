import Link from "next/link";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/cms";
import type { GalleryPhotoSummary } from "@/types/cms";

const galleryConfig = {
  title: "Astro Photo Gallery",
  description:
    "Deep-sky captures from my own telescope, each paired with a professional comparison and the gear used to get the shot.",
  empty: "No photos yet — check back soon.",
};

function thumbnailUrl(photo: GalleryPhotoSummary): string {
  const formats = photo.capturedImage.formats;
  const url = formats?.medium?.url ?? formats?.small?.url ?? photo.capturedImage.url;
  return resolveMediaUrl(url);
}

export default function GalleryContent({ photos }: { photos: GalleryPhotoSummary[] }) {
  return (
    <section className="relative z-20 max-w-4xl mx-auto mt-32 mb-12 px-7 lg:px-0">
      <div className="relative z-20 w-full mx-auto lg:mx-0">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">
          {galleryConfig.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:leading-7 lg:leading-8 sm:text-base lg:text-lg">
          {galleryConfig.description}
        </p>
      </div>

      {photos.length === 0 ? (
        <p className="mt-8 text-neutral-600 dark:text-neutral-400">{galleryConfig.empty}</p>
      ) : (
        <div className="z-50 grid items-stretch w-full grid-cols-1 my-8 gap-7 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <Link
              key={photo.slug}
              href={`/gallery/${photo.slug}`}
              className="relative flex flex-col items-stretch duration-300 ease-out p-7 sm:p-3 group h-100 rounded-2xl"
            >
              <span className="absolute inset-0 z-20 block w-full h-full duration-300 ease-out bg-transparent border border-transparent border-dashed group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:border group-hover:border-neutral-300 dark:group-hover:border-neutral-600 group-hover:border-dashed rounded-2xl group-hover:bg-white dark:group-hover:bg-neutral-950"></span>
              <span className="absolute inset-0 z-10 block w-full h-full duration-300 ease-out border border-dashed rounded-2xl border-neutral-300 dark:border-neutral-600 group-hover:translate-x-1 group-hover:translate-y-1"></span>
              <span className="relative z-30 block duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1">
                <span className="block w-full">
                  <Image
                    src={thumbnailUrl(photo)}
                    alt={photo.title}
                    width={800}
                    height={450}
                    className="w-full h-auto rounded-lg aspect-[16/9] object-cover"
                  />
                </span>
                <span className="block w-full px-1 mt-5 mb-1 sm:mt-3">
                  <span className="flex items-center mb-0 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    <span>{photo.title}</span>
                    <svg
                      className="group-hover:translate-x-0 group-hover:translate-y-0 -rotate-45 translate-y-1 -translate-x-1 w-2.5 h-2.5 stroke-current ml-1 transition-all ease-in-out duration-200 transform"
                      viewBox="0 0 13 15"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
                        <g id="svg" transform="translate(0.666667, 2.333333)" stroke="currentColor" strokeWidth="2.4">
                          <g>
                            <polyline className="transition-all duration-200 ease-out opacity-0 delay-0 group-hover:opacity-100" points="5.33333333 0 10.8333333 5.5 5.33333333 11"></polyline>
                            <line className="transition-all duration-200 ease-out transform -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:ml-0" x1="10.8333333" y1="5.5" x2="0.833333333" y2="5.16666667"></line>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </span>
                  {photo.objectName && (
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 block truncate">
                      {photo.objectName}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
