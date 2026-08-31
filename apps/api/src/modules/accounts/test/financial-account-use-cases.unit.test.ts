import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ArchiveFinancialAccount,
} from "../application/archive-financial-account.js";
import {
  CreateFinancialAccount,
} from "../application/create-financial-account.js";
import {
  GetFinancialAccount,
} from "../application/get-financial-account.js";
import {
  ListFinancialAccounts,
} from "../application/list-financial-accounts.js";
import {
  UpdateFinancialAccount,
} from "../application/update-financial-account.js";

import type {
  CreateFinancialAccountInput,
  FinancialAccount,
  UpdateFinancialAccountInput,
} from "../domain/financial-account.js";
import type {
  FinancialAccountRepository,
} from "../domain/financial-account.repository.js";

describe("financial account use cases", () => {
  const now =
    new Date("2026-01-15T10:00:00.000Z");

  function createAccount(
    overrides: Partial<FinancialAccount> = {}
  ): FinancialAccount {
    return {
      id: "account-1",
      userId: "user-1",
      name: "Cash",
      type: "CASH",
      institutionName: null,
      currencyCode: "MGA",
      initialBalanceMinor: 10_000n,
      cachedBalanceMinor: 10_000n,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  function createRepository(
    account = createAccount()
  ): FinancialAccountRepository {
    return {
      create: vi.fn(
        async (input: CreateFinancialAccountInput) =>
          createAccount(input)
      ),
      findAllByUserId: vi.fn(async () => [
        account,
      ]),
      findByIdAndUserId: vi.fn(
        async () => account
      ),
      update: vi.fn(
        async (
          _id: string,
          _userId: string,
          input: UpdateFinancialAccountInput
        ) =>
          createAccount({
            ...account,
            ...input,
          })
      ),
      archive: vi.fn(async () => true),
    };
  }

  it("creates an account through the repository", async () => {
    const repository = createRepository();
    const useCase =
      new CreateFinancialAccount(repository);
    const input: CreateFinancialAccountInput = {
      userId: "user-1",
      name: "Main bank",
      type: "BANK",
      institutionName: "BNI",
      currencyCode: "MGA",
      initialBalanceMinor: 50_000n,
    };

    const result =
      await useCase.execute(input);

    expect(repository.create).toHaveBeenCalledWith(
      input
    );
    expect(result).toMatchObject(input);
  });

  it("lists user accounts through the repository", async () => {
    const account = createAccount();
    const repository =
      createRepository(account);
    const useCase =
      new ListFinancialAccounts(repository);

    await expect(
      useCase.execute("user-1")
    ).resolves.toEqual([account]);

    expect(
      repository.findAllByUserId
    ).toHaveBeenCalledWith("user-1");
  });

  it("gets a user account by id through the repository", async () => {
    const account = createAccount({
      id: "account-2",
    });
    const repository =
      createRepository(account);
    const useCase =
      new GetFinancialAccount(repository);

    await expect(
      useCase.execute("account-2", "user-1")
    ).resolves.toEqual(account);

    expect(
      repository.findByIdAndUserId
    ).toHaveBeenCalledWith(
      "account-2",
      "user-1"
    );
  });

  it("updates an account through the repository", async () => {
    const repository = createRepository();
    const useCase =
      new UpdateFinancialAccount(repository);
    const input: UpdateFinancialAccountInput = {
      name: "Updated cash",
      institutionName: null,
    };

    const result = await useCase.execute(
      "account-1",
      "user-1",
      input
    );

    expect(repository.update).toHaveBeenCalledWith(
      "account-1",
      "user-1",
      input
    );
    expect(result).toMatchObject(input);
  });

  it("archives an account through the repository", async () => {
    const repository = createRepository();
    const useCase =
      new ArchiveFinancialAccount(repository);

    await expect(
      useCase.execute("account-1", "user-1")
    ).resolves.toBe(true);

    expect(repository.archive).toHaveBeenCalledWith(
      "account-1",
      "user-1"
    );
  });
});
