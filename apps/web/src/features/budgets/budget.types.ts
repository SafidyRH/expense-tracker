export interface BudgetProgress {
  id: string | null;

  amountMinor: string;
  spentMinor: string;
  remainingMinor: string;

  percentConsumed: number;

  currencyCode: string;
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

  categories: CategoryBudgetProgress[];
}

export interface BudgetOverviewResponse {
  data: BudgetOverview;
}

export interface UpsertBudgetInput {
  month: string;
  amountMinor: string;
  currencyCode?: string;
}
