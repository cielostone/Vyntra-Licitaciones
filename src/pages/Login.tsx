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
        <div className="min-h-screen bg-background flex">
            {/* Panel izquierdo — branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col justify-between p-12">
                {/* Patrón de fondo */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #6366f1 0%, transparent 50%),
                                          radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`
                    }}
                />

                {/* Grid decorativo */}
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30">
                            <Zap className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Vyntra</h1>
                            <p className="text-xs text-indigo-300">Gov Platform</p>
                        </div>
                    </div>
                </div>

                {/* Contenido central */}
                <div className="relative z-10 space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Licitaciones públicas<br />
                            <span className="text-indigo-400">inteligentes</span>
                        </h2>
                        <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                            Conectamos empresas chilenas con oportunidades reales de Mercado Público. 
                            Más de 4,000 licitaciones activas en tiempo real.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                            { value: "4.151", label: "Licitaciones activas" },
                            { value: "100%", label: "Datos en tiempo real" },
                            { value: "Chile", label: "Mercado Público oficial" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-slate-500 text-sm">
                    © 2026 Vyntra · Datos de{" "}
                    <span className="text-indigo-400">api.mercadopublico.cl</span>
                </div>
            </div>

            {/* Panel derecho — formulario */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    {/* Logo mobile */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                            <Zap className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">Vyntra</span>
                    </div>

                    {/* Título */}
                    <div>
                        {isSignUp && (
                            <button
                                onClick={() => setIsSignUp(false)}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Volver al login
                            </button>
                        )}
                        <h2 className="text-2xl font-bold text-foreground">
                            {isSignUp ? "Crear tu cuenta" : "Bienvenido de vuelta"}
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {isSignUp
                                ? "Completa tus datos para comenzar"
                                : "Ingresa tus credenciales para continuar"}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {/* Campos comunes */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@empresa.cl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={isSignUp ? "Mínimo 6 caracteres" : "••••••••"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-11"
                            />
                        </div>

                        {/* Campos solo en registro */}
                        {isSignUp && (
                            <div className="space-y-4 pt-2 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                                    Datos de tu empresa
                                </p>

                                {/* Tipo de persona */}
                                <RadioGroup
                                    value={personType}
                                    onValueChange={(v: "natural" | "juridica") => setPersonType(v)}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <label htmlFor="juridica" className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${personType === 'juridica' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                                        <RadioGroupItem value="juridica" id="juridica" />
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Empresa</span>
                                        </div>
                                    </label>
                                    <label htmlFor="natural" className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${personType === 'natural' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                                        <RadioGroupItem value="natural" id="natural" />
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Natural</span>
                                        </div>
                                    </label>
                                </RadioGroup>

                                {personType === "juridica" && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm">Razón Social *</Label>
                                            <Input
                                                placeholder="Empresa SpA"
                                                value={companyName}
                                                onChange={(e) => handleCompanyNameChange(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">RUT Empresa *</Label>
                                            <Input
                                                placeholder="76543210-K"
                                                value={companyRut}
                                                onChange={(e) => setCompanyRut(formatRut(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-sm">
                                            {personType === "juridica" ? "Representante Legal *" : "Nombre Completo *"}
                                        </Label>
                                        <Input
                                            placeholder="Juan Pérez"
                                            value={fullName}
                                            onChange={(e) => handleFullNameChange(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">
                                            {personType === "juridica" ? "RUN Representante *" : "RUN *"}
                                        </Label>
                                        <Input
                                            placeholder="12345678-9"
                                            value={rut}
                                            onChange={(e) => setRut(formatRut(e.target.value))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Teléfono de contacto</Label>
                                    <Input
                                        type="tel"
                                        placeholder="+56 9 1234 5678"
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <Button
                            type="submit"
                            className="w-full h-11 gap-2 mt-2 font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
                            ) : (
                                <>{isSignUp ? "Crear cuenta" : "Ingresar"}<ArrowRight className="h-4 w-4" /></>
                            )}
                        </Button>

                        {/* Toggle login/register */}
                        <p className="text-center text-sm text-muted-foreground">
                            {isSignUp ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="font-medium text-primary hover:underline"
                            >
                                {isSignUp ? "Iniciar sesión" : "Registrarse gratis"}
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
