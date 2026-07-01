export default function ChatLoading() {
  return (
    <div className="flex h-full flex-col space-y-4 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex-1 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className={`max-w-[75%] ${i === 1 ? "ml-auto" : ""}`}>
            <div className={`h-24 animate-pulse rounded-2xl ${i === 1 ? "bg-zinc-300 dark:bg-zinc-700" : "bg-zinc-200 dark:bg-zinc-800"}`} />
          </div>
        ))}
      </div>
      <div className="h-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
