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
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/chats").then((res) => setChats(res.data.data)).catch(() => {});
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
                  className="rounded-md border border-slate-200 p-3 text-left transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  {template}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-lg font-medium">Recent Chats</h3>
            <div className="space-y-2">
              {chats.map((chat) => (
                <Link key={chat._id} className="block rounded border border-slate-200 p-3 dark:border-slate-800" href={`/chat/${chat._id}`}>
                  {chat.title}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
