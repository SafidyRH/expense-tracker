import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bot,
  Box,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CircleGauge,
  Clock3,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  WalletCards,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Tableaux de bord",
    items: [
      {
        label: "Bilan",
        href: "/dashboard",
        icon: <LayoutDashboard className="size-[18px]" />,
      },
      {
        label: "Transactions",
        href: "/transactions",
        icon: <ArrowLeftRight className="size-[18px]" />,
      },
      {
        label: "Calendrier",
        href: "/calendar",
        icon: <CalendarDays className="size-[18px]" />,
      },
      {
        label: "Chronologie",
        href: "/timeline",
        icon: <Clock3 className="size-[18px]" />,
      },
    ],
  },

  {
    label: "Comptes",
    items: [
      {
        label: "Comptes",
        href: "/accounts",
        icon: <Landmark className="size-[18px]" />,
      },
      {
        label: "Budget",
        href: "/budgets",
        icon: <PiggyBank className="size-[18px]" />,
      },
      {
        label: "Revenus",
        href: "/income",
        icon: <ArrowDownLeft className="size-[18px]" />,
      },
      {
        label: "Dépenses",
        href: "/expenses",
        icon: <ArrowUpRight className="size-[18px]" />,
      },
      {
        label: "Inventaire",
        href: "/inventory",
        icon: <Box className="size-[18px]" />,
      },
    ],
  },

  {
    label: "Planification",
    items: [
      {
        label: "Dettes",
        href: "/debts",
        icon: <WalletCards className="size-[18px]" />,
      },
      {
        label: "Fonds",
        href: "/funds",
        icon: <PiggyBank className="size-[18px]" />,
      },
      {
        label: "Impôts",
        href: "/taxes",
        icon: <CircleGauge className="size-[18px]" />,
      },
      {
        label: "Rapports",
        href: "/reports",
        icon: <ChartNoAxesColumnIncreasing className="size-[18px]" />,
      },
    ],
  },

  {
    label: "Outils et Paramètres",
    items: [
      {
        label: "Assistant",
        href: "/assistant",
        icon: <Bot className="size-[18px]" />,
      },
    ],
  },
];
