import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarkdownContent from "@/components/MarkdownContent";
import ComparisonSlider from "@/components/gallery/ComparisonSlider";
import { getAllGalleryPhotos, getGalleryPhotoBySlug, resolveMediaUrl } from "@/lib/cms";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const photos = await getAllGalleryPhotos();
  return photos.map((photo) => ({ slug: photo.slug }));
}

const GEAR_LABELS: Record<string, string> = {
  telescope: "Telescope",
  camera: "Camera",
  mount: "Mount",
  filters: "Filters",
  exposureTotal: "Total Exposure",
  subExposure: "Sub Exposures",
  isoOrGain: "ISO / Gain",
  guiding: "Guiding",
  softwareUsed: "Software",
  bortleScale: "Bortle Scale",
};

export default async function GalleryPhotoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const photo = await getGalleryPhotoBySlug(slug);

  if (!photo) {
    notFound();
  }

  const heroUrl = resolveMediaUrl(photo.capturedImage.formats?.large?.url ?? photo.capturedImage.url);
  const gearEntries = photo.gearSetup
    ? Object.entries(GEAR_LABELS)
        .map(([key, label]) => [label, (photo.gearSetup as any)[key]] as const)
        .filter(([, value]) => Boolean(value))
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative">
        <Navbar light />
        <div className="relative w-full h-[60vh] min-h-[360px] overflow-hidden">
          {/* Blurred, oversized cover-fill backdrop — the photo's real aspect
              ratio rarely matches this banner, so instead of hard-cropping it
              we blur the fill so the crop isn't jarring. The actual
              uncropped photo is shown properly below, before the
              description. */}
          <Image
            src={heroUrl}
            alt=""
            aria-hidden="true"
            fill
            priority
            className="object-cover scale-110 blur-2xl brightness-75"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(4,3,12,0.85) 0%, rgba(4,3,12,0.25) 55%, rgba(4,3,12,0.35) 100%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-8 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{photo.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-200">
              {photo.objectName && <span>{photo.objectName}</span>}
              {photo.objectType && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                  {photo.objectType}
                </span>
              )}
              {photo.captureDate && (
                <span>
                  {new Date(photo.captureDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              {photo.location && <span>{photo.location}</span>}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        <section className="max-w-4xl mx-auto px-7 lg:px-0 mt-8">
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-900">
            <Image
              src={heroUrl}
              alt={photo.title}
              width={photo.capturedImage.width}
              height={photo.capturedImage.height}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-7 lg:px-0 mt-12">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">About this object</h2>
          <MarkdownContent content={photo.description} />
        </section>

        {gearEntries.length > 0 && (
          <section className="max-w-4xl mx-auto px-7 lg:px-0 mt-12">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Gear &amp; Setup</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
              {gearEntries.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</dt>
                  <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {photo.additionalImages && photo.additionalImages.length > 0 && (
          <section className="max-w-4xl mx-auto px-7 lg:px-0 mt-12">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Additional Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photo.additionalImages.map((img) => (
                <div key={img.id} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <Image
                    src={resolveMediaUrl(img.formats?.medium?.url ?? img.url)}
                    alt={photo.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {photo.professionalComparison && (
          <section className="max-w-4xl mx-auto px-7 lg:px-0 mt-12 mb-16">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Compare with Professional Imagery
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Drag the slider to compare my capture against{" "}
              {photo.professionalComparison.sourceLabel}.
            </p>
            <ComparisonSlider
              capturedImageUrl={resolveMediaUrl(
                photo.capturedImage.formats?.large?.url ?? photo.capturedImage.url
              )}
              professionalImageUrl={resolveMediaUrl(
                photo.professionalComparison.image.formats?.large?.url ??
                  photo.professionalComparison.image.url
              )}
              professionalLabel={photo.professionalComparison.sourceLabel}
              professionalCredit={photo.professionalComparison.credit ?? undefined}
              professionalSourceUrl={photo.professionalComparison.sourceUrl ?? undefined}
            />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
