"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowUp, Square } from "lucide-react";
import { api } from "@/lib/api";

// Markdown renderer configured for stable hydration and code blocks.
const MarkdownMessage = memo(function MarkdownMessage({ content }) {
  const normalizedContent = (() => {
    if (typeof content === "string") return content;
    if (typeof content === "number" || typeof content === "boolean") return String(content);
    if (content && typeof content === "object") {
      if (typeof content.content === "string") return content.content;
      if (typeof content.text === "string") return content.text;
      try {
        return JSON.stringify(content);
      } catch {
        return "";
      }
    }
    return "";
  })();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children }) {
          const match = /language-(\w+)/.exec(className || "");

          if (!inline) {
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match?.[1] || "js"}
                PreTag="pre"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          }

          return (
            <code className="bg-gray-300 px-1 rounded">
              {children}
            </code>
          );
        },
      }}
    >
      {normalizedContent}
    </ReactMarkdown>
  );
});

export default function ChatWindow({ chatId, initialPrompt = "" }) {
  const FREE_LIMIT = 20;

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState({
    plan: "free",
    dailyCount: 0,
    limit: FREE_LIMIT,
  });
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("");

  const bottomRef = useRef(null);
  const initialPromptSentRef = useRef(false);
  const pendingGreetingRef = useRef("");

  const normalizeMessageContent = (value) => {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value && typeof value === "object") {
      if (typeof value.content === "string") return value.content;
      if (typeof value.text === "string") return value.text;
      try {
        return JSON.stringify(value);
      } catch {
        return "";
      }
    }
    return "";
  };

  useEffect(() => {
    const resolveDisplayName = async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        const user = data?.data || {};
        const fullName = String(user.name || "").trim();
        const firstName = fullName ? fullName.split(" ")[0] : "";
        const userId = user?._id || user?.id;
        const settingsKey = userId ? `devflow_settings_${userId}` : "";
        const raw = settingsKey ? localStorage.getItem(settingsKey) : "";
        let nickname = "";
        if (raw) {
          try {
            nickname = JSON.parse(raw)?.nickname?.trim() || "";
          } catch {
            nickname = "";
          }
        }
        setDisplayName(nickname || firstName || "");
      } catch {
        setDisplayName("");
      }
    };
    resolveDisplayName();
  }, []);

  // Load current chat messages.
  const loadChat = async () => {
    if (!chatId) return;
    try {
      const { data } = await api.get(`/api/chats/${chatId}`);
      const nextMessages = (data.data?.messages || []).map((message) => ({
        ...message,
        content: normalizeMessageContent(message?.content),
      }));
      const greeting = displayName
        ? `Hello, ${displayName}! Ask me anything to get started.`
        : "Hello! Ask me anything to get started.";
      pendingGreetingRef.current = greeting;
      setMessages(
        nextMessages.length
          ? nextMessages
          : [{ role: "assistant", content: greeting }]
      );
    } catch {
      setError("Unable to load this chat.");
    }
  };

  useEffect(() => {
    if (!chatId) return;
    loadChat();
  }, [chatId, displayName]);

  useEffect(() => {
    if (!initialPrompt?.trim()) return;
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  // Keep the latest message visible.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch usage information for plan limits.
  const fetchUsage = async () => {
    try {
      const { data } = await api.get("/api/payment/status");
      const usage = data.data?.usage || {};

      setUsageInfo({
        plan: data.data?.plan || "free",
        dailyCount: usage.dailyCount || 0,
        limit: usage.limit || FREE_LIMIT,
      });
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  // Send a prompt and stream the assistant response.
  const sendPrompt = async (forcedPrompt = "") => {
    const promptText = String(forcedPrompt || prompt).trim();
    if (!promptText || loading) return;
    setError("");

    // 🚫 limit check
    if (
      usageInfo.plan === "free" &&
      usageInfo.dailyCount >= usageInfo.limit
    ) {
      setError("Limit reached. Upgrade to continue.");
      return;
    }

    setLoading(true);

    const userMsg = { role: "user", content: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");

    try {
      const token =
        localStorage.getItem("devflow_token") || localStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");

      const baseUrl =
        api.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/ai/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          prompt: promptText,
        }),
      });
      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Unable to send prompt.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let assistantStarted = false;

      // Placeholder assistant bubble while stream is active.
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      assistantStarted = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;
          if (payload === "[DONE]") {
            break;
          }
          let parsed;
          try {
            parsed = JSON.parse(payload);
          } catch {
            continue;
          }
          const tokenChunk = parsed?.token || "";
          assistantText += tokenChunk;
          setMessages((prev) => {
            const next = [...prev];
            const lastIndex = next.length - 1;
            if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
              next[lastIndex] = {
                ...next[lastIndex],
                content: assistantText,
              };
            }
            return next;
          });
        }
      }

      if (!assistantText.trim() && assistantStarted) {
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
            next[lastIndex] = {
              ...next[lastIndex],
              content: "No response received. Please try again.",
            };
          }
          return next;
        });
      }

      await fetchUsage();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("devflow:chat-updated"));
      }

    } catch (err) {
      setError(err?.message || "Error occurred while sending prompt.");
      setMessages((prev) => {
        const next = [...prev];
        const lastIndex = next.length - 1;
        if (lastIndex >= 0 && next[lastIndex].role === "assistant" && !next[lastIndex].content) {
          next[lastIndex] = { ...next[lastIndex], content: "⚠️ Error occurred" };
          return next;
        }
        next.push({ role: "assistant", content: "⚠️ Error occurred" });
        return next;
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!initialPrompt?.trim()) return;
    if (initialPromptSentRef.current) return;
    initialPromptSentRef.current = true;
    const timer = setTimeout(() => sendPrompt(initialPrompt), 150);
    return () => clearTimeout(timer);
  }, [initialPrompt]);

  return (
    <div className="flex h-full flex-col space-y-4">
      
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className="relative">
            <div
              className={`px-4 py-2 rounded-lg text-sm max-w-[70%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200 text-black"
              }`}
            >
              <MarkdownMessage content={msg.content} />
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(normalizeMessageContent(msg.content))}
              className="absolute top-1 right-1 text-xs opacity-60 hover:opacity-100"
            >
              📋
            </button>
          </div>
        ))}

        {loading && <p className="text-sm text-gray-400">Thinking...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Usage display */}
        <p className="text-xs text-gray-400">
          {usageInfo.dailyCount} / {usageInfo.limit} prompts used today
        </p>

        <div ref={bottomRef} />
      </div>

      {/* Input box */}
      <div className="relative border-t pt-3">
        <Textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something..."
          disabled={
            loading ||
            (usageInfo.plan === "free" &&
              usageInfo.dailyCount >= usageInfo.limit)
          }
          className="pr-14"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendPrompt();
            }
          }}
        />

        {loading ? (
          <Button className="absolute bottom-2 right-2 h-9 w-9 p-0">
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button
            onClick={sendPrompt}
            disabled={!prompt.trim()}
            className="absolute bottom-2 right-2 h-9 w-9 p-0"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}