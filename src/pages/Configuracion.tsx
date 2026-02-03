import { Settings, User, Bell, Shield, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Configuracion() {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Configuración
        </h1>
        <p className="mt-2 text-muted-foreground">
          Administra tu cuenta y preferencias
        </p>
      </div>

      <div className="grid gap-6 max-w-3xl animate-fade-in" style={{ animationDelay: "100ms" }}>
        {/* Profile Section */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Perfil</CardTitle>
                <CardDescription>Información de tu cuenta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" defaultValue="Usuario Demo" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="demo@vyntra.gov" className="bg-background border-border" />
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground hover:opacity-90">
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        {/* Company Section */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Empresa</CardTitle>
                <CardDescription>Datos de tu organización</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="razon">Razón Social</Label>
                <Input id="razon" defaultValue="Empresa Demo SpA" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input id="rut" defaultValue="76.123.456-7" className="bg-background border-border" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Notificaciones</CardTitle>
                <CardDescription>Configura tus alertas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Nuevas licitaciones</p>
                <p className="text-sm text-muted-foreground">Recibe alertas de nuevas oportunidades</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Próximos cierres</p>
                <p className="text-sm text-muted-foreground">Alertas 48h antes del cierre</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Actualizaciones de postulación</p>
                <p className="text-sm text-muted-foreground">Estado de tus postulaciones</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Seguridad</CardTitle>
                <CardDescription>Protege tu cuenta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="border-border text-foreground hover:bg-muted">
              Cambiar contraseña
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Autenticación de dos factores</p>
                <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
