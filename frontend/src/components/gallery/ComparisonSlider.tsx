'use client';

import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface ComparisonSliderProps {
  capturedImageUrl: string;
  capturedLabel?: string;
  professionalImageUrl: string;
  professionalLabel: string;
  professionalCredit?: string;
  professionalSourceUrl?: string;
}

export default function ComparisonSlider({
  capturedImageUrl,
  capturedLabel = 'My Capture',
  professionalImageUrl,
  professionalLabel,
  professionalCredit,
  professionalSourceUrl,
}: ComparisonSliderProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-dashed border-neutral-300 dark:border-neutral-700">
      <div className="relative">
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage src={capturedImageUrl} alt={capturedLabel} />
          }
          itemTwo={
            <ReactCompareSliderImage src={professionalImageUrl} alt={professionalLabel} />
          }
          style={{ aspectRatio: '16 / 10', width: '100%' }}
        />
        <span className="pointer-events-none absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-medium rounded-full bg-black/60 text-white backdrop-blur-sm">
          {capturedLabel}
        </span>
        <span className="pointer-events-none absolute top-3 right-3 z-10 px-2.5 py-1 text-xs font-medium rounded-full bg-black/60 text-white backdrop-blur-sm">
          {professionalLabel}
        </span>
      </div>
      {(professionalCredit || professionalSourceUrl) && (
        <div className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-950">
          {professionalLabel} image
          {professionalCredit ? ` — ${professionalCredit}` : ''}
          {professionalSourceUrl && (
            <>
              {' · '}
              <a
                href={professionalSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-neutral-900 dark:hover:text-white"
              >
                source
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
