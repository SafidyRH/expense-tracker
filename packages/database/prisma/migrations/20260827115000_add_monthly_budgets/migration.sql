-- CreateTable
CREATE TABLE "monthly_global_budgets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month" DATE NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency_code" VARCHAR(3) NOT NULL DEFAULT 'MGA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_global_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_category_budgets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "month" DATE NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency_code" VARCHAR(3) NOT NULL DEFAULT 'MGA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_category_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_global_budgets_user_id_month_key" ON "monthly_global_budgets"("user_id", "month");

-- CreateIndex
CREATE INDEX "monthly_global_budgets_user_id_month_idx" ON "monthly_global_budgets"("user_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_category_budgets_user_id_month_category_id_key" ON "monthly_category_budgets"("user_id", "month", "category_id");

-- CreateIndex
CREATE INDEX "monthly_category_budgets_user_id_month_idx" ON "monthly_category_budgets"("user_id", "month");

-- CreateIndex
CREATE INDEX "monthly_category_budgets_category_id_idx" ON "monthly_category_budgets"("category_id");

-- AddForeignKey
ALTER TABLE "monthly_global_budgets" ADD CONSTRAINT "monthly_global_budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_category_budgets" ADD CONSTRAINT "monthly_category_budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_category_budgets" ADD CONSTRAINT "monthly_category_budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
