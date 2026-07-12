'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import { homeConfig } from '@/config/home';

// three.js is heavy, so the galaxy loads in its own chunk after hydration and
// never runs on the server.
const GalaxyBackdrop = dynamic(
  () => import("./GalaxyBackdrop").then((m) => m.GalaxyBackdrop),
  { ssr: false },
);

export default function HomeContent() {
  return (
    <div className="flex-1 flex flex-col sm:flex-row">
      <div className="w-full sm:w-1/2 bg-white dark:bg-neutral-950 flex items-center px-6 py-24 sm:px-12 sm:py-0 lg:px-16">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            {homeConfig.greeting}
          </h1>
          <p className="mt-3 text-lg leading-7 text-neutral-600 dark:text-neutral-400">
            {homeConfig.description}
          </p>
          <div className="flex flex-row gap-4 mt-4">
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              View About
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            <Link
              href="/posts"
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-900 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              {homeConfig.buttons.readPosts}
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative w-full sm:w-1/2 min-h-[360px] sm:min-h-0">
        <GalaxyBackdrop />
      </div>
    </div>
  );
}
