import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
  subtitle: string;
};

export function AuthPageShell({ children, subtitle }: AuthPageShellProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-app-background px-5 py-10 text-foreground">
      <div className="w-full max-w-[390px] space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-app-muted">
            Expense Tracker
          </p>
          <p className="text-sm text-app-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
