export interface CreateTransferInput {
  userId: string;

  fromAccountId: string;
  toAccountId: string;

  amountMinor: bigint;

  description?: string | null;
  note?: string | null;

  occurredAt: Date;

  clientGeneratedId: string;
}

export interface CreatedTransfer {
  id: string;

  fromAccountId: string;
  toAccountId: string;

  amountMinor: bigint;

  currencyCode: string;

  description: string | null;
  note: string | null;

  occurredAt: Date;

  clientGeneratedId: string;

  fromBalanceAfterMinor: bigint;
  toBalanceAfterMinor: bigint;

  createdAt: Date;
}

export type CreateTransferError =
  | "ACCOUNT_NOT_FOUND"
  | "SAME_ACCOUNT"
  | "CURRENCY_MISMATCH";

export type CreateTransferResult =
  | {
      success: true;
      transfer: CreatedTransfer;
      duplicated: boolean;
    }
  | {
      success: false;
      error: CreateTransferError;
    };
