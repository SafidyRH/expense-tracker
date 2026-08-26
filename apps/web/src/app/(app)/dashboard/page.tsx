"use client";

import { authClient } from "@/lib/auth-client";

import { useAccounts } from "@/features/accounts/account.queries";

import { useTransactions } from "@/features/transactions/transaction.queries";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/dist/client/components/navigation";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();

  const accounts = useAccounts();

  const transactions = useTransactions();

  async function logout() {
    await authClient.signOut();

    redirect("/login");
  }

  const totalBalance =
    accounts.data?.data.reduce(
      (total, account) => total + BigInt(account.balanceMinor),
      0n,
    ) ?? 0n;

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bonjour</p>

          <h1 className="text-2xl font-semibold">{session?.user.name}</h1>
        </div>

        <Button variant="outline" onClick={logout}>
          Déconnexion
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Solde total</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold">
              {totalBalance.toLocaleString("fr-FR")} Ar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Comptes</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold">
              {accounts.data?.data.length ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Transactions récentes</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold">
              {transactions.data?.data.length ?? 0}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Mes comptes</h2>

        {accounts.isPending && <p>Chargement des comptes...</p>}

        <div className="grid gap-4 md:grid-cols-3">
          {accounts.data?.data.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle>{account.name}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-semibold">
                  {BigInt(account.balanceMinor).toLocaleString("fr-FR")} Ar
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {account.type}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Dernières transactions</h2>

        <Card>
          <CardContent className="divide-y">
            {transactions.data?.data.map((transaction) => {
              const entry = transaction.entries[0];

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.description ?? "Transaction"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {transaction.allocations[0]?.category.name ??
                        transaction.type}
                    </p>
                  </div>

                  {entry && (
                    <p className="font-medium">
                      {BigInt(entry.amountMinor).toLocaleString("fr-FR")} Ar
                    </p>
                  )}
                </div>
              );
            })}

            {transactions.data?.data.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune transaction.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
