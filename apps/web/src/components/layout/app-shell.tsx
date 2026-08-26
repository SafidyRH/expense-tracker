import { AppHeader } from "./app-header";
import { MobileNavigation } from "./mobile-navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#d8d6d2] text-neutral-950">
      <div className="relative mx-auto min-h-screen w-full max-w-[460px] bg-[#f3f1ed]">
        <AppHeader />

        <div className="px-5 pb-36">{children}</div>

        <MobileNavigation />
      </div>
    </div>
  );
}
