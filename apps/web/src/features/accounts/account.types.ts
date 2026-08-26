export type FinancialAccountType =
  | "CASH"
  | "BANK"
  | "MOBILE_MONEY"
  | "E_WALLET"
  | "CREDIT_CARD"
  | "OTHER";

export interface FinancialAccount {
  id: string;

  name: string;

  type: FinancialAccountType;

  institutionName:
    | string
    | null;

  currencyCode: string;

  initialBalanceMinor: string;

  balanceMinor: string;

  isArchived: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface AccountsResponse {
  data: FinancialAccount[];
}