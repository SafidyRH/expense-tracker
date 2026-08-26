"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
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
