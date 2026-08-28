"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthProvider } from "@/components/auth/auth-provider";
import { PwaRegistrar } from "@/components/pwa/pwa-registrar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        queryClient={queryClient}
        Link={Link}
        basePaths={{
          auth: "",
        }}
        viewPaths={{
          auth: {
            signIn: "login",
            signUp: "register",
          },
        }}
        emailAndPassword={{
          enabled: true,
          confirmPassword: true,
          forgotPassword: false,
          minPasswordLength: 8,
        }}
        redirectTo="/dashboard"
        socialProviders={[]}
        navigate={({ to, replace }) => {
          if (replace) {
            router.replace(to);
          } else {
            router.push(to);
          }
        }}
        localization={{
          auth: {
            alreadyHaveAnAccount: "Deja inscrit ?",
            confirmPassword: "Confirmer le mot de passe",
            confirmPasswordPlaceholder: "Confirmez votre mot de passe",
            email: "Email",
            emailPlaceholder: "vous@example.com",
            fieldRequired: "Ce champ est requis",
            hidePassword: "Masquer le mot de passe",
            invalidEmail: "Email invalide",
            name: "Nom",
            namePlaceholder: "Votre nom",
            needToCreateAnAccount: "Pas encore de compte ?",
            or: "ou",
            password: "Mot de passe",
            passwordPlaceholder: "Votre mot de passe",
            passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
            passwordStrength: "Securite du mot de passe",
            showPassword: "Afficher le mot de passe",
            signIn: "Se connecter",
            signUp: "Creer un compte",
            tooLong: "Trop long",
            tooShort: "Trop court",
          },
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider>
            <PwaRegistrar />
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
