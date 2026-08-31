import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  CreateExpense,
} from "./create-expense";

import type {
  TransactionRepository,
} from "../domain/transaction.repository";

import type {
  CreateExpenseInput,
  CreateExpenseResult,
} from "../domain/expense";
import { CreateIncomeInput, CreateIncomeResult } from "../domain/income";
import { CreateTransferInput, CreateTransferResult } from "../domain/transfer";

function createRepositoryMock() {
  const successResult: CreateExpenseResult = {
    success: true,

    duplicated: false,

    expense: {
      id: "transaction-id",

      accountId: "account-id",

      categoryId: "category-id",

      amountMinor: 25_000n,

      currencyCode: "MGA",

      description: "Déjeuner",

      note: null,

      occurredAt:
        new Date(
          "2026-08-31T10:00:00Z"
        ),

      clientGeneratedId:
        "11111111-1111-4111-8111-111111111111",

      balanceAfterMinor:
        75_000n,

      createdAt:
        new Date(
          "2026-08-31T10:00:00Z"
        ),
    },
  };

  const repository: TransactionRepository = {
      createExpense: vi.fn(
          async () => successResult
      ),

      listHistory: vi.fn(
          async () => ({
              items: [],
              hasMore: false,
          })
      ),
      createIncome: function (input: CreateIncomeInput): Promise<CreateIncomeResult> {
          throw new Error("Function not implemented.");
      },
      createTransfer: function (input: CreateTransferInput): Promise<CreateTransferResult> {
          throw new Error("Function not implemented.");
      }
  };

  return {
    repository,
    successResult,
  };
}

function createValidInput(): CreateExpenseInput {
  return {
    userId:
      "11111111-1111-4111-8111-111111111111",

    accountId:
      "22222222-2222-4222-8222-222222222222",

    categoryId:
      "33333333-3333-4333-8333-333333333333",

    amountMinor:
      25_000n,

    description:
      "Déjeuner",

    note: null,

    occurredAt:
      new Date(
        "2026-08-31T10:00:00Z"
      ),

    clientGeneratedId:
      "44444444-4444-4444-8444-444444444444",
  };
}

describe(
  "CreateExpense",
  () => {
    it(
      "creates an expense with valid input",
      async () => {
        const {
          repository,
          successResult,
        } =
          createRepositoryMock();

        const useCase =
          new CreateExpense(
            repository
          );

        const input =
          createValidInput();

        const result =
          await useCase.execute(
            input
          );

        expect(result).toEqual(
          successResult
        );

        expect(
          repository.createExpense
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          repository.createExpense
        ).toHaveBeenCalledWith(
          input
        );
      }
    );

    it(
      "rejects an amount equal to zero",
      () => {
        const {
          repository,
        } =
          createRepositoryMock();

        const useCase =
          new CreateExpense(
            repository
          );

        const input =
          createValidInput();

        input.amountMinor = 0n;

        expect(() =>
          useCase.execute(
            input
          )
        ).toThrow(
          "Expense amount must be greater than zero"
        );

        expect(
          repository.createExpense
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects a negative amount",
      () => {
        const {
          repository,
        } =
          createRepositoryMock();

        const useCase =
          new CreateExpense(
            repository
          );

        const input =
          createValidInput();

        input.amountMinor =
          -10_000n;

        expect(() =>
          useCase.execute(
            input
          )
        ).toThrow(
          "Expense amount must be greater than zero"
        );

        expect(
          repository.createExpense
        ).not.toHaveBeenCalled();
      }
    );
  }
);