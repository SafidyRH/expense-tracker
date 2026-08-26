import type {
  FinancialAccountType,
} from "./account.types";

export function getAccountTypeLabel(
  type: FinancialAccountType
) {
  switch (type) {
    case "CASH":
      return "Espèces";

    case "BANK":
      return "Banque";

    case "MOBILE_MONEY":
      return "Mobile Money";

    case "E_WALLET":
      return "Portefeuille électronique";

    case "CREDIT_CARD":
      return "Carte de crédit";

    case "OTHER":
      return "Autre";
  }
}