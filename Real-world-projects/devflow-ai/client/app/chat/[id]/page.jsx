"use client";

import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/protected-route";
import DashboardShell from "@/components/layout/dashboard-shell";

// Keep chat window client-only because it relies on browser APIs and streaming.
const ChatWindow = dynamic(
  () => import("@/components/chat/chat-window"),
  { ssr: false }
);

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  if (!params?.id) return null;
  const initialTemplate = searchParams?.get("template") || "";

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="flex h-full min-h-0 flex-col">
          <h2 className="mb-4 text-2xl font-semibold">Chat Session</h2>
          <div className="min-h-0 flex-1">
            <ChatWindow chatId={params.id} initialPrompt={initialTemplate} />
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}