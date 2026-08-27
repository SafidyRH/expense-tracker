"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { navigationGroups } from "./navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const initials =
    session?.user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <aside className="hidden w-[286px] shrink-0 px-5 py-8 lg:flex lg:min-h-screen lg:flex-col">
      <nav className="flex-1 overflow-y-auto pr-1">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[12px] font-medium text-[#77736d]">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-[42px] items-center gap-3 rounded-[12px] px-3 text-[14px] text-[#242321] transition-colors hover:bg-[#ddd9d2]",
                      active && "bg-[#d4d1cc] font-medium text-neutral-950",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">
            {session?.user.name ?? "Profil"}
          </p>

          <p className="truncate text-[11px] text-[#706c66]">
            {session?.user.email ?? "principal"}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)] hover:bg-white"
        >
          <Settings className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
