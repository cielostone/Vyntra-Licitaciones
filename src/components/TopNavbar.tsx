import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Settings, 
  Zap, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useVyntra } from "@/context/VyntraContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Oportunidades", url: "/oportunidades", icon: FileText },
  { title: "Postulaciones", url: "/postulaciones", icon: FolderOpen },
  { title: "Suscripción", url: "/suscripcion", icon: Zap },
  { title: "Ajustes", url: "/configuracion", icon: Settings },
];

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { subscriptionPlan } = useVyntra();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[#090b14]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 xl:px-8">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-transform hover:scale-110">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-white hidden sm:block hover:text-indigo-400 transition-colors">Vyntra</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-white-5 px-3 py-1.5 rounded-full border border-white/5 shadow-inner backdrop-blur-3xl bg-[#0f1225]/40">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
            const Icon = item.icon;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-300",
                  isActive 
                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20 scale-105" 
                    : "text-slate-400 font-medium hover:text-white hover:bg-white/10 hover:shadow-sm"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 uppercase font-bold text-[10px] tracking-wider px-2 py-0.5 shadow-inner">
              PRO
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full h-8 w-8 transition-colors">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-white/10 bg-[#090b14]/95 backdrop-blur-2xl lg:hidden flex flex-col p-4 gap-2 animate-in slide-in-from-top-2 shadow-2xl">
           {menuItems.map((item) => {
            const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
            const Icon = item.icon;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-indigo-600 text-white font-bold" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500")} />
                {item.title}
              </NavLink>
            );
          })}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between px-4">
             <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 uppercase">
              Plan {subscriptionPlan}
            </Badge>
             <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 font-semibold">
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
