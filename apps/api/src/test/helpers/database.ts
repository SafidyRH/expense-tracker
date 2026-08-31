import {
  prisma,
} from "@expense-tracker/database";

export async function resetDatabase() {
  await prisma.$transaction([
    prisma.transactionAllocation.deleteMany(),

    prisma.transactionEntry.deleteMany(),

    prisma.transaction.deleteMany(),

    prisma.category.deleteMany(),

    prisma.financialAccount.deleteMany(),

    prisma.session.deleteMany(),

    prisma.account.deleteMany(),

    prisma.verification.deleteMany(),

    prisma.user.deleteMany(),
  ]);
}