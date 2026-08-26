"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    const result = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Email ou mot de passe incorrect.");

      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>

          <CardDescription>
            Connectez-vous pour accéder à vos finances.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-medium underline">
                Créer un compte
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
