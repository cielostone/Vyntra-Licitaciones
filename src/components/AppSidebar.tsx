import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  ChevronLeft,
  Zap,
  LogOut
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useVyntra } from "@/context/VyntraContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard
  },
  {
    title: "Oportunidades",
    url: "/oportunidades",
    icon: FileText
  },
  {
    title: "Mis Postulaciones",
    url: "/postulaciones",
    icon: FolderOpen
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings
  },
  {
    title: "Planes",
    url: "/suscripcion",
    icon: Zap
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, state } = useSidebar();
  const { subscriptionPlan } = useVyntra();
  const { user, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada correctamente");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-indigo-500/10 bg-[#0c0e1a] shadow-2xl shadow-black/50"
    >
      <SidebarHeader className="border-b border-white/5 px-4 py-5 bg-[#0c0e1a]">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isCollapsed && "justify-center"
          )}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="text-xl font-black text-white tracking-tight">Vyntra</h1>
                <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">Gov Platform</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 bg-[#0c0e1a]">
        <SidebarGroup>
          <div className="mb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {!isCollapsed && "Navegación Principal"}
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "group relative h-11 w-full rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-indigo-500/15 text-indigo-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-indigo-500/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                      )}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3">
                        {isActive && (
                          <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                        )}
                        <item.icon className={cn(
                          "h-5 w-5 transition-all duration-300",
                          isActive ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-slate-500 group-hover:text-slate-300"
                        )} />
                        <span className={cn("font-medium text-sm", isActive && "font-semibold text-white")}>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 p-4 bg-[#0c0e1a] backdrop-blur-md">
        {subscriptionPlan === 'free' && !isCollapsed && (
          <div className="mb-5 p-4 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 rounded-xl border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Plan Inicial</span>
            </div>
            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] text-white h-9 text-xs font-semibold transition-all relative z-10" asChild>
              <NavLink to="/suscripcion">
                Mejorar a Pro
              </NavLink>
            </Button>
          </div>
        )}

        <div className={cn(
          "flex items-center justify-between gap-2 p-2 rounded-xl border border-white/5 bg-white/5 transition-all",
          isCollapsed ? "flex-col justify-center py-3" : "px-3"
        )}>
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
              <span className="text-xs font-bold text-slate-300">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-bottom-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate max-w-[110px]">
                  {user?.email?.split('@')[0] || "Usuario"}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 truncate max-w-[110px]">
                  Administrador
                </p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
