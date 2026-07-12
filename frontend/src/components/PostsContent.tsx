"use client";
import { useState } from "react";
import PostCard from "@/components/PostCard";
import { resolveMediaUrl } from "@/lib/cms";
import type { BlogPostSummary } from "@/types/cms";

const POSTS_PER_PAGE = 5;

const postsConfig = {
  title: "Blog Posts",
  backButton: "Back to Home",
  pagination: { previous: "Previous", next: "Next" },
};

export default function PostsContent({ posts }: { posts: BlogPostSummary[] }) {
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <section className="relative z-20 w-[896px] mx-auto mt-32 mb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">
          {postsConfig.title}
        </h2>
      </div>

      {posts.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">
          No posts yet — check back soon.
        </p>
      ) : (
        <div className="flex flex-col items-stretch w-full gap-5">
          {currentPosts.map((post) => (
            <PostCard
              key={post.slug}
              title={post.title}
              description={post.excerpt}
              date={new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              href={`/posts/${post.slug}`}
              pattern="dots"
              imageUrl={post.coverImage ? resolveMediaUrl(post.coverImage.url) : undefined}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className={`px-3 py-1 text-sm font-medium text-neutral-600 dark:text-neutral-400 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {postsConfig.pagination.previous}
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              aria-current={index + 1 === currentPage ? "page" : undefined}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                index + 1 === currentPage
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className={`px-3 py-1 text-sm font-medium text-neutral-600 dark:text-neutral-400 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {postsConfig.pagination.next}
          </button>
        </div>
      )}
    </section>
  );
}
