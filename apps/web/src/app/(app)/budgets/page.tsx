"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChartPie,
  MoreHorizontal,
  Pencil,
  Plus,
  Target,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useCategories,
} from "@/features/categories/category.queries";

import {
  useBudgetOverview,
  useDeleteCategoryBudget,
  useUpsertCategoryBudget,
  useUpsertGlobalBudget,
} from "@/features/budgets/budget.queries";

import type {
  CategoryBudgetProgress,
} from "@/features/budgets/budget.types";

import {
  formatMoney,
} from "@/lib/money";

export default function BudgetsPage() {
  const [month, setMonth] =
    useState(getCurrentMonth());

  const [
    globalDialogOpen,
    setGlobalDialogOpen,
  ] = useState(false);

  const [
    categoryDialogOpen,
    setCategoryDialogOpen,
  ] = useState(false);

  const [
    editedCategoryBudget,
    setEditedCategoryBudget,
  ] = useState<CategoryBudgetProgress | null>(
    null
  );

  const overview =
    useBudgetOverview(month);

  const categories =
    useCategories("EXPENSE");

  const categoryBudgets =
    useMemo(
      () =>
        overview.data?.data.categories ??
        [],
      [
        overview.data?.data.categories,
      ]
    );

  const global =
    overview.data?.data.global;

  const categoryBudgetTotal =
    categoryBudgets.reduce(
      (total, budget) =>
        total +
        BigInt(
          budget.amountMinor
        ),
      0n
    );

  const categorySpentTotal =
    categoryBudgets.reduce(
      (total, budget) =>
        total +
        BigInt(
          budget.spentMinor
        ),
      0n
    );

  const averageConsumed =
    categoryBudgets.length > 0
      ? Math.round(
          categoryBudgets.reduce(
            (total, budget) =>
              total +
              budget.percentConsumed,
            0
          ) /
            categoryBudgets.length
        )
      : 0;

  const selectedCategoryIds =
    useMemo(
      () =>
        new Set(
          categoryBudgets.map(
            (budget) =>
              budget.category.id
          )
        ),
      [categoryBudgets]
    );

  function openCategoryBudgetDialog(
    budget?: CategoryBudgetProgress
  ) {
    setEditedCategoryBudget(
      budget ?? null
    );
    setCategoryDialogOpen(true);
  }

  return (
    <main className="mx-auto max-w-[425px] space-y-[14px] lg:max-w-none lg:space-y-5">
      <section className="grid grid-cols-2 gap-[14px] lg:grid-cols-4 lg:gap-5">
        <div className="col-span-2 flex min-h-[206px] flex-col rounded-[24px] bg-white px-[17px] pb-[17px] pt-[16px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-[8px] text-[#64605b]">
                <WalletCards className="size-[15px]" />

                <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
                  Budget mensuel
                </span>
              </div>

              <p className="mt-[12px] break-words text-[28px] font-medium leading-[33px] tracking-[-0.01em]">
                {global
                  ? formatMoney(
                      global.amountMinor,
                      global.currencyCode
                    )
                  : formatMoney(0n)}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setGlobalDialogOpen(true)
              }
              className="size-10 rounded-full bg-[#f1efeb] hover:bg-[#e7e3dc]"
            >
              <Pencil className="size-4" />
            </Button>
          </div>

          <div className="mt-auto space-y-3">
            <BudgetProgressBar
              percent={
                global?.percentConsumed ??
                0
              }
            />

            <div className="grid grid-cols-3 gap-2 text-[12px] leading-[17px]">
              <BudgetMetric
                label="Dépensé"
                value={
                  global
                    ? formatMoney(
                        global.spentMinor,
                        global.currencyCode
                      )
                    : formatMoney(0n)
                }
              />

              <BudgetMetric
                label={
                  global &&
                  BigInt(
                    global.remainingMinor
                  ) < 0n
                    ? "Dépassement"
                    : "Restant"
                }
                value={
                  global
                    ? formatMoney(
                        global.remainingMinor,
                        global.currencyCode
                      )
                    : formatMoney(0n)
                }
              />

              <BudgetMetric
                label="Consommé"
                value={`${formatPercent(
                  global?.percentConsumed ??
                    0
                )}%`}
              />
            </div>
          </div>
        </div>

        <SummaryCard
          icon={
            <Target className="size-[15px]" />
          }
          label="Catégories"
          value={`${categoryBudgets.length}`}
          subtitle="Budgets définis"
        />

        <SummaryCard
          icon={
            <ChartPie className="size-[15px]" />
          }
          label="Moyenne"
          value={`${averageConsumed}%`}
          subtitle="Consommation"
        />
      </section>

      <section className="rounded-[24px] bg-white px-[17px] pb-[18px] pt-[18px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:px-6 lg:py-6">
        <div className="mb-[18px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#64605b]">
            <CalendarDays className="size-[15px]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
              Période
            </span>
          </div>

          <Input
            type="month"
            value={month}
            onChange={(event) =>
              setMonth(
                event.target.value
              )
            }
            className="h-10 w-[154px] rounded-[16px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-[14px]">
          <BudgetMetricPanel
            label="Budget catégories"
            value={formatMoney(
              categoryBudgetTotal
            )}
          />

          <BudgetMetricPanel
            label="Dépensé catégories"
            value={formatMoney(
              categorySpentTotal
            )}
          />
        </div>
      </section>

      <section className="rounded-[24px] bg-white px-[17px] pb-[24px] pt-[18px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:px-6 lg:py-6">
        <div className="mb-[20px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#64605b]">
            <Target className="size-[15px]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
              Budgets par catégorie
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              openCategoryBudgetDialog()
            }
            className="size-10 rounded-full bg-[#f1efeb] hover:bg-[#e7e3dc]"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {overview.isPending && (
          <div className="space-y-3">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[116px] animate-pulse rounded-[20px] bg-[#f1efeb]"
              />
            ))}
          </div>
        )}

        {overview.isError && (
          <div className="flex min-h-[180px] items-center justify-center rounded-[24px] bg-[#f7f5f1] px-6 text-center">
            <p className="text-[13px] leading-[19px] text-destructive">
              Impossible de charger les budgets.
            </p>
          </div>
        )}

        {!overview.isPending &&
          !overview.isError &&
          categoryBudgets.length === 0 && (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[24px] bg-[#f7f5f1] px-7 text-center">
              <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.07)]">
                <Target className="size-6" />
              </div>

              <h2 className="text-[19px] font-semibold leading-[24px] tracking-[-0.01em]">
                Aucun budget catégorie
              </h2>

              <p className="mt-2 max-w-[280px] text-[12px] leading-[18px] text-[#6f6b66]">
                Définissez les enveloppes par catégorie pour suivre le restant
                et le pourcentage consommé.
              </p>

              <Button
                type="button"
                onClick={() =>
                  openCategoryBudgetDialog()
                }
                className="mt-6 h-12 rounded-full bg-neutral-950 px-5 text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-neutral-800"
              >
                <Plus className="mr-2 size-[16px]" />
                Ajouter une catégorie
              </Button>
            </div>
          )}

        <div className="grid gap-[14px] lg:grid-cols-2">
          {categoryBudgets.map(
            (budget) => (
              <CategoryBudgetCard
                key={budget.category.id}
                budget={budget}
                month={month}
                onEdit={() =>
                  openCategoryBudgetDialog(
                    budget
                  )
                }
              />
            )
          )}
        </div>
      </section>

      {categoryBudgets.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[95px] z-40 lg:bottom-8">
          <div className="mx-auto flex w-full max-w-[469px] justify-end px-[18px] lg:max-w-[1180px] lg:pl-[318px] lg:pr-[52px]">
            <div className="pointer-events-auto">
              <Button
                type="button"
                onClick={() =>
                  openCategoryBudgetDialog()
                }
                className="h-12 rounded-full bg-neutral-950 px-5 text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-neutral-800"
              >
                <Plus className="mr-2 size-[16px]" />
                Ajouter une catégorie
              </Button>
            </div>
          </div>
        </div>
      )}

      <GlobalBudgetDialog
        month={month}
        amountMinor={
          global?.amountMinor ?? "0"
        }
        open={globalDialogOpen}
        onOpenChange={
          setGlobalDialogOpen
        }
      />

      <CategoryBudgetDialog
        month={month}
        budget={
          editedCategoryBudget
        }
        categories={
          categories.data?.data ?? []
        }
        selectedCategoryIds={
          selectedCategoryIds
        }
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);

          if (!open) {
            setEditedCategoryBudget(
              null
            );
          }
        }}
      />
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

function BudgetMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[#8a867f]">
        {label}
      </p>

      <p className="mt-1 truncate font-semibold text-neutral-950">
        {value}
      </p>
    </div>
  );
}

function BudgetMetricPanel({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] bg-[#f7f5f1] p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#64605b]">
        {label}
      </p>

      <p className="mt-2 break-words text-[20px] font-medium leading-[25px] tracking-[-0.01em]">
        {value}
      </p>
    </div>
  );
}

function CategoryBudgetCard({
  budget,
  month,
  onEdit,
}: {
  budget: CategoryBudgetProgress;
  month: string;
  onEdit: () => void;
}) {
  const deleteBudget =
    useDeleteCategoryBudget();

  const remaining =
    BigInt(
      budget.remainingMinor
    );

  async function handleDelete() {
    await deleteBudget.mutateAsync({
      categoryId:
        budget.category.id,

      month,
    });
  }

  return (
    <article className="rounded-[20px] bg-[#f7f5f1] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-[19px]">
            {budget.category.name}
          </p>

          <p className="mt-[3px] text-[12px] leading-[17px] text-[#706c66]">
            {formatPercent(
              budget.percentConsumed
            )}
            % consommé
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-full hover:bg-white"
              />
            }
          >
            <MoreHorizontal className="size-[19px]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-44 rounded-[16px] border-0 bg-white p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.16)] ring-0"
          >
            <DropdownMenuItem
              onClick={onEdit}
              className="rounded-[12px] px-3 py-2"
            >
              <Pencil className="size-4" />
              Modifier
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[#efede9]" />

            <DropdownMenuItem
              onClick={handleDelete}
              variant="destructive"
              className="rounded-[12px] px-3 py-2"
            >
              <Trash2 className="size-4" />
              Retirer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <BudgetProgressBar
          percent={
            budget.percentConsumed
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[12px] leading-[17px]">
        <BudgetMetric
          label="Budget"
          value={formatMoney(
            budget.amountMinor,
            budget.currencyCode
          )}
        />

        <BudgetMetric
          label="Dépensé"
          value={formatMoney(
            budget.spentMinor,
            budget.currencyCode
          )}
        />

        <BudgetMetric
          label={
            remaining < 0n
              ? "Dépassé"
              : "Restant"
          }
          value={formatMoney(
            budget.remainingMinor,
            budget.currencyCode
          )}
        />
      </div>
    </article>
  );
}

function GlobalBudgetDialog({
  month,
  amountMinor,
  open,
  onOpenChange,
}: {
  month: string;
  amountMinor: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <BudgetAmountDialog
      key={`${month}-${amountMinor}-${open ? "open" : "closed"}`}
      title="Budget mensuel global"
      description="Définissez l'enveloppe totale du mois."
      month={month}
      initialAmount={amountMinor}
      open={open}
      onOpenChange={onOpenChange}
      onSubmitBudget={(input) => ({
        scope: "GLOBAL",
        input,
      })}
    />
  );
}

function CategoryBudgetDialog({
  month,
  budget,
  categories,
  selectedCategoryIds,
  open,
  onOpenChange,
}: {
  month: string;
  budget: CategoryBudgetProgress | null;
  categories: Array<{
    id: string;
    name: string;
  }>;
  selectedCategoryIds: Set<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const availableCategories =
    categories.filter(
      (category) =>
        category.id ===
          budget?.category.id ||
        !selectedCategoryIds.has(
          category.id
        )
    );

  return (
    <BudgetAmountDialog
      key={`${month}-${budget?.category.id ?? "new"}-${open ? "open" : "closed"}`}
      title={
        budget
          ? "Modifier le budget"
          : "Budget par catégorie"
      }
      description="Choisissez une catégorie de dépense et son enveloppe mensuelle."
      month={month}
      initialAmount={
        budget?.amountMinor ?? "0"
      }
      initialCategoryId={
        budget?.category.id
      }
      categories={
        availableCategories
      }
      open={open}
      onOpenChange={onOpenChange}
      onSubmitBudget={(input, categoryId) => ({
        scope: "CATEGORY",
        categoryId,
        input,
      })}
    />
  );
}

type BudgetSubmitTarget =
  | {
      scope: "GLOBAL";
      input: {
        month: string;
        amountMinor: string;
        currencyCode: string;
      };
    }
  | {
      scope: "CATEGORY";
      categoryId: string;
      input: {
        month: string;
        amountMinor: string;
        currencyCode: string;
      };
    };

function BudgetAmountDialog({
  title,
  description,
  month,
  initialAmount,
  initialCategoryId,
  categories,
  open,
  onOpenChange,
  onSubmitBudget,
}: {
  title: string;
  description: string;
  month: string;
  initialAmount: string;
  initialCategoryId?: string;
  categories?: Array<{
    id: string;
    name: string;
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitBudget: (
    input: {
      month: string;
      amountMinor: string;
      currencyCode: string;
    },
    categoryId: string
  ) => BudgetSubmitTarget;
}) {
  const [amount, setAmount] =
    useState(initialAmount);

  const [
    categoryId,
    setCategoryId,
  ] = useState(
    initialCategoryId ?? ""
  );

  const [error, setError] =
    useState<string | null>(
      null
    );

  const upsertGlobal =
    useUpsertGlobalBudget();

  const upsertCategory =
    useUpsertCategoryBudget();

  const pending =
    upsertGlobal.isPending ||
    upsertCategory.isPending;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    const normalizedAmount =
      amount
        .replace(/\s/g, "")
        .trim();

    if (
      !/^\d+$/.test(
        normalizedAmount
      )
    ) {
      setError(
        "Veuillez saisir un montant valide."
      );

      return;
    }

    if (
      categories &&
      !categoryId
    ) {
      setError(
        "Veuillez sélectionner une catégorie."
      );

      return;
    }

    const target =
      onSubmitBudget(
        {
          month,
          amountMinor:
            normalizedAmount,
          currencyCode: "MGA",
        },
        categoryId
      );

    if (
      target.scope === "GLOBAL"
    ) {
      await upsertGlobal.mutateAsync(
        target.input
      );
    } else {
      await upsertCategory.mutateAsync({
        categoryId:
          target.categoryId,

        input:
          target.input,
      });
    }

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="w-[calc(100%-32px)] max-w-[420px] rounded-[28px] border-0 p-5">
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>

          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {categories && (
            <div className="space-y-2">
              <Label>
                Catégorie
              </Label>

              <Select
                value={categoryId}
                onValueChange={(value) => {
                  if (value) {
                    setCategoryId(value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map(
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
            </div>
          )}

          <div className="space-y-2">
            <Label>
              Montant
            </Label>

            <div className="relative">
              <Input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                className="pr-12"
                required
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                Ar
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              className="rounded-full"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={pending}
              className="rounded-full bg-neutral-950"
            >
              {pending
                ? "Enregistrement..."
                : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BudgetProgressBar({
  percent,
}: {
  percent: number;
}) {
  const width =
    Math.min(
      Math.max(percent, 0),
      100
    );

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

function getCurrentMonth() {
  const now =
    new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatPercent(
  value: number
) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1);
}
