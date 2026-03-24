import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">JobPilot AI</h1>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/signup">Create account</Link>
        </Button>
      </div>
    </main>
  );
}
