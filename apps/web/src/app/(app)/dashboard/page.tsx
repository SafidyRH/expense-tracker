"use client";

import {
  ArrowUpRight,
  Landmark,
  List,
  ReceiptText,
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

  return (
    <main className="space-y-4">
      {/* KPI GRID */}
      <section className="grid grid-cols-2 gap-3">
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
            <ArrowUpRight className="size-[15px]" />
          }
          label="Dépenses"
          value={formatMoney(
            monthlySpent
          )}
          subtitle="Ce mois"
        >
          <div className="space-y-2">
            <div className="h-[7px] overflow-hidden rounded-full bg-[#eeece8]">
              <div className="h-full w-[58%] rounded-full bg-[#2fcb71]" />
            </div>

            <p className="text-[10px] leading-4 text-[#8a867f]">
              Suivi des dépenses
              mensuelles
            </p>
          </div>
        </DashboardCard>

        <DashboardCard
          icon={
            <Landmark className="size-[15px]" />
          }
          label="Comptes"
          value={`${accountCount}`}
          subtitle={`${accountCount} compte${
            accountCount > 1
              ? "s"
              : ""
          } actif${
            accountCount > 1
              ? "s"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-[5px] flex-1 rounded-full bg-[#dcd8d1]" />

            <div className="h-[5px] w-8 rounded-full bg-[#99948b]" />
          </div>
        </DashboardCard>

        <DashboardCard
          icon={
            <ReceiptText className="size-[15px]" />
          }
          label="Activité"
          value={`${monthlyExpenseCount}`}
          subtitle="dépenses ce mois"
        >
          <ActivityBars />
        </DashboardCard>
      </section>

      {/* WEEK REVIEW */}
      <section className="rounded-[28px] bg-white p-5">
        <div className="flex items-center gap-2 text-[#706c66]">
          <List className="size-[15px]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
            7 derniers jours
          </span>
        </div>

        <h2 className="mt-3 text-[19px] font-semibold tracking-[-0.025em]">
          Votre semaine en revue
        </h2>

        <p className="mt-2 text-[12px] leading-5 text-[#77736d]">
          {weeklyTransactionCount}{" "}
          transaction
          {weeklyTransactionCount !==
          1
            ? "s"
            : ""}{" "}
          enregistrée
          {weeklyTransactionCount !==
          1
            ? "s"
            : ""}{" "}
          cette semaine.
        </p>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] text-[#817d77]">
              Dépensé
            </p>

            <p className="mt-1 text-[18px] font-semibold tracking-tight">
              {formatMoney(
                weeklySpent
              )}
            </p>
          </div>

          <WeekBars />
        </div>
      </section>

      {/* RECENT TRANSACTIONS */}
      <section className="rounded-[28px] bg-white p-5">
        <div className="mb-5 flex items-center gap-2 text-[#706c66]">
          <List className="size-[15px]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
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
                Aucune transaction
                pour le moment.
              </p>
            </div>
          )}

        <div className="divide-y divide-[#efede9]">
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
                  className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f1efeb]">
                      <ReceiptText className="size-[16px]" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">
                        {transaction.description ??
                          category?.name ??
                          "Transaction"}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-[#817d77]">
                        {category?.name ??
                          entry
                            ?.account
                            .name ??
                          transaction.type}
                      </p>
                    </div>
                  </div>

                  {entry && (
                    <div className="shrink-0 text-right">
                      <p className="text-[12px] font-semibold">
                        {formatMoney(
                          entry.amountMinor,
                          entry.currencyCode
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-[#aaa69f]">
                        {new Intl.DateTimeFormat(
                          "fr-FR",
                          {
                            day: "numeric",
                            month:
                              "short",
                          }
                        ).format(
                          new Date(
                            transaction.occurredAt
                          )
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

      {/* FLOATING ACTION BUTTON */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[94px] z-40">
        <div className="mx-auto flex w-full max-w-[460px] justify-end px-5">
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
    <div className="flex min-h-[168px] flex-col rounded-[28px] bg-white p-[17px]">
      <div className="flex items-center gap-2 text-[#67635e]">
        {icon}

        <span className="text-[9px] font-medium uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>

      <p className="mt-3 break-words text-[21px] font-medium leading-none tracking-[-0.035em]">
        {value}
      </p>

      {subtitle && (
        <p className="mt-2 text-[11px] leading-4 text-[#77736d]">
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
    <div className="flex h-9 items-end gap-[3px]">
      <span className="h-[13px] flex-1 rounded-sm bg-[#d9ecf5]" />

      <span className="h-[16px] flex-1 rounded-sm bg-[#cae5f1]" />

      <span className="h-[19px] flex-1 rounded-sm bg-[#a9d9eb]" />

      <span className="h-[28px] flex-1 rounded-sm bg-[#4db7db]" />

      <span className="h-[24px] flex-1 rounded-sm bg-[#79c8e3]" />

      <span className="h-[20px] flex-1 rounded-sm bg-[#a8d9e8]" />

      <span className="h-[18px] flex-1 rounded-sm bg-[#c8e6ef]" />
    </div>
  );
}

function ActivityBars() {
  return (
    <div className="flex h-8 items-end gap-1">
      <span className="h-3 flex-1 rounded-full bg-[#dedbd5]" />
      <span className="h-5 flex-1 rounded-full bg-[#d4d0ca]" />
      <span className="h-4 flex-1 rounded-full bg-[#dedbd5]" />
      <span className="h-7 flex-1 rounded-full bg-neutral-900" />
      <span className="h-5 flex-1 rounded-full bg-[#cbc7c0]" />
      <span className="h-6 flex-1 rounded-full bg-[#aaa69e]" />
    </div>
  );
}

function WeekBars() {
  const bars = [
    17,
    25,
    14,
    32,
    27,
    38,
    23,
  ];

  return (
    <div className="flex h-10 items-end gap-1">
      {bars.map(
        (
          height,
          index
        ) => (
          <span
            key={index}
            style={{
              height,
            }}
            className={`w-[7px] rounded-full ${
              index === 5
                ? "bg-neutral-900"
                : "bg-[#d7d4ce]"
            }`}
          />
        )
      )}
    </div>
  );
}