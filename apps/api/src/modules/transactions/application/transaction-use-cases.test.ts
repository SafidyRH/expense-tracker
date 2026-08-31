import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  CreateExpense,
} from "./create-expense.js";
import {
  CreateIncome,
} from "./create-income.js";
import {
  CreateTransfer,
} from "./create-transfer.js";
import {
  ListTransactions,
} from "./list-transactions.js";

import type {
  CreateExpenseInput,
  CreateExpenseResult,
} from "../domain/expense.js";
import type {
  CreateIncomeInput,
  CreateIncomeResult,
} from "../domain/income.js";
import type {
  TransactionHistoryFilters,
  TransactionHistoryResult,
} from "../domain/transaction-history.js";
import type {
  TransactionRepository,
} from "../domain/transaction.repository.js";
import type {
  CreateTransferInput,
  CreateTransferResult,
} from "../domain/transfer.js";

describe("transaction use cases", () => {
  const occurredAt =
    new Date("2026-01-15T10:00:00.000Z");
  const createdAt =
    new Date("2026-01-15T10:01:00.000Z");

  function createExpenseInput(
    overrides: Partial<CreateExpenseInput> = {}
  ): CreateExpenseInput {
    return {
      userId: "user-1",
      accountId: "account-1",
      categoryId: "category-1",
      amountMinor: 12_500n,
      description: "Lunch",
      note: null,
      occurredAt,
      clientGeneratedId: "client-expense-1",
      ...overrides,
    };
  }

  function createIncomeInput(
    overrides: Partial<CreateIncomeInput> = {}
  ): CreateIncomeInput {
    return {
      userId: "user-1",
      accountId: "account-1",
      categoryId: "category-2",
      amountMinor: 100_000n,
      description: "Salary",
      note: null,
      occurredAt,
      clientGeneratedId: "client-income-1",
      ...overrides,
    };
  }

  function createTransferInput(
    overrides: Partial<CreateTransferInput> = {}
  ): CreateTransferInput {
    return {
      userId: "user-1",
      fromAccountId: "account-1",
      toAccountId: "account-2",
      amountMinor: 25_000n,
      description: "Savings",
      note: null,
      occurredAt,
      clientGeneratedId: "client-transfer-1",
      ...overrides,
    };
  }

  function createRepository(): TransactionRepository {
    return {
      createExpense: vi.fn(
        async (
          input: CreateExpenseInput
        ): Promise<CreateExpenseResult> => ({
          success: true,
          duplicated: false,
          expense: {
            id: "transaction-1",
            accountId: input.accountId,
            categoryId: input.categoryId,
            amountMinor: input.amountMinor,
            currencyCode: "MGA",
            description:
              input.description ?? null,
            note: input.note ?? null,
            occurredAt: input.occurredAt,
            clientGeneratedId:
              input.clientGeneratedId,
            balanceAfterMinor: 87_500n,
            createdAt,
          },
        })
      ),
      createIncome: vi.fn(
        async (
          input: CreateIncomeInput
        ): Promise<CreateIncomeResult> => ({
          success: true,
          duplicated: false,
          income: {
            id: "transaction-2",
            accountId: input.accountId,
            categoryId: input.categoryId,
            amountMinor: input.amountMinor,
            currencyCode: "MGA",
            description:
              input.description ?? null,
            note: input.note ?? null,
            occurredAt: input.occurredAt,
            clientGeneratedId:
              input.clientGeneratedId,
            balanceAfterMinor: 200_000n,
            createdAt,
          },
        })
      ),
      createTransfer: vi.fn(
        async (
          input: CreateTransferInput
        ): Promise<CreateTransferResult> => ({
          success: true,
          duplicated: false,
          transfer: {
            id: "transaction-3",
            fromAccountId:
              input.fromAccountId,
            toAccountId:
              input.toAccountId,
            amountMinor: input.amountMinor,
            currencyCode: "MGA",
            description:
              input.description ?? null,
            note: input.note ?? null,
            occurredAt: input.occurredAt,
            clientGeneratedId:
              input.clientGeneratedId,
            fromBalanceAfterMinor:
              75_000n,
            toBalanceAfterMinor:
              125_000n,
            createdAt,
          },
        })
      ),
      listHistory: vi.fn(
        async (): Promise<TransactionHistoryResult> => ({
          items: [],
          hasMore: false,
        })
      ),
    };
  }

  it("creates an expense through the repository", async () => {
    const repository = createRepository();
    const useCase = new CreateExpense(repository);
    const input = createExpenseInput();

    const result =
      await useCase.execute(input);

    expect(
      repository.createExpense
    ).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({
      success: true,
      duplicated: false,
      expense: {
        amountMinor: 12_500n,
        balanceAfterMinor: 87_500n,
      },
    });
  });

  it("rejects expenses with a zero or negative amount", async () => {
    const repository = createRepository();
    const useCase = new CreateExpense(repository);

    expect(() =>
      useCase.execute(
        createExpenseInput({
          amountMinor: 0n,
        })
      )
    ).toThrow(
      "Expense amount must be greater than zero"
    );

    expect(() =>
      useCase.execute(
        createExpenseInput({
          amountMinor: -1n,
        })
      )
    ).toThrow(
      "Expense amount must be greater than zero"
    );

    expect(
      repository.createExpense
    ).not.toHaveBeenCalled();
  });

  it("creates an income through the repository", async () => {
    const repository = createRepository();
    const useCase = new CreateIncome(repository);
    const input = createIncomeInput();

    const result =
      await useCase.execute(input);

    expect(
      repository.createIncome
    ).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({
      success: true,
      duplicated: false,
      income: {
        amountMinor: 100_000n,
      },
    });
  });

  it("creates a transfer through the repository", async () => {
    const repository = createRepository();
    const useCase = new CreateTransfer(repository);
    const input = createTransferInput();

    const result =
      await useCase.execute(input);

    expect(
      repository.createTransfer
    ).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({
      success: true,
      duplicated: false,
      transfer: {
        amountMinor: 25_000n,
        fromBalanceAfterMinor: 75_000n,
        toBalanceAfterMinor: 125_000n,
      },
    });
  });

  it("lists transaction history through the repository", async () => {
    const repository = createRepository();
    const useCase =
      new ListTransactions(repository);
    const filters: TransactionHistoryFilters = {
      userId: "user-1",
      type: "EXPENSE",
      limit: 20,
    };

    await expect(
      useCase.execute(filters)
    ).resolves.toEqual({
      items: [],
      hasMore: false,
    });

    expect(
      repository.listHistory
    ).toHaveBeenCalledWith(filters);
  });
});
