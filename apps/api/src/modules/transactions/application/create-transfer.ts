import type {
  CreateTransferInput,
} from "../domain/transfer.js";

import type {
  TransactionRepository,
} from "../domain/transaction.repository.js";

export class CreateTransfer {
  constructor(
    private readonly repository: TransactionRepository
  ) {}

  execute(
    input: CreateTransferInput
  ) {
    if (
      input.fromAccountId ===
      input.toAccountId
    ) {
      throw new Error(
        "Transfer accounts must be different"
      );
    }

    return this.repository.createTransfer(
      input
    );
  }
}
