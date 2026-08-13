import type {
  CreateFinancialAccountInput,
  FinancialAccount,
  UpdateFinancialAccountInput,
} from "./financial-account.js";

export interface FinancialAccountRepository {
  create(
    input: CreateFinancialAccountInput
  ): Promise<FinancialAccount>;

  findAllByUserId(
    userId: string
  ): Promise<FinancialAccount[]>;

  findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<FinancialAccount | null>;

  update(
    id: string,
    userId: string,
    input: UpdateFinancialAccountInput
  ): Promise<FinancialAccount | null>;

  archive(
    id: string,
    userId: string
  ): Promise<boolean>;
}