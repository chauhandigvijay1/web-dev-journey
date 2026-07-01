"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const templates = [
  "Explain this bug in my code",
  "Refactor this function for readability",
  "Generate unit tests for this logic",
];

export default function DashboardPage() {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/api/chats").then((res) => {
      if (!cancelled) setChats(res.data.data || []);
    }).catch((err) => {
      if (!cancelled) setError("Unable to load chats. Check your connection.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const createChat = async (template = "") => {
    setError("");
    try {
      const { data } = await api.post("/api/chats", { title: "New Chat" });
      if (template) {
        router.push(`/chat/${data.data._id}?template=${encodeURIComponent(template)}`);
        return;
      }
      router.push(`/chat/${data.data._id}`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to create chat.");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <Button onClick={createChat}>New Chat</Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <section>
            <h3 className="mb-2 text-lg font-medium">Prompt Templates</h3>
            <div className="grid gap-2">
              {templates.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => createChat(template)}
                  className="rounded-md border border-zinc-200 p-3 text-left transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  {template}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-lg font-medium">Recent Chats</h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No chats yet</p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Start a new chat to see it here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <Link key={chat._id} className="block rounded border border-zinc-200 p-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900" href={`/chat/${chat._id}`}>
                    {chat.title}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
