import type {
  TransactionHistoryFilters,
} from "../domain/transaction-history.js";

import type {
  TransactionRepository,
} from "../domain/transaction.repository.js";

export class ListTransactions {
  constructor(
    private readonly repository:
      TransactionRepository
  ) {}

  execute(
    filters: TransactionHistoryFilters
  ) {
    return this.repository.listHistory(
      filters
    );
  }
}