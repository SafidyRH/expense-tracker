import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  prisma,
} from "@expense-tracker/database";

import app from "../../app";

import {
  resetDatabase,
} from "../helpers/database";

import {
  registerTestUser,
} from "../helpers/auth";

describe(
  "Expense integration",
  () => {
    beforeEach(
      async () => {
        await resetDatabase();
      }
    );

    it(
      "creates an expense and updates the account balance",
      async () => {
        // =====================================
        // 1. USER
        // =====================================

        const {
          cookie,
          user,
        } =
          await registerTestUser();

        expect(user.id)
          .toBeDefined();

        // =====================================
        // 2. CREATE ACCOUNT
        // =====================================

        const accountResponse =
          await app.request(
            "http://localhost:3030/api/accounts",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Cookie:
                  cookie,
              },

              body: JSON.stringify({
                name:
                  "MVola Test",

                type:
                  "MOBILE_MONEY",

                institutionName:
                  "Telma",

                currencyCode:
                  "MGA",

                initialBalanceMinor:
                  "100000",
              }),
            }
          );

        expect(
          accountResponse.status
        ).toBe(201);

        const accountBody =
          (await accountResponse.json()) as {
            data: {
              id: string;
              balanceMinor: string;
            };
          };

        expect(
          accountBody.data
            .balanceMinor
        ).toBe("100000");

        // =====================================
        // 3. CREATE CATEGORY
        // =====================================

        const categoryResponse =
          await app.request(
            "http://localhost:3030/api/categories",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Cookie:
                  cookie,
              },

              body: JSON.stringify({
                name:
                  "Restaurant",

                type:
                  "EXPENSE",

                icon:
                  "utensils",
              }),
            }
          );

        expect(
          categoryResponse.status
        ).toBe(201);

        const categoryBody =
          (await categoryResponse.json()) as {
            data: {
              id: string;
            };
          };

        // =====================================
        // 4. CREATE EXPENSE
        // =====================================

        const clientGeneratedId =
          crypto.randomUUID();

        const expenseResponse =
          await app.request(
            "http://localhost:3030/api/transactions/expenses",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Cookie:
                  cookie,
              },

              body: JSON.stringify({
                accountId:
                  accountBody.data.id,

                categoryId:
                  categoryBody.data.id,

                amountMinor:
                  "25000",

                description:
                  "Déjeuner",

                clientGeneratedId,
              }),
            }
          );

        expect(
          expenseResponse.status
        ).toBe(201);

        const expenseBody =
          (await expenseResponse.json()) as {
            data: {
              id: string;
              amountMinor: string;
              balanceAfterMinor: string;
            };

            meta: {
              duplicated: boolean;
            };
          };

        expect(
          expenseBody.data
            .amountMinor
        ).toBe("25000");

        expect(
          expenseBody.data
            .balanceAfterMinor
        ).toBe("75000");

        expect(
          expenseBody.meta
            .duplicated
        ).toBe(false);

        // =====================================
        // 5. VERIFY DATABASE
        // =====================================

        const transaction =
          await prisma.transaction.findUnique({
            where: {
              id:
                expenseBody.data.id,
            },

            include: {
              entries: true,
              allocations: true,
            },
          });

        expect(
          transaction
        ).not.toBeNull();

        expect(
          transaction?.type
        ).toBe("EXPENSE");

        expect(
          transaction?.description
        ).toBe("Déjeuner");

        expect(
          transaction?.entries
        ).toHaveLength(1);

        expect(
          transaction
            ?.entries[0]
            ?.amountMinor
        ).toBe(-25_000n);

        expect(
          transaction?.allocations
        ).toHaveLength(1);

        expect(
          transaction
            ?.allocations[0]
            ?.amountMinor
        ).toBe(25_000n);

        // =====================================
        // 6. VERIFY ACCOUNT BALANCE
        // =====================================

        const account =
          await prisma.financialAccount.findUnique({
            where: {
              id:
                accountBody.data.id,
            },
          });

        expect(
          account
            ?.cachedBalanceMinor
        ).toBe(75_000n);
      }
    );

    it(
  "does not create the same expense twice",
  async () => {
    const {
      cookie,
    } =
      await registerTestUser();

    const accountResponse =
      await app.request(
        "http://localhost:3030/api/accounts",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Cookie:
              cookie,
          },

          body: JSON.stringify({
            name:
              "MVola",

            type:
              "MOBILE_MONEY",

            currencyCode:
              "MGA",

            initialBalanceMinor:
              "100000",
          }),
        }
      );

    const account =
      (await accountResponse.json()) as {
        data: {
          id: string;
        };
      };

    const categoryResponse =
      await app.request(
        "http://localhost:3030/api/categories",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Cookie:
              cookie,
          },

          body: JSON.stringify({
            name:
              "Restaurant",

            type:
              "EXPENSE",
          }),
        }
      );

    const category =
      (await categoryResponse.json()) as {
        data: {
          id: string;
        };
      };

    const clientGeneratedId =
      crypto.randomUUID();

    const payload = {
      accountId:
        account.data.id,

      categoryId:
        category.data.id,

      amountMinor:
        "25000",

      description:
        "Déjeuner",

      clientGeneratedId,
    };

    const first =
      await app.request(
        "http://localhost:3030/api/transactions/expenses",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Cookie:
              cookie,
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    expect(
      first.status
    ).toBe(201);

    const second =
      await app.request(
        "http://localhost:3030/api/transactions/expenses",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Cookie:
              cookie,
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    expect(
      second.status
    ).toBe(200);

    const secondBody =
      (await second.json()) as {
        meta: {
          duplicated: boolean;
        };
      };

    expect(
      secondBody.meta
        .duplicated
    ).toBe(true);

    const dbAccount =
      await prisma.financialAccount.findUnique({
        where: {
          id:
            account.data.id,
        },
      });

    expect(
      dbAccount
        ?.cachedBalanceMinor
    ).toBe(75_000n);

    const transactionCount =
      await prisma.transaction.count();

    expect(
      transactionCount
    ).toBe(1);
  }
);
  }
);

