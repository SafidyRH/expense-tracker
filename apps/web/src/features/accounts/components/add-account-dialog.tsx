"use client";

import {
  FormEvent,
  useState,
} from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

import {
  useCreateAccount,
  useUpdateAccount,
} from "../account.queries";

import type {
  FinancialAccount,
  FinancialAccountType,
} from "../account.types";

const accountTypes: Array<{
  value: FinancialAccountType;
  label: string;
}> = [
  {
    value: "CASH",
    label: "Espèces",
  },
  {
    value: "BANK",
    label: "Banque",
  },
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
  },
  {
    value: "E_WALLET",
    label: "Portefeuille électronique",
  },
  {
    value: "CREDIT_CARD",
    label: "Carte de crédit",
  },
  {
    value: "OTHER",
    label: "Autre",
  },
];

interface AddAccountDialogProps {
  triggerClassName?: string;
}

interface EditAccountDialogProps {
  account: FinancialAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountDialog({
  triggerClassName,
}: AddAccountDialogProps) {
  const [open, setOpen] =
    useState(false);

  return (
    <AccountFormDialog
      key={open ? "add-open" : "add-closed"}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <DialogTrigger
          render={
            <Button
              type="button"
              className={cn(
                "h-12 rounded-full bg-neutral-950 px-5 text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-neutral-800",
                triggerClassName
              )}
            />
          }
        >
          <Plus className="mr-2 size-[16px]" />
          Ajouter un compte
        </DialogTrigger>
      }
    />
  );
}

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
}: EditAccountDialogProps) {
  return (
    <AccountFormDialog
      key={`${account.id}-${account.updatedAt}-${open ? "open" : "closed"}`}
      account={account}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

interface AccountFormDialogProps {
  account?: FinancialAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

function AccountFormDialog({
  account,
  open,
  onOpenChange,
  trigger,
}: AccountFormDialogProps) {
  const isEditing =
    Boolean(account);

  const [name, setName] =
    useState(
      account?.name ?? ""
    );

  const [type, setType] =
    useState<FinancialAccountType>(
      account?.type ?? "CASH"
    );

  const [
    institutionName,
    setInstitutionName,
  ] = useState(
    account?.institutionName ?? ""
  );

  const [
    initialBalance,
    setInitialBalance,
  ] = useState(
    account?.initialBalanceMinor ?? "0"
  );

  const [error, setError] =
    useState<string | null>(
      null
    );

  const createAccount =
    useCreateAccount();

  const updateAccount =
    useUpdateAccount();

  function resetForm() {
    setName(
      account?.name ?? ""
    );
    setType(
      account?.type ?? "CASH"
    );
    setInstitutionName(
      account?.institutionName ?? ""
    );
    setInitialBalance(
      account?.initialBalanceMinor ?? "0"
    );
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError(
        "Le nom du compte est obligatoire."
      );

      return;
    }

    const normalizedBalance =
      initialBalance
        .replace(/\s/g, "")
        .trim();

    if (
      !isEditing &&
      !/^-?\d+$/.test(
        normalizedBalance
      )
    ) {
      setError(
        "Le solde initial doit être un nombre entier."
      );

      return;
    }

    try {
      if (account) {
        await updateAccount.mutateAsync({
          id: account.id,
          input: {
            name: name.trim(),
            type,
            institutionName:
              institutionName.trim() ||
              null,
          },
        });
      } else {
        await createAccount.mutateAsync({
          name: name.trim(),

          type,

          institutionName:
            institutionName.trim() ||
            null,

          currencyCode: "MGA",

          initialBalanceMinor:
            normalizedBalance,
        });
      }

      resetForm();

      onOpenChange(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Impossible de modifier le compte."
            : "Impossible de créer le compte."
      );
    }
  }

  const showInstitution =
    type === "BANK" ||
    type === "MOBILE_MONEY" ||
    type === "E_WALLET" ||
    type === "CREDIT_CARD";

  const pending =
    createAccount.isPending ||
    updateAccount.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);

        if (!value) {
          resetForm();
        }
      }}
    >
      {trigger}

      <DialogContent className="w-[calc(100%-32px)] max-w-[420px] rounded-[28px] border-0 p-5">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Modifier le compte"
              : "Nouveau compte"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Mettez à jour le nom, le type ou l'institution du compte."
              : "Ajoutez un portefeuille, une banque ou un compte Mobile Money."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="account-name">
              Nom du compte
            </Label>

            <Input
              id="account-name"
              placeholder="Ex : MVola"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Type de compte
            </Label>

            <Select
              value={type}
              onValueChange={(value) =>
                setType(
                  value as FinancialAccountType
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {accountTypes.map(
                  (accountType) => (
                    <SelectItem
                      key={
                        accountType.value
                      }
                      value={
                        accountType.value
                      }
                    >
                      {
                        accountType.label
                      }
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {showInstitution && (
            <div className="space-y-2">
              <Label htmlFor="institution">
                Institution
              </Label>

              <Input
                id="institution"
                placeholder={
                  type ===
                  "MOBILE_MONEY"
                    ? "Ex : Telma"
                    : "Ex : BNI"
                }
                value={institutionName}
                onChange={(event) =>
                  setInstitutionName(
                    event.target.value
                  )
                }
              />
            </div>
          )}

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="initial-balance">
                Solde actuel
              </Label>

              <div className="relative">
                <Input
                  id="initial-balance"
                  type="number"
                  step="1"
                  value={
                    initialBalance
                  }
                  onChange={(event) =>
                    setInitialBalance(
                      event.target.value
                    )
                  }
                  className="pr-12"
                  required
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Ar
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Indiquez le montant actuellement disponible sur ce compte.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">
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
                : isEditing
                  ? "Enregistrer"
                  : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
