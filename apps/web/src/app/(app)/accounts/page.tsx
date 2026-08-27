"use client";

import {
  Landmark,
  Wallet,
  WalletCards,
} from "lucide-react";

import { AddAccountDialog } from "@/features/accounts/components/add-account-dialog";

import { AccountCard } from "@/features/accounts/components/account-card";

import { useAccounts } from "@/features/accounts/account.queries";

import { formatMoney } from "@/lib/money";

export default function AccountsPage() {
  const accounts =
    useAccounts();

  const activeAccounts =
    accounts.data?.data.filter(
      (account) =>
        !account.isArchived
    ) ?? [];

  const totalBalance =
    activeAccounts.reduce(
      (
        total,
        account
      ) =>
        total +
        BigInt(
          account.balanceMinor
        ),
      0n
    );

  return (
    <main className="mx-auto max-w-[425px] space-y-[14px] lg:max-w-none lg:space-y-5">
      <section className="grid grid-cols-2 gap-[14px] lg:grid-cols-4 lg:gap-5">
        <div className="flex min-h-[154px] flex-col rounded-[24px] bg-white px-[17px] pb-[17px] pt-[16px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:col-span-2">
          <div className="flex items-center gap-[8px] text-[#64605b]">
            <WalletCards className="size-[15px]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
              Solde comptes
            </span>
          </div>

          <p className="mt-[12px] break-words text-[24px] font-medium leading-[29px] tracking-[-0.01em]">
            {formatMoney(
              totalBalance
            )}
          </p>

          <p className="mt-auto text-[12px] leading-[18px] text-[#6f6b66]">
            Tous les comptes actifs regroupés.
          </p>
        </div>

        <div className="flex min-h-[154px] flex-col rounded-[24px] bg-white px-[17px] pb-[17px] pt-[16px] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-[8px] text-[#64605b]">
            <Landmark className="size-[15px]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
              Comptes
            </span>
          </div>

          <p className="mt-[12px] text-[28px] font-medium leading-[32px] tracking-[-0.01em]">
            {activeAccounts.length}
          </p>

          <p className="mt-auto text-[12px] leading-[18px] text-[#6f6b66]">
            Actifs
          </p>
        </div>

        <div className="flex min-h-[154px] flex-col rounded-[24px] bg-white px-[17px] pb-[17px] pt-[16px] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-[8px] text-[#64605b]">
            <Wallet className="size-[15px]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
              Devise
            </span>
          </div>

          <p className="mt-[12px] text-[28px] font-medium leading-[32px] tracking-[-0.01em]">
            MGA
          </p>

          <p className="mt-auto text-[12px] leading-[18px] text-[#6f6b66]">
            Par défaut
          </p>
        </div>
      </section>

      <section className="rounded-[24px] bg-white px-[17px] pb-[22px] pt-[18px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:px-6 lg:py-6">
        <div className="mb-[20px] flex items-center gap-2 text-[#64605b]">
          <Landmark className="size-[15px]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
            Comptes enregistrés
          </span>
        </div>

        {accounts.isPending && (
          <div className="grid gap-[14px] sm:grid-cols-2">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[178px] animate-pulse rounded-[24px] bg-[#f1efeb]"
              />
            ))}
          </div>
        )}

        {accounts.isError && (
          <div className="flex min-h-[180px] items-center justify-center rounded-[24px] bg-[#f7f5f1] px-6 text-center">
            <p className="text-[13px] leading-[19px] text-destructive">
              Impossible de charger les comptes.
            </p>
          </div>
        )}

        {!accounts.isPending &&
          !accounts.isError &&
          activeAccounts.length ===
            0 && (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[24px] bg-[#f7f5f1] px-7 text-center">
              <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.07)]">
                <Wallet className="size-6" />
              </div>

              <h2 className="text-[19px] font-semibold leading-[24px] tracking-[-0.01em]">
                Aucun compte
              </h2>

              <p className="mt-2 max-w-[280px] text-[12px] leading-[18px] text-[#6f6b66]">
                Ajoutez votre cash, votre banque ou votre Mobile Money pour
                suivre les soldes.
              </p>

              <div className="mt-6">
                <AddAccountDialog />
              </div>
            </div>
          )}

        {!accounts.isPending &&
          !accounts.isError &&
          activeAccounts.length >
            0 && (
            <div className="grid gap-[14px] sm:grid-cols-2 xl:grid-cols-3">
              {activeAccounts.map(
                (account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                  />
                )
              )}
            </div>
          )}
      </section>

      {activeAccounts.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[95px] z-40 lg:bottom-8">
          <div className="mx-auto flex w-full max-w-[469px] justify-end px-[18px] lg:max-w-[1180px] lg:pl-[318px] lg:pr-[52px]">
            <div className="pointer-events-auto">
              <AddAccountDialog />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
