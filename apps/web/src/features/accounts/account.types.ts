export const financialAccountTypes = [
  "CASH",
  "BANK",
  "MOBILE_MONEY",
  "E_WALLET",
  "CREDIT_CARD",
  "OTHER",
] as const;

export type FinancialAccountType =
  (typeof financialAccountTypes)[number];

export interface FinancialAccount {
  id: string;

  name: string;

  type: FinancialAccountType;

  institutionName: string | null;

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

export interface AccountResponse {
  data: FinancialAccount;
}

export interface CreateFinancialAccountInput {
  name: string;

  type: FinancialAccountType;

  institutionName?: string | null;

  currencyCode?: string;

  initialBalanceMinor?: string;
}