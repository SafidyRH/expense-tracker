"use client";

import Link from "next/link";

import type {
  LucideIcon,
} from "lucide-react";

import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  Clock3,
  CircleEllipsis,
  Gift,
  Gamepad2,
  HeartPulse,
  House,
  Laptop,
  List,
  ReceiptText,
  Repeat,
  ShoppingBag,
  Smartphone,
  Utensils,
  Users,
  WalletCards,
} from "lucide-react";

import {
  useAccounts,
} from "@/features/accounts/account.queries";

import {
  useBudgetOverview,
} from "@/features/budgets/budget.queries";

import {
  useTransactions,
} from "@/features/transactions/transaction.queries";

import type {
  BudgetAlert,
} from "@/features/budgets/budget.types";

import type {
  Transaction,
} from "@/features/transactions/transaction.types";

import {
  getExpenseAmount,
  getTransactionAmount,
} from "@/features/transactions/transaction.utils";

import {
  AddTransactionDialog,
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

  const budgetOverview =
    useBudgetOverview(
      getCurrentBudgetMonth()
    );

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

  const globalBudget =
    budgetOverview.data?.data.global;

  const budgetAmount =
    globalBudget?.amountMinor ??
    "0";

  const budgetSpent =
    globalBudget?.spentMinor ??
    monthlySpent.toString();

  const budgetRemaining =
    globalBudget?.remainingMinor ??
    totalBalance.toString();

  const budgetPercent =
    globalBudget?.percentConsumed ??
    0;

  const balanceSeries =
    buildBalanceSeries(
      weeklyTransactions.data?.data ??
        [],
      totalBalance
    );

  const coveragePercent =
    weeklyTransactionCount > 0
      ? Math.min(
          (weeklyExpenses.length /
            weeklyTransactionCount) *
            100,
          100
        )
      : 0;

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
          <BalanceMiniChart
            values={balanceSeries}
          />
        </DashboardCard>

        <DashboardCard
          icon={
            <Clock3 className="size-[15px]" />
          }
          label="Budget"
          value={formatMoney(
            budgetRemaining
          )}
          subtitle="Restant"
        >
          <div className="space-y-[12px]">
            <BudgetProgressLine
              percent={budgetPercent}
            />

            {globalBudget?.alert && (
              <BudgetAlertPill
                alert={
                  globalBudget.alert
                }
              />
            )}

            <p className="text-[12px] leading-[18px] text-[#6f6b66]">
              {formatMoney(
                budgetSpent
              )}{" "}
              dépensé sur{" "}
              {formatMoney(
                budgetAmount
              )}
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
            <CoverageBar
              percent={
                coveragePercent
              }
            />

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
              const category =
                transaction
                  .allocations[0]
                  ?.category;

              const displayAmount =
                getTransactionDisplayAmount(
                  transaction
                );

              return (
                <div
                  key={
                    transaction.id
                  }
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center text-neutral-950">
                      <TransactionCategoryIcon
                        transaction={
                          transaction
                        }
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold leading-[16px]">
                        {transaction.description ??
                          category?.name ??
                          transaction
                            .entries[0]
                            ?.account
                            .name ??
                          "Transaction"}
                      </p>

                      <p className="mt-[2px] truncate text-[11px] leading-[15px] text-[#77736d]">
                        {category?.name ??
                          transaction
                            .entries[0]
                            ?.account
                            .name ??
                          transaction.type}
                      </p>
                    </div>
                  </div>

                  {displayAmount && (
                    <div className="shrink-0 pt-[1px] text-right">
                      <p
                        className={`text-[12px] font-semibold leading-[16px] ${
                          displayAmount.amount > 0n
                            ? "text-[#169253]"
                            : displayAmount.amount < 0n
                              ? "text-[#c73327]"
                              : "text-neutral-950"
                        }`}
                      >
                        {formatSignedTransactionMoney(
                          displayAmount.amount,
                          displayAmount.currencyCode
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
            <AddTransactionDialog />
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

function TransactionCategoryIcon({
  transaction,
}: {
  transaction: Transaction;
}) {
  const iconName =
    transaction.allocations[0]
      ?.category.icon ??
    getFallbackIconName(
      transaction.type
    );

  const Icon =
    categoryIcons[iconName] ??
    categoryIcons[
      getFallbackIconName(
        transaction.type
      )
    ] ??
    CircleEllipsis;

  return (
    <Icon
      className="size-[22px]"
      strokeWidth={1.9}
    />
  );
}

const categoryIcons: Record<
  string,
  LucideIcon
> = {
  utensils: Utensils,
  car: Car,
  house: House,
  "heart-pulse": HeartPulse,
  "shopping-bag": ShoppingBag,
  "gamepad-2": Gamepad2,
  smartphone: Smartphone,
  repeat: Repeat,
  users: Users,
  "circle-ellipsis":
    CircleEllipsis,
  "briefcase-business":
    BriefcaseBusiness,
  laptop: Laptop,
  "badge-dollar-sign":
    BadgeDollarSign,
  gift: Gift,
};

function getFallbackIconName(
  type: Transaction["type"]
) {
  if (type === "INCOME") {
    return "badge-dollar-sign";
  }

  if (type === "TRANSFER") {
    return "repeat";
  }

  return "circle-ellipsis";
}

function getTransactionDisplayAmount(
  transaction: Transaction
) {
  const currencyCode =
    transaction.entries[0]
      ?.currencyCode;

  if (!currencyCode) {
    return null;
  }

  if (
    transaction.type === "TRANSFER"
  ) {
    const positiveEntry =
      transaction.entries.find(
        (entry) =>
          BigInt(entry.amountMinor) >
          0n
      );

    return {
      amount: positiveEntry
        ? BigInt(
            positiveEntry.amountMinor
          )
        : 0n,
      currencyCode,
    };
  }

  return {
    amount:
      getTransactionAmount(
        transaction
      ),
    currencyCode,
  };
}

function formatSignedTransactionMoney(
  amount: bigint,
  currencyCode: string
) {
  if (amount > 0n) {
    return `+${formatMoney(
      amount,
      currencyCode
    )}`;
  }

  return formatMoney(
    amount,
    currencyCode
  );
}

function BudgetProgressLine({
  percent,
}: {
  percent: number;
}) {
  const width =
    clampPercent(percent);

  return (
    <div className="h-[13px] overflow-hidden rounded-full bg-[#eeece8]">
      <div
        style={{
          width: `${width}%`,
        }}
        className={`h-full rounded-full ${
          percent > 100
            ? "bg-[#f14a38]"
            : "bg-[#32c96a]"
        }`}
      />
    </div>
  );
}

function BudgetAlertPill({
  alert,
}: {
  alert: BudgetAlert;
}) {
  return (
    <span
      className={`inline-flex h-7 w-fit items-center rounded-full px-3 text-[11px] font-semibold ${
        alert.severity ===
        "critical"
          ? "bg-[#f14a38] text-white"
          : alert.severity ===
              "danger"
            ? "bg-[#ffe0dc] text-[#9f2419]"
            : alert.severity ===
                "warning"
              ? "bg-[#ffe884] text-[#665000]"
              : "bg-[#dff1fb] text-[#145f83]"
      }`}
    >
      {alert.label}
    </span>
  );
}

function BalanceMiniChart({
  values,
}: {
  values: bigint[];
}) {
  const points =
    buildChartPoints(values);

  const linePath =
    points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${point.x} ${point.y}`
      )
      .join(" ");

  const areaPath = `${linePath} L210 88 L0 88 Z`;

  return (
    <div className="-mx-[17px] -mb-[17px] mt-auto h-[88px] overflow-hidden rounded-b-[24px]">
      <svg
        viewBox="0 0 210 88"
        className="h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={areaPath}
          fill="#e0f0fb"
        />
        <path
          d={linePath}
          fill="none"
          stroke="#1681b5"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
      </svg>
    </div>
  );
}

function CoverageBar({
  percent,
}: {
  percent: number;
}) {
  const position =
    clampPercent(percent);

  return (
    <div className="relative h-[13px]">
      <div className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-[#efede9]">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f14a38_0%,#ffc916_48%,#89d548_72%,#2dc46b_100%)]" />
      </div>

      <span
        style={{
          left: `${position}%`,
        }}
        className="absolute top-1/2 size-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e6ea50] shadow-[0_0_0_2px_rgba(255,255,255,0.55)]"
      />
    </div>
  );
}

function buildBalanceSeries(
  transactions: Transaction[],
  currentBalance: bigint
) {
  const movements =
    transactions
      .map((transaction) => ({
        occurredAt:
          new Date(
            transaction.occurredAt
          ).getTime(),
        amount:
          getTransactionAmount(
            transaction
          ),
      }))
      .filter(
        (movement) =>
          movement.amount !== 0n
      )
      .sort(
        (first, second) =>
          first.occurredAt -
          second.occurredAt
      );

  if (movements.length === 0) {
    return buildCalmBalanceSeries(
      currentBalance
    );
  }

  const totalMovement =
    movements.reduce(
      (total, movement) =>
        total + movement.amount,
      0n
    );

  let runningBalance =
    currentBalance -
    totalMovement;

  const series = [
    runningBalance,
  ];

  for (const movement of movements) {
    runningBalance +=
      movement.amount;

    series.push(runningBalance);
  }

  return addVisualBreathingRoom(
    series
  );
}

function buildCalmBalanceSeries(
  currentBalance: bigint
) {
  return [
    currentBalance,
    currentBalance,
  ];
}

function addVisualBreathingRoom(
  values: bigint[]
) {
  if (values.length >= 4) {
    return values;
  }

  const first =
    values[0] ?? 0n;

  const last =
    values[values.length - 1] ??
    first;

  const midpoint =
    first + (last - first) / 2n;

  return [
    first,
    midpoint,
    ...values.slice(1),
  ];
}

function buildChartPoints(
  values: bigint[]
) {
  const chartValues =
    values.length >= 2
      ? values
      : [0n, 0n];

  const numericValues =
    chartValues.map(Number);

  const min =
    Math.min(...numericValues);

  const max =
    Math.max(...numericValues);

  const range =
    max - min;

  const width = 210;
  const height = 88;
  const topPadding = 10;
  const bottomPadding = 12;
  const drawableHeight =
    height -
    topPadding -
    bottomPadding;

  return numericValues.map(
    (value, index) => {
      const x =
        chartValues.length === 1
          ? width / 2
          : (index /
              (chartValues.length -
                1)) *
            width;

      const normalized =
        range === 0
          ? 0.5
          : (value - min) / range;

      const y =
        topPadding +
        (1 - normalized) *
          drawableHeight;

      return {
        x: Number(
          x.toFixed(2)
        ),
        y: Number(
          y.toFixed(2)
        ),
      };
    }
  );
}

function clampPercent(
  value: number
) {
  return Math.min(
    Math.max(value, 0),
    100
  );
}

function getCurrentBudgetMonth() {
  const now =
    new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
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
