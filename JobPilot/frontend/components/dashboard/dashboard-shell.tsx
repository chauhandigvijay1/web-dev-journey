"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  ListTodo,
  Settings,
  Search,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReminderBell } from "@/components/dashboard/ReminderBell";
import { logout } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/reminders", label: "Reminders", icon: ListTodo },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/dashboard/jobs") {
    return pathname.startsWith("/dashboard/jobs") || pathname.startsWith("/dashboard/add-job");
  }
  if (href === "/dashboard") return false;
  return pathname.startsWith(href);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  function handleLogout() {
    dispatch(logout());
    router.replace("/login");
  }

  return (
    <div className="flex min-h-dvh bg-transparent">
      <aside className="hidden w-56 shrink-0 border-r border-border/70 bg-card/90 backdrop-blur md:flex md:flex-col">
        <div className="border-b border-border/70 px-4 py-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            JobPilot
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search jobs..." className="h-9 pl-9" disabled />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
            <Button size="sm" className="gap-1 px-2 sm:px-3" asChild>
              <Link href="/dashboard/add-job">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Job</span>
              </Link>
            </Button>
            <ReminderBell />
            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  {user?.profilePic ? (
                    <Image
                      src={user.profilePic}
                      alt={user.name ?? "Profile"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border border-border/70 object-cover shadow-sm"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                  )}
                  <span className="hidden max-w-[120px] truncate text-left text-sm font-medium lg:inline">
                    {user?.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border/70 bg-background/75 px-2 py-2 backdrop-blur md:hidden">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                  active ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
