import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Zap, Building2, User, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatRut, validateRut } from "@/lib/rut";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // Campos de registro
    const [fullName, setFullName] = useState("");
    const [rut, setRut] = useState("");
    const [personType, setPersonType] = useState<"natural" | "juridica">("juridica");
    const [companyName, setCompanyName] = useState("");
    const [companyRut, setCompanyRut] = useState("");
    const [phone, setPhone] = useState("+56 9 ");

    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // Si ya hay sesión activa → ir al dashboard
    useEffect(() => {
        if (!authLoading && user) {
            navigate("/", { replace: true });
        }
    }, [user, authLoading, navigate]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePasswordStrength = (password: string) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/.test(password);
    };

    const handleFullNameChange = (val: string) => {
        const clean = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');
        setFullName(clean);
    };

    const handleCompanyNameChange = (val: string) => {
        const clean = val.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s'.,&-]/g, '');
        setCompanyName(clean);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!validateEmail(email)) {
                toast.error("Por favor ingresa un correo electrónico válido.");
                setLoading(false);
                return;
            }

            if (isSignUp) {
                if (!validatePasswordStrength(password)) {
                    toast.error("La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números.");
                    setLoading(false);
                    return;
                }
                if (!validateRut(rut)) {
                    toast.error("El RUN ingresado no es válido.");
                    setLoading(false);
                    return;
                }
                if (personType === 'juridica' && !validateRut(companyRut)) {
                    toast.error("El RUT de la Empresa no es válido.");
                    setLoading(false);
                    return;
                }
                const phoneDigits = phone.slice(6).replace(/\D/g, '');
                if (phoneDigits.length !== 8) {
                    toast.error("El teléfono debe tener exactamente 8 números después del prefijo +56 9");
                    setLoading(false);
                    return;
                }

                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });

                if (authError) throw authError;

                if (authData.user) {
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: authData.user.id,
                        email,
                        full_name: fullName,
                        rut,
                        person_type: personType,
                        company_name: personType === 'juridica' ? companyName : null,
                        company_rut: personType === 'juridica' ? companyRut : null,
                        phone,
                    });
                    if (profileError) console.error('Error creando perfil:', profileError);
                }

                toast.success("¡Cuenta creada! Revisa tu correo para confirmar.");
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success("¡Bienvenido a Vyntra!");
                navigate("/");
            }
        } catch (error: any) {
            let msg = error.message || "Error inesperado";
            if (msg.includes("Invalid login credentials")) msg = "Correo o contraseña incorrectos.";
            if (msg.includes("Email not confirmed")) msg = "Confirma tu correo antes de ingresar.";
            if (msg.includes("User already registered")) msg = "Ya existe una cuenta con este correo.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (val: string) => {
        if (!val.startsWith("+56 9 ")) {
            if (val.startsWith("+56 9") || val === "+56 " || val === "+56" || val === "+" || val === "") {
                setPhone("+56 9 ");
                return;
            }
        }
        const digits = val.slice(6).replace(/\D/g, '').slice(0, 8);
        setPhone("+56 9 " + digits);
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            {/* Panel Izquierdo: Branding Premium */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-950 flex-col justify-between p-16">
                
                {/* Fondo animado 1 */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
                {/* Fondo animado 2 */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px] animate-pulse" style={{ animationDuration: '6s' }} />

                {/* Grid decorativo */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Header */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Zap className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">Vyntra</h1>
                        <p className="text-sm font-medium tracking-widest text-indigo-300/80 uppercase">Gov Platform</p>
                    </div>
                </div>

                {/* Contenido Central */}
                <div className="relative z-10 space-y-8 max-w-xl">
                    <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-md">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
                        Sistema de Licitaciones 2.0
                    </div>
                    
                    <h2 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                        Eleva tus ventas al <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                            sector público.
                        </span>
                    </h2>
                    <p className="text-slate-400 text-xl leading-relaxed font-light">
                        Inteligencia artificial que te conecta con las oportunidades correctas de Mercado Público antes que tu competencia.
                    </p>

                    {/* Stats Premium */}
                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/50 mt-8">
                        {[
                            { value: "4.151", label: "Licitaciones Activas" },
                            { value: "Rápido", label: "Filtro Inteligente" },
                            { value: "100%", label: "Seguridad RLS" },
                        ].map((stat) => (
                            <div key={stat.label} className="group relative">
                                <div className="absolute -inset-2 rounded-lg bg-white/5 opacity-0 transition-opacity group-hover:opacity-100 blur-sm" />
                                <div className="relative">
                                    <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-center justify-between text-slate-500 text-sm font-medium">
                    <p>© 2026 Vyntra Inc.</p>
                    <p>Integración oficial <span className="text-indigo-400/80">API Mercado Público</span></p>
                </div>
            </div>

            {/* Panel Derecho: Formulario Estilizado */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative bg-background/50">
                
                {/* Botón Volver (IsSignUp) - Posicionado arriba a la izquierda en mobile/tablet */}
                {isSignUp && (
                    <button
                        onClick={() => setIsSignUp(false)}
                        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Volver
                    </button>
                )}

                <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Header solo visible en móvil */}
                    <div className="flex items-center gap-3 lg:hidden justify-center mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                            <Zap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-black text-foreground tracking-tight">Vyntra</span>
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {isSignUp ? "Crear cuenta" : "Bienvenido de vuelta"}
                        </h2>
                        <p className="text-muted-foreground text-sm font-medium">
                            {isSignUp
                                ? "Ingresa tus datos corporativos para iniciar"
                                : "Ingresa tus credenciales para acceder a la plataforma"}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5 mt-8">
                        
                        <div className="space-y-2.5">
                            <Label htmlFor="email" className="text-sm font-semibold text-foreground/90">Correo electrónico corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nombre@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 px-4 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 transition-shadow"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-semibold text-foreground/90">Contraseña</Label>
                                {!isSignUp && (
                                    <a href="#" className="text-sm font-medium text-primary hover:underline">¿Olvidaste tu contraseña?</a>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder={isSignUp ? "Mín. 8 caracteres, mayúscula y número" : "••••••••"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-12 px-4 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 transition-shadow"
                            />
                        </div>

                        {/* REGISTRO - Animación al entrar */}
                        {isSignUp && (
                            <div className="pt-4 space-y-5 animate-in fade-in zoom-in-95 duration-400">
                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-border flex-1"></div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-background px-2">PERFIL COMERCIAL</span>
                                    <div className="h-px bg-border flex-1"></div>
                                </div>

                                <RadioGroup
                                    value={personType}
                                    onValueChange={(v: "natural" | "juridica") => setPersonType(v)}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <label htmlFor="juridica" className={`group relative flex items-center justify-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${personType === 'juridica' ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/30'}`}>
                                        <RadioGroupItem value="juridica" id="juridica" className="absolute right-3 top-3 opacity-0" />
                                        <div className="flex flex-col items-center gap-2">
                                            <Building2 className={`h-6 w-6 transition-colors ${personType === 'juridica' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                            <span className={`text-sm font-bold ${personType === 'juridica' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>Empresa</span>
                                        </div>
                                    </label>
                                    
                                    <label htmlFor="natural" className={`group relative flex items-center justify-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${personType === 'natural' ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/30'}`}>
                                        <RadioGroupItem value="natural" id="natural" className="absolute right-3 top-3 opacity-0" />
                                        <div className="flex flex-col items-center gap-2">
                                            <User className={`h-6 w-6 transition-colors ${personType === 'natural' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                            <span className={`text-sm font-bold ${personType === 'natural' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>Independiente</span>
                                        </div>
                                    </label>
                                </RadioGroup>

                                {personType === "juridica" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-foreground/80">Razón Social *</Label>
                                            <Input placeholder="Empresa SpA" value={companyName} onChange={(e) => handleCompanyNameChange(e.target.value)} required className="h-11 bg-muted/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-foreground/80">RUT Empresa *</Label>
                                            <Input placeholder="76543210-K" value={companyRut} onChange={(e) => setCompanyRut(formatRut(e.target.value))} required className="h-11 bg-muted/20" />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-foreground/80">{personType === "juridica" ? "Representante *" : "Nombre *"}</Label>
                                        <Input placeholder="Juan Pérez" value={fullName} onChange={(e) => handleFullNameChange(e.target.value)} required className="h-11 bg-muted/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-foreground/80">{personType === "juridica" ? "RUN Representante *" : "RUT Persona *"}</Label>
                                        <Input placeholder="12345678-9" value={rut} onChange={(e) => setRut(formatRut(e.target.value))} required className="h-11 bg-muted/20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-foreground/80">Teléfono Móvil</Label>
                                    <Input type="tel" placeholder="+56 9 1234 5678" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} required className="h-11 bg-muted/20" />
                                </div>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all mt-6" 
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Procesando petición</>
                            ) : (
                                <>{isSignUp ? "Finalizar Registro" : "Iniciar Sesión"}<ArrowRight className="h-5 w-5 ml-2" /></>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm font-medium text-muted-foreground mt-8">
                        {isSignUp ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta corporativa?"}{" "}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-primary font-bold hover:underline underline-offset-4"
                        >
                            {isSignUp ? "Inicia sesión aquí" : "Regístrate gratis"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
