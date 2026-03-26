import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#090b14]">
        <AppSidebar />
        <main className="flex-1 overflow-auto relative flex flex-col">
          {/* Header Mobile Oculto en PC */}
          <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#090b14]/80 backdrop-blur-md px-4 md:hidden shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-400 hover:text-white transition-colors">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Vyntra Gov</span>
            </div>
          </div>
          
          {/* Fondo Global Premium */}
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

          {/* Contenedor Principal */}
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
