"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";

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

  const settingsMenu = (
    <div
      className={`space-y-1 rounded-md border border-zinc-200 bg-white p-2 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-950 ${
        sidebarCollapsed ? "absolute bottom-0 left-full z-50 ml-2 w-44" : "mb-2"
      }`}
    >
      <Link
        href="/account"
        onClick={() => setMenuOpen(false)}
        className="block w-full rounded-md px-2 py-2 text-left text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        Account
      </Link>
      <Link
        href="/settings"
        onClick={() => setMenuOpen(false)}
        className="block w-full rounded-md px-2 py-2 text-left text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        Settings
      </Link>
      <Link
        href="/settings/billing"
        onClick={() => setMenuOpen(false)}
        className="block w-full rounded-md px-2 py-2 text-left text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        Billing
      </Link>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <aside
        className={`relative z-20 flex h-screen flex-col overflow-visible border-r border-zinc-200 bg-white/90 p-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 ${
          isResizing ? "" : "transition-[width] duration-300 ease-out"
        }`}
        style={{ width: sidebarCollapsed ? 64 : sidebarWidth }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          {!sidebarCollapsed && <h1 className="text-lg font-bold tracking-tight">DevFlow AI</h1>}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <button
          type="button"
          onClick={createChat}
          disabled={creatingChat}
          className="mb-3 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-cyan-400 dark:text-zinc-950 dark:hover:bg-cyan-300"
          aria-label="Create new chat"
        >
          {sidebarCollapsed ? <Plus size={18} /> : creatingChat ? "Creating..." : "New Chat"}
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
                      ? "border-zinc-950 bg-zinc-950 text-white dark:border-cyan-400/60 dark:bg-cyan-400/15 dark:text-cyan-100"
                      : "border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Link
                    href={`/chat/${chat._id}`}
                    className={`min-w-0 flex-1 px-3 py-2 ${sidebarCollapsed ? "text-center" : ""}`}
                    title={title}
                    aria-label={title}
                  >
                    <p className="truncate">{sidebarCollapsed ? "..." : title}</p>
                  </Link>
                  {!sidebarCollapsed && (
                    <button
                      type="button"
                      onClick={(event) => deleteChat(event, chat._id)}
                      disabled={deletingChatId === chat._id}
                      className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-xs opacity-0 transition-opacity hover:bg-red-500/15 hover:text-red-500 group-hover:opacity-100 disabled:opacity-100"
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

        <div className="relative mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div className="mb-2 flex items-center justify-between gap-2">
            {!sidebarCollapsed && <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Preferences</span>}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`relative z-50 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white ${
                sidebarCollapsed ? "w-full" : ""
              }`}
              aria-expanded={menuOpen}
              aria-label="Open settings menu"
            >
              <Settings size={16} />
              <span className={sidebarCollapsed ? "sr-only" : ""}>
              {sidebarCollapsed ? "⚙" : "Settings"}
              </span>
            </button>
          </div>
          {menuOpen && settingsMenu}
        </div>

        {!sidebarCollapsed && (
          <div
            role="separator"
            aria-label="Resize sidebar"
            onMouseDown={() => setIsResizing(true)}
            className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent hover:bg-zinc-300 dark:hover:bg-zinc-700"
          />
        )}
      </aside>

      <main className="hide-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
