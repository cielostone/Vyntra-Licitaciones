import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Misma regla de contraseña que el registro en Login
const schema = z
  .object({
    password: z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, "Mínimo 8 caracteres, con mayúsculas, minúsculas y números."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Las contraseñas no coinciden.", path: ["confirm"] });

type FormValues = z.infer<typeof schema>;

// Pantalla a la que llega el enlace de "recuperar contraseña" de Supabase
export default function Restablecer() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: FormValues) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(`No se pudo cambiar la contraseña: ${error.message}`);
      return;
    }
    toast.success("Contraseña actualizada.");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Nueva contraseña</h1>

        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : !session ? (
          <p className="text-sm text-muted-foreground">
            El enlace expiró o ya se usó. Pide uno nuevo desde{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Iniciar sesión</Link> → ¿Olvidaste tu contraseña?
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña nueva</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {formState.errors.password && <p className="text-sm text-destructive">{formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Repite la contraseña</Label>
              <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
              {formState.errors.confirm && <p className="text-sm text-destructive">{formState.errors.confirm.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
