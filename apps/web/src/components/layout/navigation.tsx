import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bot,
  Box,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  WalletCards,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Tableaux de bord",
    items: [
      {
        label: "Bilan",
        href: "/dashboard",
        icon: <LayoutDashboard className="size-5" />,
      },
      {
        label: "Transactions",
        href: "/transactions",
        icon: <ArrowLeftRight className="size-5" />,
      },
      {
        label: "Calendrier",
        href: "/calendar",
        icon: <CalendarDays className="size-5" />,
      },
      {
        label: "Chronologie",
        href: "/timeline",
        icon: <Clock3 className="size-5" />,
      },
    ],
  },

  {
    label: "Comptes",
    items: [
      {
        label: "Comptes",
        href: "/accounts",
        icon: <Landmark className="size-5" />,
      },
      {
        label: "Budget",
        href: "/budgets",
        icon: <PiggyBank className="size-5" />,
      },
      {
        label: "Revenus",
        href: "/income",
        icon: <ArrowDownLeft className="size-5" />,
      },
      {
        label: "Dépenses",
        href: "/expenses",
        icon: <ArrowUpRight className="size-5" />,
      },
      {
        label: "Inventaire",
        href: "/inventory",
        icon: <Box className="size-5" />,
      },
    ],
  },

  {
    label: "Planification",
    items: [
      {
        label: "Dettes",
        href: "/debts",
        icon: <WalletCards className="size-5" />,
      },
      {
        label: "Fonds",
        href: "/funds",
        icon: <PiggyBank className="size-5" />,
      },
      {
        label: "Rapports",
        href: "/reports",
        icon: <ChartNoAxesColumnIncreasing className="size-5" />,
      },
    ],
  },

  {
    label: "Outils et Paramètres",
    items: [
      {
        label: "Assistant",
        href: "/assistant",
        icon: <Bot className="size-5" />,
      },
    ],
  },
];
