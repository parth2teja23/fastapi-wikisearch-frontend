"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

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

const SEARCH_PLACEHOLDERS = [
  "Search Wikipedia...",
  "Try: India",
  "Try: Solar system",
  "Try: Python (programming language)",
];

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

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  return (
    <main className="min-h-screen w-full px-4 py-10 flex flex-col items-center justify-center">
      <section className="w-full max-w-2xl text-center">
      <h1 className="text-4xl font-bold mb-6 text-white">WikiSearch</h1>

      <div className="mb-6">
        <PlaceholdersAndVanishInput
          placeholders={SEARCH_PLACEHOLDERS}
          onChange={handleQueryChange}
          onSubmit={handleSearch}
        />
      </div>

      {isLoading && <p className="text-sm text-gray-300 mb-4">Searching...</p>}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {data && (
        <p className="text-gray-300 text-sm mb-4">
          {data.total} results for <strong>{data.query}</strong>
        </p>
      )}

      <div className="flex flex-col gap-3">
        {data?.results.map((hit) => (
          <Link
            key={hit.title}
            href={`/article/${encodeURIComponent(hit.title)}`}
            className="block border border-zinc-700 rounded-lg p-4 bg-zinc-900 hover:bg-zinc-800 hover:border-cyan-400 transition cursor-pointer text-left"
          >
            <h2 className="text-base font-semibold text-cyan-300">{hit.title}</h2>
            {hit.excerpt && (
              <p className="text-gray-300 text-sm mt-1 line-clamp-3">
                {hit.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
      </section>
    </main>
  );
}