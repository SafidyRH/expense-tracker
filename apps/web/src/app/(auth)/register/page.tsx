"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignUp } from "@/components/auth/sign-up";

export default function RegisterPage() {
  return (
    <AuthPageShell subtitle="Creez votre espace pour suivre vos finances.">
      <SignUp className="max-w-none rounded-[28px] border-0 bg-white shadow-sm" />
    </AuthPageShell>
  );
}
