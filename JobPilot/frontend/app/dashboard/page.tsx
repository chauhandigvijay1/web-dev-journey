import { Suspense } from "react";
import { DashboardHome } from "./dashboard-home";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-40 rounded-xl border bg-card" />
        </div>
      }
    >
      <DashboardHome />
    </Suspense>
  );
}
