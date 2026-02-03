import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-background/80 backdrop-blur-sm px-4 md:hidden">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <span className="ml-3 font-semibold">Vyntra Gov</span>
          </div>
          <div className="gradient-glow absolute inset-x-0 top-0 h-96 pointer-events-none" />
          <div className="relative">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
