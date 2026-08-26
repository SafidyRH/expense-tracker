"use client";

import { FormEvent, useState } from "react";

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

import { useCreateAccount } from "../account.queries";

import type { FinancialAccountType } from "../account.types";

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

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  const [type, setType] = useState<FinancialAccountType>("CASH");

  const [institutionName, setInstitutionName] = useState("");

  const [initialBalance, setInitialBalance] = useState("0");

  const [error, setError] = useState<string | null>(null);

  const createAccount = useCreateAccount();

  function resetForm() {
    setName("");
    setType("CASH");
    setInstitutionName("");
    setInitialBalance("0");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const normalizedBalance = initialBalance.replace(/\s/g, "").trim();

    if (!/^-?\d+$/.test(normalizedBalance)) {
      setError("Le solde initial doit être un nombre entier.");

      return;
    }

    try {
      await createAccount.mutateAsync({
        name: name.trim(),

        type,

        institutionName: institutionName.trim() || null,

        currencyCode: "MGA",

        initialBalanceMinor: normalizedBalance,
      });

      resetForm();

      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de créer le compte.",
      );
    }
  }

  const showInstitution =
    type === "BANK" ||
    type === "MOBILE_MONEY" ||
    type === "E_WALLET" ||
    type === "CREDIT_CARD";

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
      <DialogTrigger>
        <Button>
          <Plus className="mr-2 size-4" />
          Ajouter un compte
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau compte</DialogTitle>

          <DialogDescription>
            Ajoutez un portefeuille, un compte bancaire ou un compte Mobile
            Money.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="account-name">Nom du compte</Label>

            <Input
              id="account-name"
              placeholder="Ex : MVola"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type de compte</Label>

            <Select
              value={type}
              onValueChange={(value) => setType(value as FinancialAccountType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {accountTypes.map((accountType) => (
                  <SelectItem key={accountType.value} value={accountType.value}>
                    {accountType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showInstitution && (
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>

              <Input
                id="institution"
                placeholder={
                  type === "MOBILE_MONEY" ? "Ex : Telma" : "Ex : BNI"
                }
                value={institutionName}
                onChange={(event) => setInstitutionName(event.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="initial-balance">Solde actuel</Label>

            <div className="relative">
              <Input
                id="initial-balance"
                type="number"
                step="1"
                value={initialBalance}
                onChange={(event) => setInitialBalance(event.target.value)}
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>

            <Button type="submit" disabled={createAccount.isPending}>
              {createAccount.isPending ? "Création..." : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
