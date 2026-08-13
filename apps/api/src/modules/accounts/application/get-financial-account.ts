import type { FinancialAccountRepository } from "../domain/financial-account.repository.js";

export class GetFinancialAccount {
  constructor(
    private readonly repository: FinancialAccountRepository
  ) {}

  execute(
    id: string,
    userId: string
  ) {
    return this.repository.findByIdAndUserId(
      id,
      userId
    );
  }
}