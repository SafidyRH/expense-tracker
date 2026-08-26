import {
  Banknote,
  Building2,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatMoney } from "@/lib/money";

import { getAccountTypeLabel } from "../account.utils";

import type { FinancialAccount } from "../account.types";

interface AccountCardProps {
  account: FinancialAccount;
}

interface AccountTypeIconProps {
  type: FinancialAccount["type"];
  className?: string;
}

function AccountTypeIcon({ type, className }: AccountTypeIconProps) {
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

export function AccountCard({ account }: AccountCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <AccountTypeIcon type={account.type} className="size-5" />
          </div>

          <div>
            <CardTitle className="text-base">{account.name}</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {getAccountTypeLabel(account.type)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-semibold">
          {formatMoney(account.balanceMinor, account.currencyCode)}
        </p>

        {account.institutionName && (
          <p className="mt-2 text-sm text-muted-foreground">
            {account.institutionName}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
