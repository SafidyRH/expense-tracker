"use client";

import { Wallet } from "lucide-react";

import { AddAccountDialog } from "@/features/accounts/components/add-account-dialog";

import { AccountCard } from "@/features/accounts/components/account-card";

import { useAccounts } from "@/features/accounts/account.queries";

export default function AccountsPage() {
  const accounts = useAccounts();

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes comptes</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Gérez vos espèces, comptes bancaires et comptes Mobile Money.
          </p>
        </div>

        <AddAccountDialog />
      </header>

      {accounts.isPending && (
        <p className="text-sm text-muted-foreground">
          Chargement des comptes...
        </p>
      )}

      {accounts.isError && (
        <p className="text-sm text-destructive">
          Impossible de charger les comptes.
        </p>
      )}

      {!accounts.isPending && accounts.data?.data.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Wallet className="size-6" />
          </div>

          <h2 className="font-semibold">Aucun compte</h2>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Commencez par ajouter votre portefeuille, votre banque ou votre
            compte Mobile Money.
          </p>

          <div className="mt-6">
            <AddAccountDialog />
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.data?.data.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </section>
    </main>
  );
}
