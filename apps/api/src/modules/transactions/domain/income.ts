export interface CreateIncomeInput {
  userId: string;

  accountId: string;
  categoryId: string;

  amountMinor: bigint;

  description?: string | null;
  note?: string | null;

  occurredAt: Date;

  clientGeneratedId: string;
}

export interface CreatedIncome {
  id: string;

  accountId: string;
  categoryId: string;

  amountMinor: bigint;

  currencyCode: string;

  description: string | null;
  note: string | null;

  occurredAt: Date;

  clientGeneratedId: string;

  balanceAfterMinor: bigint;

  createdAt: Date;
}

export type CreateIncomeError =
  | "ACCOUNT_NOT_FOUND"
  | "CATEGORY_NOT_FOUND";

export type CreateIncomeResult =
  | {
      success: true;
      income: CreatedIncome;
      duplicated: boolean;
    }
  | {
      success: false;
      error: CreateIncomeError;
    };
