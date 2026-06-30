import { RequireAuth } from "@/components/auth/require-auth";
import { AuthSessionSync } from "@/components/auth/auth-session-sync";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AuthSessionSync />
      <ErrorBoundary>
        <DashboardShell>{children}</DashboardShell>
      </ErrorBoundary>
    </RequireAuth>
  );
}
