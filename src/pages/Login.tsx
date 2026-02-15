
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // Extended fields
    const [fullName, setFullName] = useState("");
    const [rut, setRut] = useState("");
    const [personType, setPersonType] = useState<"natural" | "juridica">("natural");
    const [companyName, setCompanyName] = useState("");
    const [companyRut, setCompanyRut] = useState("");
    const [phone, setPhone] = useState("");

    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                // 1. Sign Up in Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });

                if (authError) throw authError;

                if (authData.user) {
                    // 2. Insert profile data
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: authData.user.id,
                        email: email,
                        full_name: fullName,
                        rut: rut,
                        person_type: personType,
                        company_name: personType === 'juridica' ? companyName : null,
                        company_rut: personType === 'juridica' ? companyRut : null,
                        phone: phone
                    });

                    if (profileError) {
                        console.error('Error creating profile:', profileError);
                        toast.error(`Error guardando perfil: ${profileError.message}`);
                        // Don't stop the flow, user is created, but profile missing.
                    }
                }

                toast.success("¡Registro exitoso! Por favor verifica tu correo.");
                setIsSignUp(false); // Switch back to login
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("¡Bienvenido de vuelta!");
                navigate("/");
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            let msg = error.message || "Error ocurrido";

            if (msg.includes("Invalid login credentials")) msg = "Credenciales incorrectas. Revisa tu correo y contraseña.";
            if (msg.includes("Email not confirmed")) msg = "Debes confirmar tu correo electrónico antes de ingresar.";
            if (msg.includes("User already registered")) msg = "Ya existe un usuario con este correo.";

            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{isSignUp ? "Crear Cuenta Vyntra" : "Iniciar Sesión"}</CardTitle>
                    <CardDescription>
                        {isSignUp
                            ? "Ingresa tus datos completos para registrarte"
                            : "Ingresa tus credenciales para acceder"}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAuth}>
                    <CardContent className="space-y-4">
                        {/* Common Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Registration Extra Fields */}
                        {isSignUp && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Tipo de Persona</Label>
                                    <RadioGroup
                                        defaultValue="natural"
                                        value={personType}
                                        onValueChange={(val: "natural" | "juridica") => setPersonType(val)}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="natural" id="r1" />
                                            <Label htmlFor="r1">Natural</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="juridica" id="r2" />
                                            <Label htmlFor="r2">Jurídica</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {personType === "juridica" && (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <h4 className="font-medium text-sm text-muted-foreground">Datos de la Empresa</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Razón Social</Label>
                                            <Input
                                                id="companyName"
                                                placeholder="Ej. Servicios S.A."
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                required={personType === "juridica"}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyRut">RUT Empresa</Label>
                                            <Input
                                                id="companyRut"
                                                placeholder="Ej. 76.543.210-K"
                                                value={companyRut}
                                                onChange={(e) => setCompanyRut(e.target.value)}
                                                required={personType === "juridica"}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 animate-in fade-in zoom-in-95">
                                    {personType === "juridica" && (
                                        <h4 className="font-medium text-sm text-muted-foreground">Datos del Representante</h4>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            {personType === "juridica" ? "Nombre Representante" : "Nombre Completo"}
                                        </Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Ej. Juan Pérez"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rut">
                                            {personType === "juridica" ? "RUN Representante" : "RUN"}
                                        </Label>
                                        <Input
                                            id="rut"
                                            placeholder="Ej. 12.345.678-9"
                                            value={rut}
                                            onChange={(e) => setRut(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+56 9 1234 5678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                            {loading ? "Procesando..." : isSignUp ? "Registrarse" : "Ingresar"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp
                                ? "¿Ya tienes cuenta? Inicia sesión"
                                : "¿No tienes cuenta? Crear una cuenta"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;
