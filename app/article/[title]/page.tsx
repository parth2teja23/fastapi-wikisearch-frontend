"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type Article = {
  title: string;
  text: string;
  url: string;
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const title = decodeURIComponent(params.title as string);

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/article/${encodeURIComponent(title)}`
        );
        if (!res.ok) throw new Error("Article not found");
        const data = await res.json();
        setArticle(data);
      } catch {
        setError("Could not load article.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticle();
  }, [title]);

  if (isLoading)
    return (
      <main className="min-h-screen w-full px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-300">
          Loading...
        </div>
      </main>
    );
  if (error || !article)
    return (
      <main className="min-h-screen w-full px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-3xl rounded-2xl border border-red-900/60 bg-zinc-900 p-8 text-center text-red-400">
          {error}
        </div>
      </main>
    );

  return (
    <main className="min-h-screen w-full px-4 py-10 flex items-center justify-center">
      <article className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-xl">
        <button
          onClick={() => router.back()}
          className="text-sm text-cyan-300 hover:text-cyan-200 hover:underline mb-6 block"
        >
          ← Back to results
        </button>

        <h1 className="text-3xl font-bold mb-2 text-white">{article.title}</h1>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 text-sm hover:text-cyan-300 hover:underline mb-8 block"
        >
          View on Wikipedia →
        </a>

        <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
          {article.text}
        </div>
      </article>
    </main>
  );
}