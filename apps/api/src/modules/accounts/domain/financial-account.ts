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

  userId: string;

  name: string;

  type: FinancialAccountType;

  institutionName: string | null;

  currencyCode: string;

  initialBalanceMinor: bigint;
  cachedBalanceMinor: bigint;

  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFinancialAccountInput {
  userId: string;

  name: string;

  type: FinancialAccountType;

  institutionName?: string | null;

  currencyCode: string;

  initialBalanceMinor: bigint;
}

export interface UpdateFinancialAccountInput {
  name?: string;

  type?: FinancialAccountType;

  institutionName?: string | null;
}