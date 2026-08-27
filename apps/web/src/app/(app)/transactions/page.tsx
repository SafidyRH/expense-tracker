"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  CalendarDays,
  List,
  ReceiptText,
  Search,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useAccounts,
} from "@/features/accounts/account.queries";

import {
  useCategories,
} from "@/features/categories/category.queries";

import {
  AddTransactionDialog,
} from "@/features/transactions/components/add-expense-dialog";

import {
  useInfiniteTransactions,
} from "@/features/transactions/transaction.queries";

import type {
  Transaction,
} from "@/features/transactions/transaction.types";

import type {
  TransactionQuery,
} from "@/features/transactions/transaction.api";

import {
  formatMoney,
} from "@/lib/money";

const transactionTypes = [
  {
    value: "ALL",
    label: "Tous",
  },
  {
    value: "EXPENSE",
    label: "Dépenses",
  },
  {
    value: "INCOME",
    label: "Revenus",
  },
  {
    value: "TRANSFER",
    label: "Transferts",
  },
] as const;

export default function TransactionsPage() {
  const [type, setType] =
    useState("ALL");

  const [
    accountId,
    setAccountId,
  ] = useState("ALL");

  const [
    categoryId,
    setCategoryId,
  ] = useState("ALL");

  const [
    dateFrom,
    setDateFrom,
  ] = useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [
    selectedTransaction,
    setSelectedTransaction,
  ] = useState<Transaction | null>(
    null
  );

  const accounts =
    useAccounts();

  const categories =
    useCategories();

  const query =
    useMemo<TransactionQuery>(
      () => ({
        limit: 20,

        ...(type !== "ALL" && {
          type: type as TransactionQuery["type"],
        }),

        ...(accountId !== "ALL" && {
          accountId,
        }),

        ...(categoryId !== "ALL" && {
          categoryId,
        }),

        ...(dateFrom && {
          dateFrom:
            toStartOfDayIso(
              dateFrom
            ),
        }),

        ...(dateTo && {
          dateTo:
            toEndOfDayIso(
              dateTo
            ),
        }),
      }),
      [
        accountId,
        categoryId,
        dateFrom,
        dateTo,
        type,
      ]
    );

  const transactions =
    useInfiniteTransactions(
      query
    );

  const items =
    transactions.data?.pages.flatMap(
      (page) => page.data
    ) ?? [];

  const totalAmount =
    items.reduce(
      (total, transaction) =>
        total +
        getTransactionTotal(
          transaction
        ),
      0n
    );

  function resetFilters() {
    setType("ALL");
    setAccountId("ALL");
    setCategoryId("ALL");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <main className="mx-auto max-w-[425px] space-y-[14px] lg:max-w-none lg:space-y-5">
      <section className="grid grid-cols-2 gap-[14px] lg:grid-cols-4 lg:gap-5">
        <SummaryCard
          icon={
            <List className="size-[15px]" />
          }
          label="Historique"
          value={`${items.length}`}
          subtitle="Transactions chargées"
        />

        <SummaryCard
          icon={
            <ReceiptText className="size-[15px]" />
          }
          label="Mouvement"
          value={formatMoney(
            totalAmount
          )}
          subtitle="Net des lignes visibles"
        />

        <SummaryCard
          icon={
            <ArrowUpRight className="size-[15px]" />
          }
          label="Type"
          value={
            getTypeLabel(type)
          }
          subtitle="Filtre actif"
        />

        <SummaryCard
          icon={
            <CalendarDays className="size-[15px]" />
          }
          label="Période"
          value={
            dateFrom || dateTo
              ? "Active"
              : "Tout"
          }
          subtitle="Dates incluses"
        />
      </section>

      <section className="rounded-[24px] bg-white px-[17px] pb-[18px] pt-[18px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:px-6 lg:py-6">
        <div className="mb-[18px] flex items-center gap-2 text-[#64605b]">
          <Search className="size-[15px]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
            Filtres
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Select
            value={type}
            onValueChange={(value) => {
              if (value) {
                setType(value);
              }
            }}
          >
            <SelectTrigger className="w-full rounded-[16px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {transactionTypes.map(
                (item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select
            value={accountId}
            onValueChange={(value) => {
              if (value) {
                setAccountId(value);
              }
            }}
          >
            <SelectTrigger className="w-full rounded-[16px]">
              <SelectValue placeholder="Compte" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">
                Tous les comptes
              </SelectItem>

              {accounts.data?.data.map(
                (account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select
            value={categoryId}
            onValueChange={(value) => {
              if (value) {
                setCategoryId(value);
              }
            }}
          >
            <SelectTrigger className="w-full rounded-[16px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">
                Toutes catégories
              </SelectItem>

              {categories.data?.data.map(
                (category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(event) =>
              setDateFrom(
                event.target.value
              )
            }
            className="rounded-[16px]"
          />

          <Input
            type="date"
            value={dateTo}
            onChange={(event) =>
              setDateTo(
                event.target.value
              )
            }
            className="rounded-[16px]"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={resetFilters}
            className="rounded-full text-[12px] text-[#625f5a]"
          >
            Réinitialiser
          </Button>
        </div>
      </section>

      <section className="rounded-[24px] bg-white px-[17px] pb-[24px] pt-[18px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:px-6 lg:py-6">
        <div className="mb-[20px] flex items-center gap-2 text-[#64605b]">
          <List className="size-[15px]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
            Historique complet
          </span>
        </div>

        {transactions.isPending && (
          <div className="space-y-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[78px] animate-pulse rounded-[20px] bg-[#f1efeb]"
              />
            ))}
          </div>
        )}

        {transactions.isError && (
          <div className="flex min-h-[180px] items-center justify-center rounded-[24px] bg-[#f7f5f1] px-6 text-center">
            <p className="text-[13px] leading-[19px] text-destructive">
              Impossible de charger les transactions.
            </p>
          </div>
        )}

        {!transactions.isPending &&
          !transactions.isError &&
          items.length === 0 && (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[24px] bg-[#f7f5f1] px-7 text-center">
              <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.07)]">
                <ReceiptText className="size-6" />
              </div>

              <h2 className="text-[19px] font-semibold leading-[24px] tracking-[-0.01em]">
                Aucune transaction
              </h2>

              <p className="mt-2 max-w-[280px] text-[12px] leading-[18px] text-[#6f6b66]">
                Les dépenses, revenus et transferts apparaîtront ici.
              </p>
            </div>
          )}

        <div className="space-y-[12px]">
          {items.map(
            (transaction) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() =>
                  setSelectedTransaction(
                    transaction
                  )
                }
                className="flex w-full items-center justify-between gap-4 rounded-[20px] bg-[#f7f5f1] px-4 py-4 text-left transition-colors hover:bg-[#efede9]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <TransactionIcon
                      type={transaction.type}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-[17px]">
                      {getTransactionTitle(
                        transaction
                      )}
                    </p>

                    <p className="mt-[3px] truncate text-[11px] leading-[15px] text-[#706c66]">
                      {formatTransactionDate(
                        transaction.occurredAt
                      )}{" "}
                      ·{" "}
                      {getTransactionMeta(
                        transaction
                      )}
                    </p>
                  </div>
                </div>

                <p
                  className={`shrink-0 text-right text-[13px] font-semibold leading-[17px] ${
                    getTransactionTotal(
                      transaction
                    ) > 0n
                      ? "text-[#169253]"
                      : transaction.type ===
                          "TRANSFER"
                        ? "text-[#55514b]"
                        : "text-neutral-950"
                  }`}
                >
                  {formatSignedMoney(
                    transaction
                  )}
                </p>
              </button>
            )
          )}
        </div>

        {transactions.hasNextPage && (
          <div className="mt-5 flex justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={
                transactions.isFetchingNextPage
              }
              onClick={() =>
                transactions.fetchNextPage()
              }
              className="rounded-full"
            >
              {transactions.isFetchingNextPage
                ? "Chargement..."
                : "Charger plus"}
            </Button>
          </div>
        )}
      </section>

      <TransactionDetailDialog
        transaction={
          selectedTransaction
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransaction(
              null
            );
          }
        }}
      />

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

function SummaryCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-[154px] flex-col rounded-[24px] bg-white px-[17px] pb-[17px] pt-[16px] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-[8px] text-[#64605b]">
        {icon}

        <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>

      <p className="mt-[12px] break-words text-[24px] font-medium leading-[29px] tracking-[-0.01em]">
        {value}
      </p>

      <p className="mt-auto text-[12px] leading-[18px] text-[#6f6b66]">
        {subtitle}
      </p>
    </div>
  );
}

function TransactionDetailDialog({
  transaction,
  onOpenChange,
}: {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog
      open={Boolean(transaction)}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="w-[calc(100%-32px)] max-w-[430px] rounded-[28px] border-0 p-5">
        {transaction && (
          <>
            <DialogHeader>
              <DialogTitle>
                {getTransactionTitle(
                  transaction
                )}
              </DialogTitle>

              <DialogDescription>
                {getTypeLabel(
                  transaction.type
                )} ·{" "}
                {formatTransactionDate(
                  transaction.occurredAt
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-[20px] bg-[#f7f5f1] p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#64605b]">
                  Montant
                </p>

                <p className="mt-2 text-[24px] font-medium leading-[29px]">
                  {formatSignedMoney(
                    transaction
                  )}
                </p>
              </div>

              <div className="space-y-2">
                {transaction.entries.map(
                  (entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-[16px] bg-[#f7f5f1] px-4 py-3"
                    >
                      <span className="min-w-0 truncate text-[13px] font-medium">
                        {entry.account.name}
                      </span>

                      <span
                        className={`shrink-0 text-[13px] font-semibold ${
                          BigInt(
                            entry.amountMinor
                          ) > 0n
                            ? "text-[#169253]"
                            : "text-neutral-950"
                        }`}
                      >
                        {formatMoney(
                          entry.amountMinor,
                          entry.currencyCode
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>

              {transaction.allocations.length >
                0 && (
                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#64605b]">
                    Catégories
                  </p>

                  <div className="space-y-2">
                    {transaction.allocations.map(
                      (allocation) => (
                        <div
                          key={
                            allocation.id
                          }
                          className="flex items-center justify-between gap-3 rounded-[16px] bg-[#f7f5f1] px-4 py-3"
                        >
                          <span className="min-w-0 truncate text-[13px] font-medium">
                            {
                              allocation
                                .category
                                .name
                            }
                          </span>

                          <span className="shrink-0 text-[13px] font-semibold">
                            {formatMoney(
                              allocation.amountMinor
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {transaction.note && (
                <div className="rounded-[20px] bg-[#f7f5f1] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#64605b]">
                    Note
                  </p>

                  <p className="mt-2 text-[13px] leading-[19px] text-[#55514b]">
                    {transaction.note}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TransactionIcon({
  type,
}: {
  type: Transaction["type"];
}) {
  if (type === "INCOME") {
    return <ArrowDownLeft className="size-[18px]" />;
  }

  if (type === "TRANSFER") {
    return <ArrowRightLeft className="size-[18px]" />;
  }

  return <ArrowUpRight className="size-[18px]" />;
}

function getTransactionTitle(
  transaction: Transaction
) {
  if (transaction.description) {
    return transaction.description;
  }

  if (
    transaction.type === "TRANSFER"
  ) {
    const from =
      transaction.entries.find(
        (entry) =>
          BigInt(entry.amountMinor) <
          0n
      );

    const to =
      transaction.entries.find(
        (entry) =>
          BigInt(entry.amountMinor) >
          0n
      );

    return `${from?.account.name ?? "Compte"} → ${to?.account.name ?? "Compte"}`;
  }

  return (
    transaction.allocations[0]
      ?.category.name ??
    getTypeLabel(transaction.type)
  );
}

function getTransactionMeta(
  transaction: Transaction
) {
  if (
    transaction.type === "TRANSFER"
  ) {
    return "Transfert";
  }

  return (
    transaction.allocations[0]
      ?.category.name ??
    transaction.entries[0]
      ?.account.name ??
    getTypeLabel(transaction.type)
  );
}

function getTransactionTotal(
  transaction: Transaction
) {
  return transaction.entries.reduce(
    (total, entry) =>
      total +
      BigInt(entry.amountMinor),
    0n
  );
}

function formatSignedMoney(
  transaction: Transaction
) {
  if (
    transaction.type === "TRANSFER"
  ) {
    const positive =
      transaction.entries.find(
        (entry) =>
          BigInt(entry.amountMinor) >
          0n
      );

    return positive
      ? formatMoney(
          positive.amountMinor,
          positive.currencyCode
        )
      : formatMoney(0n);
  }

  const total =
    getTransactionTotal(
      transaction
    );

  const currency =
    transaction.entries[0]
      ?.currencyCode;

  if (total > 0n) {
    return `+${formatMoney(
      total,
      currency
    )}`;
  }

  return formatMoney(
    total,
    currency
  );
}

function getTypeLabel(type: string) {
  switch (type) {
    case "EXPENSE":
      return "Dépense";
    case "INCOME":
      return "Revenu";
    case "TRANSFER":
      return "Transfert";
    case "ADJUSTMENT":
      return "Ajustement";
    default:
      return "Tous";
  }
}

function formatTransactionDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

function toStartOfDayIso(
  value: string
) {
  return new Date(
    `${value}T00:00:00`
  ).toISOString();
}

function toEndOfDayIso(
  value: string
) {
  return new Date(
    `${value}T23:59:59`
  ).toISOString();
}
