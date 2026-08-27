"use client";

import Link from "next/link";

import {
  CalendarDays,
  Clock3,
  List,
  ReceiptText,
  Utensils,
  WalletCards,
} from "lucide-react";

import {
  useAccounts,
} from "@/features/accounts/account.queries";

import {
  useTransactions,
} from "@/features/transactions/transaction.queries";

import {
  getExpenseAmount,
} from "@/features/transactions/transaction.utils";

import {
  AddExpenseDialog,
} from "@/features/transactions/components/add-expense-dialog";

import {
  formatMoney,
} from "@/lib/money";

import {
  getCurrentMonthRange,
  getLastSevenDaysRange,
} from "@/lib/date";

export default function DashboardPage() {
  const monthRange =
    getCurrentMonthRange();

  const weekRange =
    getLastSevenDaysRange();

  const accounts =
    useAccounts();

  const recentTransactions =
    useTransactions({
      limit: 5,
    });

  const monthlyExpenses =
    useTransactions({
      type: "EXPENSE",

      dateFrom:
        monthRange.from,

      dateTo:
        monthRange.to,

      limit: 100,
    });

  const weeklyTransactions =
    useTransactions({
      dateFrom:
        weekRange.from,

      dateTo:
        weekRange.to,

      limit: 100,
    });

  const totalBalance =
    accounts.data?.data.reduce(
      (
        total,
        account
      ) =>
        total +
        BigInt(
          account.balanceMinor
        ),
      0n
    ) ?? 0n;

  const monthlySpent =
    monthlyExpenses.data?.data.reduce(
      (
        total,
        transaction
      ) =>
        total +
        getExpenseAmount(
          transaction
        ),
      0n
    ) ?? 0n;

  const weeklyExpenses =
    weeklyTransactions.data?.data.filter(
      (transaction) =>
        transaction.type ===
        "EXPENSE"
    ) ?? [];

  const weeklySpent =
    weeklyExpenses.reduce(
      (
        total,
        transaction
      ) =>
        total +
        getExpenseAmount(
          transaction
        ),
      0n
    );

  const accountCount =
    accounts.data?.data
      .length ?? 0;

  const monthlyExpenseCount =
    monthlyExpenses.data?.data
      .length ?? 0;

  const weeklyTransactionCount =
    weeklyTransactions.data?.data
      .length ?? 0;

  const weekFrom =
    formatShortDate(
      weekRange.from
    );

  const weekTo =
    formatShortDate(
      weekRange.to
    );

  return (
    <main className="mx-auto max-w-[425px] space-y-[14px] lg:max-w-none lg:space-y-5">
      <section className="grid grid-cols-2 gap-[14px] lg:grid-cols-4 lg:gap-5">
        <DashboardCard
          icon={
            <WalletCards className="size-[15px]" />
          }
          label="Solde total"
          value={formatMoney(
            totalBalance
          )}
        >
          <BalanceMiniChart />
        </DashboardCard>

        <DashboardCard
          icon={
            <Clock3 className="size-[15px]" />
          }
          label="Budget"
          value={formatMoney(
            totalBalance
          )}
          subtitle="Restant"
        >
          <div className="space-y-[12px]">
            <div className="h-[13px] overflow-hidden rounded-full bg-[#eeece8]">
              <div className="h-full w-[48%] rounded-full bg-[#32c96a]" />
            </div>

            <p className="text-[12px] leading-[18px] text-[#6f6b66]">
              {formatMoney(
                monthlySpent
              )}{" "}
              dépensé ce mois
            </p>
          </div>
        </DashboardCard>

        <DashboardCard
          icon={
            <CalendarDays className="size-[15px]" />
          }
          label="Obligations"
          value={formatMoney(
            monthlySpent
          )}
        >
          <div className="space-y-[5px] text-[12px] leading-[17px] text-[#6f6b66]">
            <p>
              Dépenses restant ce mois-ci
            </p>

            <div className="grid grid-cols-[1fr_auto] gap-x-3">
              <span>Programmé :</span>
              <strong className="font-semibold text-neutral-950">
                {monthlyExpenseCount}
              </strong>

              <span>Réappro. :</span>
              <strong className="font-semibold text-neutral-950">
                {formatMoney(
                  weeklySpent
                )}
              </strong>

              <span>Comptes :</span>
              <strong className="font-semibold text-neutral-950">
                {accountCount}
              </strong>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          icon={
            <Clock3 className="size-[15px]" />
          }
          label="Couverture"
          value={`${weeklyTransactionCount} jours`}
        >
          <div className="space-y-[13px]">
            <CoverageBar />

            <p className="text-[12px] leading-[17px] text-[#6f6b66]">
              Obligations couvertes cette semaine
            </p>
          </div>
        </DashboardCard>
      </section>

      <section className="rounded-[24px] bg-white px-[17px] pb-[25px] pt-[18px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:px-6 lg:py-6">
        <div className="flex items-center gap-2 text-[#64605b]">
          <CalendarDays className="size-[15px]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
            {weekFrom} - {weekTo}
          </span>
        </div>

        <h2 className="mt-[12px] text-[20px] font-semibold leading-[24px] tracking-[-0.01em]">
          Votre semaine en revue
        </h2>

        <p className="mt-[6px] max-w-[360px] text-[12px] leading-[18px] text-[#6f6b66]">
          {weeklyTransactionCount}{" "}
          transaction
          {weeklyTransactionCount !==
          1
            ? "s"
            : ""}{" "}
          du {weekFrom.toLowerCase()} au {weekTo.toLowerCase()}.
          Un passage rapide sur les dépenses, les catégories et les soldes.
        </p>

        <Link
          href="/transactions"
          className="mt-[14px] inline-flex text-[14px] font-medium text-[#3d7f9b]"
        >
          Voir plus
        </Link>
      </section>

      <section className="rounded-[24px] bg-white px-[17px] pb-[24px] pt-[18px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:px-6 lg:py-6">
        <div className="mb-[20px] flex items-center gap-2 text-[#64605b]">
          <List className="size-[15px]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
            Transactions récentes
          </span>
        </div>

        {recentTransactions.isPending && (
          <div className="flex min-h-[120px] items-center justify-center">
            <p className="text-[12px] text-[#817d77]">
              Chargement...
            </p>
          </div>
        )}

        {!recentTransactions.isPending &&
          recentTransactions.data
            ?.data.length === 0 && (
            <div className="flex min-h-[120px] flex-col items-center justify-center text-center">
              <ReceiptText className="size-5 text-neutral-300" />

              <p className="mt-3 text-[12px] text-[#817d77]">
                Aucune transaction pour le moment.
              </p>
            </div>
          )}

        <div className="space-y-[17px]">
          {recentTransactions.data?.data.map(
            (
              transaction
            ) => {
              const entry =
                transaction
                  .entries[0];

              const category =
                transaction
                  .allocations[0]
                  ?.category;

              return (
                <div
                  key={
                    transaction.id
                  }
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center text-neutral-950">
                      <Utensils className="size-[22px]" strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold leading-[16px]">
                        {transaction.description ??
                          category?.name ??
                          "Transaction"}
                      </p>

                      <p className="mt-[2px] truncate text-[11px] leading-[15px] text-[#77736d]">
                        {category?.name ??
                          entry
                            ?.account
                            .name ??
                          transaction.type}
                      </p>
                    </div>
                  </div>

                  {entry && (
                    <div className="shrink-0 pt-[1px] text-right">
                      <p className="text-[12px] font-semibold leading-[16px]">
                        {formatMoney(
                          entry.amountMinor,
                          entry.currencyCode
                        )}
                      </p>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-[95px] z-40 lg:bottom-8">
        <div className="mx-auto flex w-full max-w-[469px] justify-end px-[18px] lg:max-w-[1180px] lg:pl-[318px] lg:pr-[52px]">
          <div className="pointer-events-auto">
            <AddExpenseDialog />
          </div>
        </div>
      </div>
    </main>
  );
}

interface DashboardCardProps {
  icon: React.ReactNode;

  label: string;

  value: string;

  subtitle?: string;

  children?: React.ReactNode;
}

function DashboardCard({
  icon,
  label,
  value,
  subtitle,
  children,
}: DashboardCardProps) {
  return (
    <div className="flex min-h-[202px] flex-col rounded-[24px] bg-white px-[17px] pb-[17px] pt-[16px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:min-h-[214px]">
      <div className="flex items-center gap-[8px] text-[#64605b]">
        {icon}

        <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>

      <p className="mt-[12px] break-words text-[22px] font-medium leading-[26px] tracking-[-0.01em]">
        {value}
      </p>

      {subtitle && (
        <p className="mt-[2px] text-[12px] leading-[18px] text-[#6f6b66]">
          {subtitle}
        </p>
      )}

      {children && (
        <div className="mt-auto pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

function BalanceMiniChart() {
  return (
    <div className="-mx-[17px] -mb-[17px] mt-auto h-[88px] overflow-hidden rounded-b-[24px]">
      <svg
        viewBox="0 0 210 88"
        className="h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 35 C18 46 37 43 55 48 C72 53 79 50 88 66 C96 82 110 78 123 82 C138 86 129 42 148 49 C163 54 172 63 188 58 C202 53 193 11 210 20 L210 88 L0 88 Z"
          fill="#e0f0fb"
        />
        <path
          d="M0 35 C18 46 37 43 55 48 C72 53 79 50 88 66 C96 82 110 78 123 82 C138 86 129 42 148 49 C163 54 172 63 188 58 C202 53 193 11 210 20"
          fill="none"
          stroke="#1681b5"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
      </svg>
    </div>
  );
}

function CoverageBar() {
  return (
    <div className="relative h-[13px]">
      <div className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-[#efede9]">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f14a38_0%,#ffc916_48%,#89d548_72%,#2dc46b_100%)]" />
      </div>

      <span className="absolute left-[54%] top-1/2 size-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e6ea50] shadow-[0_0_0_2px_rgba(255,255,255,0.55)]" />
    </div>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
    }
  )
    .format(
      new Date(value)
    )
    .replace(".", "")
    .toUpperCase();
}
