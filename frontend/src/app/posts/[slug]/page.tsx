import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarkdownContent from "@/components/MarkdownContent";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/cms";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = estimateReadingTime(post.content);
  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_48px] -z-10"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[1200px] w-[1200px] rounded-full bg-neutral-400 opacity-10 blur-[100px]"></div>
      </div>

      <Navbar />

      <main className="flex-grow">
        <article className="relative z-20 w-[896px] mx-auto mt-32 mb-12">
          <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-8">
            <time>{date}</time>
            <span>•</span>
            <span>{post.author}</span>
            <span>•</span>
            <span>{readingTime} min read</span>
          </div>
          <MarkdownContent content={post.content} />
        </article>
      </main>

      <Footer />
    </div>
  );
}
