"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Plus,
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
  DialogTrigger,
} from "@/components/ui/dialog";

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
  Textarea,
} from "@/components/ui/textarea";

import {
  useAccounts,
} from "@/features/accounts/account.queries";

import {
  useCategories,
} from "@/features/categories/category.queries";

import {
  useCreateExpense,
  useCreateIncome,
  useCreateTransfer,
} from "../transaction.queries";

type TransactionMode =
  | "EXPENSE"
  | "INCOME"
  | "TRANSFER";

const modes: Array<{
  value: TransactionMode;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: "EXPENSE",
    label: "Dépense",
    icon: <ArrowUpRight className="size-4" />,
  },
  {
    value: "INCOME",
    label: "Revenu",
    icon: <ArrowDownLeft className="size-4" />,
  },
  {
    value: "TRANSFER",
    label: "Transfert",
    icon: <ArrowRightLeft className="size-4" />,
  },
];

export function AddTransactionDialog() {
  const [open, setOpen] =
    useState(false);

  const [mode, setMode] =
    useState<TransactionMode>(
      "EXPENSE"
    );

  const [
    accountId,
    setAccountId,
  ] = useState("");

  const [
    toAccountId,
    setToAccountId,
  ] = useState("");

  const [
    categoryId,
    setCategoryId,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    occurredAt,
    setOccurredAt,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    note,
    setNote,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const accounts =
    useAccounts();

  const expenseCategories =
    useCategories(
      "EXPENSE"
    );

  const incomeCategories =
    useCategories(
      "INCOME"
    );

  const createExpense =
    useCreateExpense();

  const createIncome =
    useCreateIncome();

  const createTransfer =
    useCreateTransfer();

  const categories =
    mode === "INCOME"
      ? incomeCategories
      : expenseCategories;

  const pending =
    createExpense.isPending ||
    createIncome.isPending ||
    createTransfer.isPending;

  function resetForm() {
    setMode("EXPENSE");
    setAccountId("");
    setToAccountId("");
    setCategoryId("");
    setAmount("");
    setOccurredAt("");
    setDescription("");
    setNote("");
    setError(null);
  }

  function getOccurredAtValue() {
    if (!occurredAt) {
      return undefined;
    }

    return new Date(
      `${occurredAt}T12:00:00`
    ).toISOString();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    const normalizedAmount =
      amount
        .replace(
          /\s/g,
          ""
        )
        .trim();

    if (
      !/^\d+$/.test(
        normalizedAmount
      ) ||
      BigInt(
        normalizedAmount
      ) <= 0n
    ) {
      setError(
        "Veuillez saisir un montant valide."
      );

      return;
    }

    if (!accountId) {
      setError(
        mode === "TRANSFER"
          ? "Veuillez sélectionner le compte source."
          : "Veuillez sélectionner un compte."
      );

      return;
    }

    if (
      mode === "TRANSFER" &&
      !toAccountId
    ) {
      setError(
        "Veuillez sélectionner le compte destinataire."
      );

      return;
    }

    if (
      mode === "TRANSFER" &&
      accountId === toAccountId
    ) {
      setError(
        "Le compte source et le compte destinataire doivent être différents."
      );

      return;
    }

    if (
      mode !== "TRANSFER" &&
      !categoryId
    ) {
      setError(
        "Veuillez sélectionner une catégorie."
      );

      return;
    }

    const baseInput = {
      amountMinor:
        normalizedAmount,

      description:
        description.trim() ||
        undefined,

      note:
        note.trim() ||
        undefined,

      occurredAt:
        getOccurredAtValue(),

      clientGeneratedId:
        crypto.randomUUID(),
    };

    try {
      if (mode === "EXPENSE") {
        await createExpense.mutateAsync({
          ...baseInput,

          accountId,

          categoryId,
        });
      }

      if (mode === "INCOME") {
        await createIncome.mutateAsync({
          ...baseInput,

          accountId,

          categoryId,
        });
      }

      if (mode === "TRANSFER") {
        await createTransfer.mutateAsync({
          ...baseInput,

          fromAccountId:
            accountId,

          toAccountId,
        });
      }

      resetForm();

      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la transaction."
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          resetForm();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button className="h-12 rounded-full bg-neutral-950 px-5 text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-neutral-800" />
        }
      >
        <Plus className="mr-2 size-[16px]" />

        Ajouter une transaction
      </DialogTrigger>

      <DialogContent className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-32px)] max-w-[430px] flex-col gap-0 overflow-hidden rounded-[28px] border-0 p-0 sm:max-h-[calc(100vh-48px)]">
        <DialogHeader className="shrink-0 px-5 pb-4 pt-5">
          <DialogTitle>
            Ajouter une transaction
          </DialogTitle>

          <DialogDescription>
            Enregistrez une dépense, un revenu ou un transfert entre comptes.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-5">
          <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-[#f1efeb] p-1">
            {modes.map(
              (item) => (
                <button
                  key={
                    item.value
                  }
                  type="button"
                  onClick={() => {
                    setMode(
                      item.value
                    );
                    setCategoryId("");
                    setError(null);
                  }}
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[18px] text-[12px] font-medium transition-colors ${
                    mode === item.value
                      ? "bg-white text-neutral-950 shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                      : "text-[#68645f]"
                  }`}
                >
                  {item.icon}
                  <span>
                    {item.label}
                  </span>
                </button>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label>
              {mode ===
              "TRANSFER"
                ? "Compte source"
                : "Compte"}
            </Label>

            <Select
              value={accountId}
              onValueChange={(value) => {
                if (value) {
                  setAccountId(value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un compte" />
              </SelectTrigger>

              <SelectContent>
                {accounts.data?.data.map(
                  (
                    account
                  ) => (
                    <SelectItem
                      key={
                        account.id
                      }
                      value={
                        account.id
                      }
                    >
                      {
                        account.name
                      }
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {mode ===
            "TRANSFER" && (
            <div className="space-y-2">
              <Label>
                Compte destinataire
              </Label>

              <Select
                value={toAccountId}
                onValueChange={(value) => {
                  if (value) {
                    setToAccountId(value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>

                <SelectContent>
                  {accounts.data?.data.map(
                    (
                      account
                    ) => (
                      <SelectItem
                        key={
                          account.id
                        }
                        value={
                          account.id
                        }
                      >
                        {
                          account.name
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode !==
            "TRANSFER" && (
            <div className="space-y-2">
              <Label>
                Catégorie
              </Label>

              <Select
                value={
                  categoryId
                }
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
                  {categories.data?.data.map(
                    (
                      category
                    ) => (
                      <SelectItem
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
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
                min="1"
                step="1"
                placeholder="2500000"
                value={amount}
                onChange={(
                  event
                ) =>
                  setAmount(
                    event.target
                      .value
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

          <div className="space-y-2">
            <Label>
              Date
            </Label>

            <Input
              type="date"
              value={occurredAt}
              onChange={(event) =>
                setOccurredAt(
                  event.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Description
            </Label>

            <Input
              placeholder={
                mode === "INCOME"
                  ? "Ex : Salaire"
                  : mode ===
                      "TRANSFER"
                    ? "Ex : Recharge MVola"
                    : "Ex : Dîner"
              }
              value={
                description
              }
              onChange={(
                event
              ) =>
                setDescription(
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Note
            </Label>

            <Textarea
              placeholder="Optionnel"
              value={note}
              onChange={(
                event
              ) =>
                setNote(
                  event.target
                    .value
                )
              }
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">
              {error}
            </p>
          )}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-[#efede9] bg-white px-5 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
              className="rounded-full"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={
                pending
              }
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

export const AddExpenseDialog =
  AddTransactionDialog;
