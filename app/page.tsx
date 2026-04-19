"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type SearchHit = {
  title: string;
  excerpt?: string;
  url?: string;
};

type SearchResponse = {
  query: string;
  total: number;
  results: SearchHit[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const [query, setQuery] = useState("india");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Type a query first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search?q=${encodeURIComponent(trimmed)}&limit=10`
      );
      const payload = (await response.json()) as SearchResponse | { detail: string };
      if (!response.ok) {
        const message = "detail" in payload ? payload.detail : "Search failed";
        throw new Error(message);
      }
      setData(payload as SearchResponse);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not reach API.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">WikiSearch</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Wikipedia..."
          className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {data && (
        <p className="text-gray-500 text-sm mb-4">
          {data.total} results for <strong>{data.query}</strong>
        </p>
      )}

      <div className="flex flex-col gap-3">
        {data?.results.map((hit) => (
          <Link
            key={hit.title}
            href={`/article/${encodeURIComponent(hit.title)}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition cursor-pointer"
          >
            <h2 className="text-base font-semibold text-blue-700">{hit.title}</h2>
            {hit.excerpt && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-3">
                {hit.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}