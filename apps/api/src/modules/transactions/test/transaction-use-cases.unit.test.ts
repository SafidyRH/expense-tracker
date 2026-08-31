import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  CreateExpense,
} from "../application/create-expense.js";
import {
  CreateIncome,
} from "../application/create-income.js";
import {
  CreateTransfer,
} from "../application/create-transfer.js";
import {
  ListTransactions,
} from "../application/list-transactions.js";

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

  it("rejects expenses with a zero or negative amount", () => {
    const repository = createRepository();
    const useCase =
      new CreateExpense(repository);

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

  it("rejects incomes with a zero or negative amount", () => {
    const repository = createRepository();
    const useCase =
      new CreateIncome(repository);

    expect(() =>
      useCase.execute(
        createIncomeInput({
          amountMinor: 0n,
        })
      )
    ).toThrow(
      "Income amount must be greater than zero"
    );

    expect(() =>
      useCase.execute(
        createIncomeInput({
          amountMinor: -1n,
        })
      )
    ).toThrow(
      "Income amount must be greater than zero"
    );

    expect(
      repository.createIncome
    ).not.toHaveBeenCalled();
  });

  it("rejects transfers with the same source and destination", () => {
    const repository = createRepository();
    const useCase =
      new CreateTransfer(repository);

    expect(() =>
      useCase.execute(
        createTransferInput({
          fromAccountId: "account-1",
          toAccountId: "account-1",
        })
      )
    ).toThrow(
      "Transfer accounts must be different"
    );

    expect(
      repository.createTransfer
    ).not.toHaveBeenCalled();
  });

  it("creates valid transactions through the repository", async () => {
    const repository = createRepository();

    await expect(
      new CreateExpense(repository).execute(
        createExpenseInput()
      )
    ).resolves.toMatchObject({
      success: true,
      expense: {
        amountMinor: 12_500n,
      },
    });

    await expect(
      new CreateIncome(repository).execute(
        createIncomeInput()
      )
    ).resolves.toMatchObject({
      success: true,
      income: {
        amountMinor: 100_000n,
      },
    });

    await expect(
      new CreateTransfer(repository).execute(
        createTransferInput()
      )
    ).resolves.toMatchObject({
      success: true,
      transfer: {
        amountMinor: 25_000n,
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
