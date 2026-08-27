"use client";

import { CircleUserRound, Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/date";

import { AppMenu } from "./app-menu";

export function AppHeader() {
  return (
    <header className="flex h-[128px] items-start justify-between px-[18px] pt-[68px] lg:h-[104px] lg:px-8 lg:pt-7">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <AppMenu />
        </div>

        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-[-0.01em]">
            {formatMonthYear()}
          </p>

          <p className="mt-1 text-[11px] text-[#817d77]">Profil principal</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)] hover:bg-white"
        >
          <CircleUserRound className="size-[18px]" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)] hover:bg-white"
        >
          <Layers3 className="size-[18px]" />
        </Button>
      </div>
    </header>
  );
}
