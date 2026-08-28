export interface BudgetProgress {
  id: string | null;

  amountMinor: string;
  spentMinor: string;
  remainingMinor: string;

  percentConsumed: number;

  alert: BudgetAlert | null;

  currencyCode: string;
}

export interface BudgetAlert {
  level:
    | "FIFTY_PERCENT"
    | "EIGHTY_PERCENT"
    | "HUNDRED_PERCENT"
    | "OVER_BUDGET";

  threshold: 50 | 80 | 100;

  severity:
    | "info"
    | "warning"
    | "danger"
    | "critical";

  label: string;
}

export interface CategoryBudgetProgress
  extends BudgetProgress {
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
}

export interface BudgetOverview {
  month: string;

  global: BudgetProgress;

  allocation: BudgetAllocation;

  categories: CategoryBudgetProgress[];
}

export interface BudgetAllocation {
  allocatedCategoryAmountMinor: string;

  spentInCategoryBudgetsMinor: string;

  spentOutsideCategoryBudgetsMinor: string;

  unallocated: BudgetProgress;
}

export interface BudgetOverviewResponse {
  data: BudgetOverview;
}

export interface UpsertBudgetInput {
  month: string;
  amountMinor: string;
  currencyCode?: string;
}
