"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bot,
  Box,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Settings,
  WalletCards,
} from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { useLogout } from "@/features/auth/auth.mutations";

const navigationGroups = [
  {
    label: "Tableaux de bord",

    items: [
      {
        label: "Bilan",
        href: "/dashboard",
        icon: <LayoutDashboard className="size-[18px]" />,
      },

      {
        label: "Transactions",
        href: "/transactions",
        icon: <ArrowLeftRight className="size-[18px]" />,
      },

      {
        label: "Calendrier",
        href: "/calendar",
        icon: <CalendarDays className="size-[18px]" />,
      },

      {
        label: "Chronologie",
        href: "/timeline",
        icon: <Clock3 className="size-[18px]" />,
      },
    ],
  },

  {
    label: "Comptes",

    items: [
      {
        label: "Comptes",
        href: "/accounts",
        icon: <Landmark className="size-[18px]" />,
      },

      {
        label: "Budget",
        href: "/budgets",
        icon: <PiggyBank className="size-[18px]" />,
      },

      {
        label: "Revenus",
        href: "/income",
        icon: <ArrowDownLeft className="size-[18px]" />,
      },

      {
        label: "Dépenses",
        href: "/expenses",
        icon: <ArrowUpRight className="size-[18px]" />,
      },

      {
        label: "Inventaire",
        href: "/inventory",
        icon: <Box className="size-[18px]" />,
      },
    ],
  },

  {
    label: "Planification",

    items: [
      {
        label: "Dettes",
        href: "/debts",
        icon: <WalletCards className="size-[18px]" />,
      },

      {
        label: "Fonds",
        href: "/funds",
        icon: <PiggyBank className="size-[18px]" />,
      },

      {
        label: "Rapports",
        href: "/reports",
        icon: <ChartNoAxesColumnIncreasing className="size-[18px]" />,
      },
    ],
  },

  {
    label: "Outils et Paramètres",

    items: [
      {
        label: "Assistant",
        href: "/assistant",
        icon: <Bot className="size-[18px]" />,
      },
    ],
  },
];

export function AppMenu() {
  const pathname = usePathname();

  const router = useRouter();

  const logoutMutation = useLogout();

  const { data: session } = authClient.useSession();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();

      router.replace("/login");

      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  const initials =
    session?.user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <Sheet>
      <SheetTrigger>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 rounded-full bg-white shadow-[0_3px_12px_rgba(0,0,0,0.06)] hover:bg-white"
        >
          <Menu className="size-[18px]" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[82vw] max-w-[330px] border-0 bg-[#f5f3ef] p-0"
      >
        <div className="flex h-full flex-col">
          <div className="px-6 pb-4 pt-8">
            <p className="text-base font-semibold tracking-tight">
              Expense Tracker
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-6">
            {navigationGroups.map((group) => (
              <div key={group.label} className="mb-5">
                <p className="mb-2 px-3 text-[11px] text-[#85817b]">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <SheetClose key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-[12px] px-3 py-[10px] text-[14px] transition-colors",
                            active
                              ? "bg-[#d7d4cf] font-medium text-neutral-950"
                              : "text-[#373532] hover:bg-[#e8e5df]",
                          )}
                        >
                          {item.icon}

                          <span>{item.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#dedbd5] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {session?.user.name}
                </p>

                <p className="truncate text-[11px] text-[#817d77]">
                  {session?.user.email}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-full bg-white"
              >
                <Settings className="size-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full justify-start rounded-xl text-[#625f5a]"
              disabled={logoutMutation.isPending}
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />

              {logoutMutation.isPending ? "Déconnexion..." : "Déconnexion"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
