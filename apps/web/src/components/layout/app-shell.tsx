import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileNavigation } from "./mobile-navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#d8d6d2] text-neutral-950">
      <div className="mx-auto min-h-screen w-full max-w-[469px] bg-[#f3f1ed] lg:flex lg:max-w-[1180px] lg:bg-[#e6e2dc]">
        <AppSidebar />

        <div className="relative min-h-screen flex-1 bg-[#f3f1ed] lg:my-5 lg:mr-5 lg:min-h-[calc(100vh-40px)] lg:rounded-[30px] lg:shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
          <AppHeader />

          <div className="px-[22px] pb-36 lg:px-8 lg:pb-10">{children}</div>

          <MobileNavigation />
        </div>
      </div>
    </div>
  );
}
