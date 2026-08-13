import type {
  CreateFinancialAccountInput,
  FinancialAccount,
} from "../domain/financial-account.js";

import type { FinancialAccountRepository } from "../domain/financial-account.repository.js";

export class CreateFinancialAccount {
  constructor(
    private readonly repository: FinancialAccountRepository
  ) {}

  execute(
    input: CreateFinancialAccountInput
  ): Promise<FinancialAccount> {
    return this.repository.create(input);
  }
}