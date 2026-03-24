import { RequireAuth } from "@/components/auth/require-auth";
import { AuthSessionSync } from "@/components/auth/auth-session-sync";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AuthSessionSync />
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
