"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignIn } from "@/components/auth/sign-in";

export default function LoginPage() {
  return (
    <AuthPageShell subtitle="Connectez-vous pour acceder a vos finances.">
      <SignIn className="max-w-none rounded-[28px] border-0 bg-white shadow-sm" />
    </AuthPageShell>
  );
}
