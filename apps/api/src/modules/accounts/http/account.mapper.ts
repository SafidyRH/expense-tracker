import type {
  FinancialAccount,
} from "../domain/financial-account.js";

export function toFinancialAccountDto(
  account: FinancialAccount
) {
  return {
    id: account.id,

    name: account.name,

    type: account.type,

    institutionName:
      account.institutionName,

    currencyCode:
      account.currencyCode,

    initialBalanceMinor:
      account.initialBalanceMinor.toString(),

    balanceMinor:
      account.cachedBalanceMinor.toString(),

    isArchived:
      account.isArchived,

    createdAt:
      account.createdAt.toISOString(),

    updatedAt:
      account.updatedAt.toISOString(),
  };
}