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
    return <div className="max-w-3xl mx-auto px-4 py-10">Loading...</div>;
  if (error || !article)
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-red-500">{error}</div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button
        onClick={() => router.back()}
        className="text-sm text-blue-600 hover:underline mb-6 block"
      >
        ← Back to results
      </button>

      <h1 className="text-3xl font-bold mb-2">{article.title}</h1>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 text-sm hover:underline mb-8 block"
      >
        View on Wikipedia →
      </a>

      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
        {article.text}
      </div>
    </div>
  );
}