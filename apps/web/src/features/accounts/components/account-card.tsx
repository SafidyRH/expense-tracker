"use client";

import { useState } from "react";

import {
  Archive,
  Banknote,
  Building2,
  CreditCard,
  MoreHorizontal,
  Pencil,
  Smartphone,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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

import { formatMoney } from "@/lib/money";

import { getAccountTypeLabel } from "../account.utils";

import { useArchiveAccount } from "../account.queries";

import type { FinancialAccount } from "../account.types";

import { EditAccountDialog } from "./add-account-dialog";

interface AccountCardProps {
  account: FinancialAccount;
}

interface AccountTypeIconProps {
  type: FinancialAccount["type"];
  className?: string;
}

function AccountTypeIcon({
  type,
  className,
}: AccountTypeIconProps) {
  switch (type) {
    case "CASH":
      return <Banknote className={className} />;

    case "BANK":
      return <Building2 className={className} />;

    case "MOBILE_MONEY":
      return <Smartphone className={className} />;

    case "E_WALLET":
      return <Wallet className={className} />;

    case "CREDIT_CARD":
      return <CreditCard className={className} />;

    case "OTHER":
    default:
      return <Wallet className={className} />;
  }
}

export function AccountCard({
  account,
}: AccountCardProps) {
  const [editOpen, setEditOpen] =
    useState(false);

  const [
    archiveOpen,
    setArchiveOpen,
  ] = useState(false);

  const archiveAccount =
    useArchiveAccount();

  async function handleArchive() {
    await archiveAccount.mutateAsync(
      account.id
    );

    setArchiveOpen(false);
  }

  return (
    <>
      <article className="rounded-[24px] bg-white px-[17px] pb-[18px] pt-[16px] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f1efeb] text-neutral-950">
              <AccountTypeIcon
                type={account.type}
                className="size-[21px]"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-[19px]">
                {account.name}
              </p>

              <p className="mt-[3px] truncate text-[12px] leading-[17px] text-[#706c66]">
                {account.institutionName ??
                  getAccountTypeLabel(
                    account.type
                  )}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full hover:bg-[#f1efeb]"
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
                onClick={() =>
                  setEditOpen(true)
                }
                className="rounded-[12px] px-3 py-2"
              >
                <Pencil className="size-4" />
                Modifier
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#efede9]" />

              <DropdownMenuItem
                onClick={() =>
                  setArchiveOpen(true)
                }
                variant="destructive"
                className="rounded-[12px] px-3 py-2"
              >
                <Archive className="size-4" />
                Archiver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-7">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#64605b]">
            Solde
          </p>

          <p className="mt-2 break-words text-[23px] font-medium leading-[27px] tracking-[-0.01em]">
            {formatMoney(
              account.balanceMinor,
              account.currencyCode
            )}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#f0eee9] pt-4">
          <p className="truncate text-[12px] text-[#706c66]">
            {getAccountTypeLabel(
              account.type
            )}
          </p>

          <span className="rounded-full bg-[#f1efeb] px-3 py-1 text-[11px] font-medium text-[#55514b]">
            {account.currencyCode}
          </span>
        </div>
      </article>

      <EditAccountDialog
        account={account}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-[390px] rounded-[28px] border-0 p-5">
          <DialogHeader>
            <DialogTitle>
              Archiver ce compte ?
            </DialogTitle>

            <DialogDescription>
              Le compte {account.name} sera retiré de la liste active. Cette
              action n&apos;efface pas son historique.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setArchiveOpen(false)
              }
              className="rounded-full"
            >
              Annuler
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={
                archiveAccount.isPending
              }
              onClick={handleArchive}
              className="rounded-full"
            >
              {archiveAccount.isPending
                ? "Archivage..."
                : "Archiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
