export interface CreateExpenseInput {
  userId: string;

  accountId: string;
  categoryId: string;

  amountMinor: bigint;

  description?: string | null;
  note?: string | null;

  occurredAt: Date;

  clientGeneratedId: string;
}

export interface CreatedExpense {
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

export type CreateExpenseError =
  | "ACCOUNT_NOT_FOUND"
  | "CATEGORY_NOT_FOUND";

export type CreateExpenseResult =
  | {
      success: true;
      expense: CreatedExpense;
      duplicated: boolean;
    }
  | {
      success: false;
      error: CreateExpenseError;
    };