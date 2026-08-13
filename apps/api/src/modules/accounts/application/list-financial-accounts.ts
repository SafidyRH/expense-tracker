import type { FinancialAccountRepository } from "../domain/financial-account.repository.js";

export class ListFinancialAccounts {
  constructor(
    private readonly repository: FinancialAccountRepository
  ) {}

  execute(userId: string) {
    return this.repository.findAllByUserId(
      userId
    );
  }
}