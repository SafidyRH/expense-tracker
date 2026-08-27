"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
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
} from "../transaction.queries";

export function AddExpenseDialog() {
  const [open, setOpen] =
    useState(false);

  const [
    accountId,
    setAccountId,
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

  const categories =
    useCategories(
      "EXPENSE"
    );

  const createExpense =
    useCreateExpense();

  function resetForm() {
    setAccountId("");
    setCategoryId("");
    setAmount("");
    setDescription("");
    setNote("");
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (!accountId) {
      setError(
        "Veuillez sélectionner un compte."
      );

      return;
    }

    if (!categoryId) {
      setError(
        "Veuillez sélectionner une catégorie."
      );

      return;
    }

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

    try {
      await createExpense.mutateAsync({
        accountId,

        categoryId,

        amountMinor:
          normalizedAmount,

        description:
          description.trim() ||
          undefined,

        note:
          note.trim() ||
          undefined,

        clientGeneratedId:
          crypto.randomUUID(),
      });

      resetForm();

      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la dépense."
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

      <DialogContent className="w-[calc(100%-32px)] max-w-[420px] rounded-[28px] border-0 p-5">
        <DialogHeader>
          <DialogTitle>
            Nouvelle dépense
          </DialogTitle>

          <DialogDescription>
            Enregistrez une dépense
            effectuée depuis l&apos;un de
            vos comptes.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label>
              Montant
            </Label>

            <div className="relative">
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="25000"
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
              Compte
            </Label>

            <Select
              value={accountId}
              onValueChange={
                ()=>setAccountId
              }
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

          <div className="space-y-2">
            <Label>
              Catégorie
            </Label>

            <Select
              value={
                categoryId
              }
              onValueChange={ ()=>
                setCategoryId
              }
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

          <div className="space-y-2">
            <Label>
              Description
            </Label>

            <Input
              placeholder="Ex : Déjeuner"
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

          <DialogFooter>
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
                createExpense.isPending
              }
              className="rounded-full bg-neutral-950"
            >
              {createExpense.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
