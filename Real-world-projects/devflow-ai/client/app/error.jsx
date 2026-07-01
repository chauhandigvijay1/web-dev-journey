"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">Something went wrong</h1>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
