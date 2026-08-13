import type { FinancialAccountRepository } from "../domain/financial-account.repository.js";

export class ArchiveFinancialAccount {
  constructor(
    private readonly repository: FinancialAccountRepository
  ) {}

  execute(
    id: string,
    userId: string
  ) {
    return this.repository.archive(
      id,
      userId
    );
  }
}