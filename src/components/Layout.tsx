import { TopNavbar } from "@/components/TopNavbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#090b14] flex flex-col items-center">
      <TopNavbar />
      
      {/* Fondo Global Premium Fijo (No scrollea con el contenido) */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none z-0" />

      {/* Contenedor Principal. pt-16 empuja hacia abajo para respetar el TopNavbar fijo */}
      <main className="flex-1 w-full relative pt-16 z-10 2xl:max-w-screen-2xl">
        <div className="animate-in fade-in duration-500 h-full">
            {children}
        </div>
      </main>
    </div>
  );
}
