import type {
  Transaction,
} from "./transaction.types";

export function getTransactionAmount(
  transaction: Transaction
) {
  return transaction.entries.reduce(
    (total, entry) =>
      total +
      BigInt(
        entry.amountMinor
      ),
    0n
  );
}

export function getExpenseAmount(
  transaction: Transaction
) {
  return transaction.allocations.reduce(
    (total, allocation) =>
      total +
      BigInt(
        allocation.amountMinor
      ),
    0n
  );
}