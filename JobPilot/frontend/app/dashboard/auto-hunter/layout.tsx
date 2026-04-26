import { AutoHunterShell } from "@/components/auto-hunter/auto-hunter-shell";

export default function AutoHunterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AutoHunterShell>{children}</AutoHunterShell>;
}
