"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import {
  ArrowLeftRight,
  CalendarDays,
  Landmark,
  LayoutDashboard,
  PiggyBank,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Bilan",
    href: "/dashboard",
    icon: (
      <LayoutDashboard className="size-[18px]" />
    ),
  },

  {
    label: "Calendrier",
    href: "/calendar",
    icon: (
      <CalendarDays className="size-[18px]" />
    ),
  },

  {
    label: "Transactions",
    href: "/transactions",
    icon: (
      <ArrowLeftRight className="size-[18px]" />
    ),
  },

  {
    label: "Budget",
    href: "/budgets",
    icon: (
      <PiggyBank className="size-[18px]" />
    ),
  },

  {
    label: "Comptes",
    href: "/accounts",
    icon: (
      <Landmark className="size-[18px]" />
    ),
  },
];

export function MobileNavigation() {
  const pathname =
    usePathname();

  return (
    <div className="fixed inset-x-0 bottom-3 z-50">
      <div className="mx-auto w-full max-w-[460px] px-4">
        <nav className="grid grid-cols-5 rounded-[29px] border border-[#ccc7bf] bg-[#e8e4dd]/95 p-[5px] shadow-[0_6px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          {navigationItems.map(
            (item) => {
              const active =
                pathname ===
                  item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={cn(
                    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-[22px] px-1 py-[9px] text-[9px] text-[#605d58] transition-colors",
                    active &&
                      "bg-[#d0ccc5] text-neutral-950"
                  )}
                >
                  {
                    item.icon
                  }

                  <span className="max-w-full truncate">
                    {
                      item.label
                    }
                  </span>
                </Link>
              );
            }
          )}
        </nav>
      </div>
    </div>
  );
}