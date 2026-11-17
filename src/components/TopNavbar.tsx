import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Settings, 
  Zap, 
  LogOut,
  Menu,
  X,
  UserCircle,
  HelpCircle,
  Moon,
  LifeBuoy,
  Hexagon
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useVyntra } from "@/context/VyntraContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Radar MP", url: "/oportunidades", icon: FileText },
  { title: "Postulaciones", url: "/postulaciones", icon: FolderOpen },
  { title: "Agenda", url: "/agenda", icon: Zap },
];

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { subscriptionPlan } = useVyntra();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Perfil B2B Dinámico
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || '');
      
      const { data: pData } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
      if (pData?.avatar_url) {
         setAvatarUrl(pData.avatar_url);
      }
    };
    fetchProfileData();
  }, []);

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
        
        {/* Brand Lockup Premium */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex h-10 w-10 items-center justify-center transition-transform hover:scale-105 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <img src="/vyntra-logo.png" alt="Vyntra Logo" className="h-full w-full object-contain" />
          </div>
          <div className="hidden sm:flex flex-col justify-center">
            <span className="font-black text-xl tracking-tight text-white leading-none hover:text-indigo-400 transition-colors">Vyntra</span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400/80 font-bold leading-none mt-1">Licitaciones M. Público</span>
          </div>
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
          {/* Opciones Avanzadas (Hamburguesa de escritorio) */}
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 uppercase font-bold text-[10px] tracking-wider px-2 py-0.5 shadow-inner">
              {subscriptionPlan}
            </Badge>

            {/* Hub de Herramientas y Ajustes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-9 w-9 data-[state=open]:bg-white/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 border-white/10 bg-[#090b14]/95 backdrop-blur-xl shadow-2xl rounded-xl" align="end">
                <DropdownMenuLabel className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Configuraciones</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/suscripcion')} className="cursor-pointer gap-2 focus:bg-white/10 text-slate-300 focus:text-white">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Plan Empresa & Facturación</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/configuracion')} className="cursor-pointer gap-2 focus:bg-white/10 text-slate-300 focus:text-white">
                    <Settings className="h-4 w-4" />
                    <span>Mis Preferencias / RUT</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-white/10 text-slate-300 focus:text-white">
                    <Moon className="h-4 w-4" />
                    <span>Tema visual (Oscuro)</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = 'mailto:soporte@vyntra.cl?subject=Soporte Técnico - Vyntra B2B'} className="cursor-pointer gap-2 focus:bg-white/10 text-slate-300 focus:text-white">
                    <LifeBuoy className="h-4 w-4" />
                    <span>Servicio Técnico</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/faq')} className="cursor-pointer gap-2 focus:bg-white/10 text-slate-300 focus:text-white">
                    <HelpCircle className="h-4 w-4" />
                    <span>Preguntas Frecuentes</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menú de Perfil / Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-colors bg-white/5">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl || ""} alt="Avatar Corporativo" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-800 text-white font-bold tracking-widest text-xs">VY</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 border-white/10 bg-[#090b14]/95 backdrop-blur-xl shadow-2xl rounded-xl" align="end">
                <div className="flex items-center justify-start gap-3 p-2">
                  <Avatar className="h-10 w-10 border border-white/10 bg-white/5">
                    <AvatarImage src={avatarUrl || ""} alt="Avatar" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-800 text-white font-bold tracking-widest">VY</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm text-white">Mi Perfil</p>
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{userEmail || 'admin@vyntra.cl'}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => navigate('/configuracion')} className="cursor-pointer gap-2 focus:bg-white/10 text-slate-300 focus:text-white">
                  <UserCircle className="h-4 w-4" />
                  <span>Configurar Perfil Comercial</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 focus:bg-red-500/20 text-red-400 focus:text-red-300 mt-1">
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión segura</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <NavLink
            to="/configuracion"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              location.pathname.startsWith("/configuracion")
                ? "bg-indigo-600 text-white font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <UserCircle className="h-5 w-5" />
            Configuración
          </NavLink>
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
