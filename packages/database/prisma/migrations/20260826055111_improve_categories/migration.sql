/*
  Warnings:

  - A unique constraint covering the columns `[system_key]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "system_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_system_key_key" ON "categories"("system_key");

-- CreateIndex
CREATE INDEX "categories_type_is_system_is_archived_idx" ON "categories"("type", "is_system", "is_archived");
