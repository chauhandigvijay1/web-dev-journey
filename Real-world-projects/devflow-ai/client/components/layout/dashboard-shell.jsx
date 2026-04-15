"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardShell({ children }) {
  const [chats, setChats] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentChatId = useMemo(() => {
    if (!pathname?.startsWith("/chat/")) return null;
    return pathname.split("/chat/")[1] || null;
  }, [pathname]);

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await api.get("/api/chats");
      setChats(data.data || []);
    } catch (error) {
      if (error?.response?.status === 401) {
        setChats([]);
        return;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchChats().catch(() => {});
  }, [fetchChats]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refetch = () => fetchChats().catch(() => {});
    window.addEventListener("devflow:chat-updated", refetch);
    return () => window.removeEventListener("devflow:chat-updated", refetch);
  }, [fetchChats]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedWidth = window.localStorage.getItem("devflow_sidebar_width");
    if (!savedWidth) return;
    const parsed = Number(savedWidth);
    if (!Number.isNaN(parsed) && parsed >= 200 && parsed <= 400) {
      setSidebarWidth(parsed);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMouseMove = (event) => {
      if (!isResizing || sidebarCollapsed) return;
      const nextWidth = Math.min(400, Math.max(200, event.clientX));
      setSidebarWidth(nextWidth);
    };

    const onMouseUp = () => {
      if (!isResizing) return;
      setIsResizing(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing, sidebarCollapsed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sidebarCollapsed) {
      window.localStorage.setItem("devflow_sidebar_width", String(sidebarWidth));
    }
  }, [sidebarWidth, sidebarCollapsed]);

  const createChat = async () => {
    if (creatingChat) return;
    setCreatingChat(true);
    try {
      const { data } = await api.post("/api/chats", { title: "New Chat" });
      setChats((prev) => [data.data, ...prev]);
      router.push(`/chat/${data.data._id}`);
    } catch {
      // Keep UI stable if chat creation fails.
    } finally {
      setCreatingChat(false);
    }
  };

  const deleteChat = async (event, chatId) => {
    event.preventDefault();
    event.stopPropagation();
    if (deletingChatId) return;

    setDeletingChatId(chatId);
    setChats((prev) => prev.filter((chat) => chat._id !== chatId));

    if (currentChatId === chatId) {
      router.push("/dashboard");
    }

    try {
      await api.delete(`/api/chats/${chatId}`);
    } catch {
      fetchChats();
    } finally {
      setDeletingChatId("");
    }
  };

  const getChatTitle = (chat) => {
    const apiTitle = chat?.title?.trim();
    if (apiTitle && apiTitle.toLowerCase() !== "new chat") {
      return apiTitle;
    }

    const normalizeContent = (value) => {
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      if (value && typeof value === "object") {
        if (typeof value.content === "string") return value.content;
        if (typeof value.text === "string") return value.text;
      }
      return "";
    };

    const firstMessage = chat?.messages?.find(
      (message) =>
        message?.role === "user" &&
        normalizeContent(message?.content).trim()
    );
    const preview = normalizeContent(firstMessage?.content);
    if (preview) {
      return preview.trim().slice(0, 20);
    }

    return "New Chat";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`relative flex h-screen flex-col overflow-hidden border-r bg-white/70 p-3 backdrop-blur-sm dark:bg-slate-950/70 ${
          isResizing ? "" : "transition-[width] duration-300 ease-out"
        }`}
        style={{ width: sidebarCollapsed ? 64 : sidebarWidth }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          {!sidebarCollapsed && <h1 className="text-lg font-bold tracking-tight">DevFlow AI</h1>}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="rounded-md border px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? ">" : "<"}
          </button>
        </div>

        <button
          type="button"
          onClick={createChat}
          disabled={creatingChat}
          className="mb-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {sidebarCollapsed ? "+" : creatingChat ? "Creating..." : "New Chat"}
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth pr-1">
          <div className="space-y-1">
            {chats.map((chat) => {
              const isActive = currentChatId === chat._id;
              const title = getChatTitle(chat);
              return (
                <div
                  key={chat._id}
                  className={`group flex items-center gap-1 rounded-md border text-sm transition-colors ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  }`}
                >
                  <Link
                    href={`/chat/${chat._id}`}
                    className="min-w-0 flex-1 px-3 py-2"
                    title={title}
                  >
                    <p className="truncate">{sidebarCollapsed ? "..." : title}</p>
                  </Link>
                  {!sidebarCollapsed && (
                    <button
                      type="button"
                      onClick={(event) => deleteChat(event, chat._id)}
                      disabled={deletingChatId === chat._id}
                      className="mr-1 rounded px-2 py-1 text-xs opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-500 group-hover:opacity-100 disabled:opacity-100"
                      aria-label={`Delete ${title}`}
                    >
                      {deletingChatId === chat._id ? "..." : "✕"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 border-t pt-3">
          <div className="mb-2 flex items-center justify-between">
            {!sidebarCollapsed && <span className="text-xs text-slate-500">Preferences</span>}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-md border px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {sidebarCollapsed ? "⚙" : "Settings"}
            </button>
          </div>
          {menuOpen && !sidebarCollapsed && (
            <div className="mb-2 space-y-1 rounded-md border border-slate-700 bg-slate-900/40 p-2 text-sm">
              <Link
                href="/account"
                className="block w-full rounded px-2 py-1 text-left text-slate-200 transition-colors hover:bg-slate-800"
              >
                Account
              </Link>
              <Link
                href="/settings"
                className="block w-full rounded px-2 py-1 text-left text-slate-200 transition-colors hover:bg-slate-800"
              >
                Settings
              </Link>
              <Link
                href="/settings/billing"
                className="block w-full rounded px-2 py-1 text-left text-slate-200 transition-colors hover:bg-slate-800"
              >
                Billing
              </Link>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div
            role="separator"
            aria-label="Resize sidebar"
            onMouseDown={() => setIsResizing(true)}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-slate-300 dark:hover:bg-slate-700"
          />
        )}
      </aside>

      <main className="hide-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}