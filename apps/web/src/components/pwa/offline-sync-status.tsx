"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Trash2,
  WifiOff,
} from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

import {
  getOfflineExpenses,
  removeOfflineExpense,
  retryOfflineExpense,
  syncOfflineExpenses,
} from "@/features/offline/offline-expense-sync";

import type { OfflineExpenseMutation } from "@/features/offline/offline-expense-db";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export function OfflineSyncStatus({
  variant = "floating",
}: {
  variant?: "floating" | "inline";
}) {
  const queryClient = useQueryClient();

  const [items, setItems] = useState<OfflineExpenseMutation[]>([]);

  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  const [expanded, setExpanded] = useState(false);

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const refresh = useCallback(async () => {
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    setItems(await getOfflineExpenses());
  }, []);

  const syncNow = useCallback(async () => {
    await syncOfflineExpenses(queryClient);
    await refresh();
  }, [queryClient, refresh]);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => {
      void refresh();
      void syncNow();
    }, 0);

    const handleOnline = () => {
      setOnline(true);
      void syncNow();
    };

    const handleOffline = () => {
      setOnline(false);
      void refresh();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void syncNow();
      }
    };

    const handleQueueChange = () => {
      void refresh();
    };

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline-expense-queue-change", handleQueueChange);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(initialRefresh);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "offline-expense-queue-change",
        handleQueueChange,
      );
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh, syncNow]);

  const pendingCount = items.filter((item) => item.status === "pending").length;

  const syncingCount = items.filter((item) => item.status === "syncing").length;

  const conflicts = items.filter((item) => item.status === "conflict");

  const shouldRender = !online || items.length > 0 || installPrompt;

  if (!shouldRender) {
    return null;
  }

  async function installApp() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <div
      className={
        variant === "floating"
          ? "pointer-events-none fixed inset-x-0 bottom-[154px] z-50 px-[18px] lg:bottom-8 lg:left-auto lg:right-8 lg:w-[360px] lg:px-0"
          : "w-full"
      }
    >
      <div
        className={
          variant === "floating"
            ? "pointer-events-auto mx-auto w-full max-w-[425px] rounded-[22px] bg-white/95 p-3 shadow-[0_14px_44px_rgba(0,0,0,0.16)] backdrop-blur lg:max-w-none"
            : "w-full rounded-[18px] bg-white/85 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.07)]"
        }
      >
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f1efeb]">
              {!online ? (
                <WifiOff className="size-4" />
              ) : conflicts.length > 0 ? (
                <AlertTriangle className="size-4 text-[#9f2419]" />
              ) : syncingCount > 0 ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4 text-[#169253]" />
              )}
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold leading-[17px]">
                {getStatusTitle({
                  online,
                  pendingCount,
                  syncingCount,
                  conflictCount: conflicts.length,
                  installable: Boolean(installPrompt),
                })}
              </span>

              <span className="block truncate text-[11px] leading-[15px] text-[#706c66]">
                {getStatusSubtitle({
                  online,
                  pendingCount,
                  syncingCount,
                  conflictCount: conflicts.length,
                })}
              </span>
            </span>
          </span>

          <span className="shrink-0 rounded-full bg-[#f1efeb] px-3 py-1 text-[11px] font-semibold">
            {items.length}
          </span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-[#efede9] pt-3">
            {installPrompt && (
              <Button
                type="button"
                onClick={installApp}
                className="h-10 w-full rounded-full bg-neutral-950 text-[12px] text-white"
              >
                <Download className="mr-2 size-4" />
                Installer l&apos;application
              </Button>
            )}

            {items.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={syncNow}
                disabled={!online}
                className="h-10 w-full rounded-full text-[12px]"
              >
                <RefreshCw className="mr-2 size-4" />
                Synchroniser maintenant
              </Button>
            )}

            {conflicts.map((item) => (
              <div key={item.id} className="rounded-[16px] bg-[#fff5f3] p-3">
                <p className="text-[12px] font-semibold leading-[16px]">
                  Conflit de synchronisation
                </p>

                <p className="mt-1 text-[11px] leading-[16px] text-[#706c66]">
                  {item.errorMessage ?? "Cette dépense doit être vérifiée."}
                </p>

                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => retryOfflineExpense(item.id, queryClient)}
                    className="h-9 flex-1 rounded-full text-[12px]"
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Réessayer
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      await removeOfflineExpense(item.id);
                      await refresh();
                    }}
                    className="h-9 rounded-full text-[12px] text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusTitle({
  online,
  pendingCount,
  syncingCount,
  conflictCount,
  installable,
}: {
  online: boolean;
  pendingCount: number;
  syncingCount: number;
  conflictCount: number;
  installable: boolean;
}) {
  if (!online) {
    return "Mode hors ligne";
  }

  if (conflictCount > 0) {
    return "Conflit offline";
  }

  if (syncingCount > 0) {
    return "Synchronisation";
  }

  if (pendingCount > 0) {
    return "En attente";
  }

  if (installable) {
    return "Application installable";
  }

  return "Synchronisé";
}

function getStatusSubtitle({
  online,
  pendingCount,
  syncingCount,
  conflictCount,
}: {
  online: boolean;
  pendingCount: number;
  syncingCount: number;
  conflictCount: number;
}) {
  if (!online) {
    return "Les dépenses seront gardées sur cet appareil.";
  }

  if (conflictCount > 0) {
    return `${conflictCount} dépense à vérifier.`;
  }

  if (syncingCount > 0) {
    return `${syncingCount} dépense en cours d'envoi.`;
  }

  if (pendingCount > 0) {
    return `${pendingCount} dépense prête à synchroniser.`;
  }

  return "Disponible hors ligne.";
}
