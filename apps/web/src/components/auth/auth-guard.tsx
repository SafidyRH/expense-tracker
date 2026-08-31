"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const retriedSessionRef = useRef(false);

  const {
    data: session,
    isPending,
    isRefetching,
    refetch,
  } = authClient.useSession();

  useEffect(() => {
    if (session) {
      retriedSessionRef.current = false;
      return;
    }

    if (isPending || isRefetching) {
      return;
    }

    if (!retriedSessionRef.current) {
      retriedSessionRef.current = true;
      void refetch();
      return;
    }

    router.replace("/login");
  }, [session, isPending, isRefetching, refetch, router]);

  if (isPending || isRefetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return children;
}
