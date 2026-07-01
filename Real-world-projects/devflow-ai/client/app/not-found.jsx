import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-50">404</h1>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">Page not found</p>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
