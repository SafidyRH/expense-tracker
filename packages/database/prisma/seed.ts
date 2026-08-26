import "dotenv/config";

import { prisma } from "../src/index";

const categories = [
  // =========================
  // EXPENSE
  // =========================

  {
    systemKey: "EXPENSE_FOOD",
    name: "Alimentation",
    type: "EXPENSE" as const,
    icon: "utensils",
    sortOrder: 10,
  },
  {
    systemKey: "EXPENSE_TRANSPORT",
    name: "Transport",
    type: "EXPENSE" as const,
    icon: "car",
    sortOrder: 20,
  },
  {
    systemKey: "EXPENSE_HOUSING",
    name: "Logement",
    type: "EXPENSE" as const,
    icon: "house",
    sortOrder: 30,
  },
  {
    systemKey: "EXPENSE_HEALTH",
    name: "Santé",
    type: "EXPENSE" as const,
    icon: "heart-pulse",
    sortOrder: 40,
  },
  {
    systemKey: "EXPENSE_SHOPPING",
    name: "Shopping",
    type: "EXPENSE" as const,
    icon: "shopping-bag",
    sortOrder: 50,
  },
  {
    systemKey: "EXPENSE_LEISURE",
    name: "Loisirs",
    type: "EXPENSE" as const,
    icon: "gamepad-2",
    sortOrder: 60,
  },
  {
    systemKey: "EXPENSE_TELECOM",
    name: "Télécommunication",
    type: "EXPENSE" as const,
    icon: "smartphone",
    sortOrder: 70,
  },
  {
    systemKey: "EXPENSE_SUBSCRIPTIONS",
    name: "Abonnements",
    type: "EXPENSE" as const,
    icon: "repeat",
    sortOrder: 80,
  },
  {
    systemKey: "EXPENSE_FAMILY",
    name: "Famille",
    type: "EXPENSE" as const,
    icon: "users",
    sortOrder: 90,
  },
  {
    systemKey: "EXPENSE_OTHER",
    name: "Autres",
    type: "EXPENSE" as const,
    icon: "circle-ellipsis",
    sortOrder: 999,
  },

  // =========================
  // INCOME
  // =========================

  {
    systemKey: "INCOME_SALARY",
    name: "Salaire",
    type: "INCOME" as const,
    icon: "briefcase-business",
    sortOrder: 10,
  },
  {
    systemKey: "INCOME_FREELANCE",
    name: "Freelance",
    type: "INCOME" as const,
    icon: "laptop",
    sortOrder: 20,
  },
  {
    systemKey: "INCOME_SALE",
    name: "Vente",
    type: "INCOME" as const,
    icon: "badge-dollar-sign",
    sortOrder: 30,
  },
  {
    systemKey: "INCOME_GIFT",
    name: "Cadeau",
    type: "INCOME" as const,
    icon: "gift",
    sortOrder: 40,
  },
  {
    systemKey: "INCOME_OTHER",
    name: "Autres",
    type: "INCOME" as const,
    icon: "circle-ellipsis",
    sortOrder: 999,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        systemKey: category.systemKey,
      },

      update: {
        name: category.name,
        type: category.type,
        icon: category.icon,
        sortOrder: category.sortOrder,
        isSystem: true,
        isArchived: false,
        userId: null,
      },

      create: {
        ...category,

        isSystem: true,
        isArchived: false,
        userId: null,
      },
    });
  }

  console.log(
    `Seed completed: ${categories.length} system categories`
  );
}

main()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });