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
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-200",
            isCollapsed && "justify-center"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-semibold text-foreground">Vyntra</h1>
                <p className="text-xs text-muted-foreground">Gov Platform</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "group relative h-10 w-full rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                      )}
                    >
                      <NavLink to={item.url}>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <item.icon className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <span className="font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {subscriptionPlan === 'free' && !isCollapsed && (
          <div className="mb-4 p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-700">Plan Gratuito</span>
            </div>
            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs" asChild>
              <NavLink to="/suscripcion">
                Mejorar Plan
              </NavLink>
            </Button>
          </div>
        )}

        <div className={cn(
          "flex items-center justify-between gap-2",
          isCollapsed && "flex-col justify-center"
        )}>
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                  {user?.email?.split('@')[0] || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user?.email || "usuario@vyntra.gov"}
                </p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Cerrar Sessión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
