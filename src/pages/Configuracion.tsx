import { useState, useEffect } from "react";
import { User, Bell, Shield, Building, Target, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubirImagen } from "@/components/SubirImagen";
import { COLORES_SUGERIDOS, COLOR_MARCA_DEFAULT, esColorClaro, esHexValido } from "@/lib/marca";

const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/shapes/svg?seed=vyntra1&backgroundColor=4f46e5",
  "https://api.dicebear.com/7.x/shapes/svg?seed=vyntra2&backgroundColor=0ea5e9",
  "https://api.dicebear.com/7.x/shapes/svg?seed=vyntra3&backgroundColor=10b981",
  "https://api.dicebear.com/7.x/shapes/svg?seed=vyntra4&backgroundColor=f59e0b",
  "https://api.dicebear.com/7.x/shapes/svg?seed=vyntra5&backgroundColor=e11d48",
  "https://ui.shadcn.com/avatars/02.png"
];

export default function Configuracion() {
  const { user } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingMatch, setSavingMatch] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<any>(null);

  // Match Config data
  const [keywords, setKeywords] = useState("");
  const [categorias, setCategorias] = useState("");
  const [regiones, setRegiones] = useState("");
  const [montoMin, setMontoMin] = useState("");
  const [montoMax, setMontoMax] = useState("");

  // Company / Branding data
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [rutEmpresa, setRutEmpresa] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [firmaUrl, setFirmaUrl] = useState("");
  const [colorMarca, setColorMarca] = useState(COLOR_MARCA_DEFAULT);
  const [colorDelLogo, setColorDelLogo] = useState<string | null>(null);
  const [savingCompany, setSavingCompany] = useState(false);

  // Alarms and Notifications data
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [alertsWhatsapp, setAlertsWhatsapp] = useState(false);
  const [alertsEmail, setAlertsEmail] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // User Profile Customization
  const [avatarUrl, setAvatarUrl] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [savingUserConfig, setSavingUserConfig] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      // 1. Fetch Profile
      const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      // Usuarios creados sin organización: crearla y vincularla (función SQL ensure_my_organization)
      if (pData && !pData.organization_id) {
        const { data: orgId, error: orgError } = await supabase.rpc('ensure_my_organization');
        if (orgError) console.error('No se pudo crear la organización:', orgError);
        else pData.organization_id = orgId;
      }
      if (pData) {
        setProfile(pData);
        setWhatsappNumber(pData.whatsapp_number || "");
        setAlertsWhatsapp(pData.alerts_whatsapp || false);
        setAlertsEmail(pData.alerts_email || false);
        setAvatarUrl(pData.avatar_url || "");
        setNickname(pData.nickname || "");
        setAge(pData.age || "");
        
        if (pData.organization_id) {
          const { data: oData } = await supabase.from('organizations').select('*').eq('id', pData.organization_id).single();
          if (oData) {
            setNombreEmpresa(oData.name || pData.company_name || "");
            setRutEmpresa(oData.rut || pData.company_rut || "");
            setLogoUrl(oData.logo_url || "");
            setFirmaUrl(oData.firma_url || "");
            if (esHexValido(oData.brand_color)) setColorMarca(oData.brand_color);
          }
        }
      }

      // 2. Fetch Match Configs
      const { data: mData } = await supabase.from('match_configs').select('*').maybeSingle();
      if (mData) {
        setKeywords(mData.keywords ? mData.keywords.join(", ") : "");
        setCategorias(mData.categorias ? mData.categorias.join(", ") : "");
        setRegiones(mData.regiones ? mData.regiones.join(", ") : "");
        setMontoMin(mData.monto_minimo?.toString() || "");
        setMontoMax(mData.monto_maximo?.toString() || "");
      }
      setProfileLoading(false);
    };

    fetchAll();
  }, [user]);

  const handleSaveMatchConfig = async () => {
    if (!profile?.organization_id) {
      toast.error("Tu perfil aún no está vinculado a una organización.");
      return;
    }

    setSavingMatch(true);

    const keyArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
    const catArray = categorias.split(',').map(c => c.trim()).filter(Boolean);
    const regArray = regiones.split(',').map(r => r.trim()).filter(Boolean);

    const { error } = await supabase.from('match_configs').upsert({
      organization_id: profile.organization_id,
      keywords: keyArray,
      categorias: catArray,
      regiones: regArray,
      monto_minimo: montoMin ? parseInt(montoMin) : null,
      monto_maximo: montoMax ? parseInt(montoMax) : null
    }, { onConflict: 'organization_id' });

    setSavingMatch(false);

    if (error) {
      console.error(error);
      toast.error("Error al guardar tus preferencias de búsqueda.");
    } else {
      toast.success("¡Perfil de búsqueda actualizado exitosamente!");
    }
  };

  const handleSaveCompanyConfig = async () => {
    if (!profile?.organization_id) {
      toast.error("Tu perfil aún no está vinculado a una organización.");
      return;
    }

    if (!nombreEmpresa.trim()) {
      toast.error("Escribe el nombre de tu empresa: aparece en tus cotizaciones.");
      return;
    }

    setSavingCompany(true);

    const { error } = await supabase.from('organizations').update({
      name: nombreEmpresa.trim(),
      rut: rutEmpresa,
      logo_url: logoUrl,
      firma_url: firmaUrl,
      brand_color: colorMarca
    }).eq('id', profile.organization_id);

    setSavingCompany(false);

    if (error) {
      console.error(error);
      toast.error("Error al actualizar la identidad comercial.");
    } else {
      toast.success("¡Identidad y sincronización actualizada!");
    }
  };

  const handleSaveNotifications = async () => {
    setSavingSettings(true);
    const { error } = await supabase.from('profiles').update({
      whatsapp_number: whatsappNumber,
      alerts_whatsapp: alertsWhatsapp,
      alerts_email: alertsEmail
    }).eq('id', user?.id);
    
    setSavingSettings(false);
    
    if (error) {
      console.error(error);
      toast.error("Error al guardar configuraciones del sistema. Asegúrate de haber ejecutado la migración Fase 3 en tu base de datos.");
    } else {
      toast.success("¡Preferencias de Alarma actualizadas!");
    }
  };

  const handleSaveUserConfig = async () => {
    setSavingUserConfig(true);
    const { error } = await supabase.from('profiles').update({
      avatar_url: avatarUrl,
      nickname: nickname,
      age: age
    }).eq('id', user?.id);
    
    setSavingUserConfig(false);
    
    if (error) {
      console.error(error);
      toast.error("Error al guardar perfil. Asegúrate de ejecutar la migración SQL extra.");
    } else {
      toast.success("¡Perfil Personalizado Guardado!");
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center p-20 min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 md:p-8 lg:p-10 bg-background/40 overflow-hidden">
      {/* Decorative Orbs for Premium Glassmorphism Look */}
      <div className="pointer-events-none absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/5 blur-[100px]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 animate-fade-in flex flex-col items-start gap-2">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
            Panel de Control
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 tracking-tight md:text-4xl">
            Configuración Avanzada
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Ajusta el motor de búsqueda y tus datos organizacionales para sacarle el máximo partido a Vyntra Licitaciones.
          </p>
        </div>

        {/* Tabs Layout */}
        <Tabs defaultValue="match" className="w-[100%] animate-fade-in" style={{ animationDelay: "100ms" }}>
          
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8 bg-card/60 backdrop-blur-md border border-border/50 shadow-sm p-1.5 rounded-xl">
            <TabsTrigger value="match" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all py-2">
              <Target className="w-4 h-4 mr-2 hidden sm:block" />
              <span className="font-medium">Match</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all py-2">
              <User className="w-4 h-4 mr-2 hidden sm:block" />
              <span className="font-medium">Cuenta</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all py-2">
              <Building className="w-4 h-4 mr-2 hidden sm:block" />
              <span className="font-medium">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all py-2">
              <Bell className="w-4 h-4 mr-2 hidden sm:block" />
              <span className="font-medium">Sistema</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB: MATCH CONFIGS */}
          <TabsContent value="match" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 p-2 lg:p-4 rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20 shadow-inner">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Inteligencia de Búsqueda</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Entrena a Vyntra para que te muestre licitaciones perfectas para tu modelo de negocio.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                
                <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4 text-primary" />
                    <Label htmlFor="keywords" className="text-primary font-semibold text-sm uppercase tracking-wider">Palabras Clave Críticas</Label>
                  </div>
                  <Input 
                    id="keywords" 
                    className="bg-background/80 h-12 border-primary/20 focus-visible:ring-primary/30"
                    placeholder="Ej: servidores, seguridad perimetral, consultoría ágil" 
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground/80 font-medium">
                    Sepáralas por comas. El motor priorizará licitaciones que contengan estas palabras en su objetivo.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="categorias" className="text-sm font-medium">Rubros / Categorías</Label>
                    <Input 
                      id="categorias" 
                      className="bg-background/80"
                      placeholder="Ej: Tecnología, Computación" 
                      value={categorias}
                      onChange={e => setCategorias(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regiones" className="text-sm font-medium">Zonas de Cobertura</Label>
                    <Input 
                      id="regiones" 
                      className="bg-background/80"
                      placeholder="Ej: 13, Metropolitana, Valparaíso" 
                      value={regiones}
                      onChange={e => setRegiones(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="monto_min" className="text-sm font-medium">Filtro: Monto Mínimo ($)</Label>
                    <Input 
                      id="monto_min" 
                      type="number"
                      className="bg-background/80"
                      placeholder="Ej: 500000" 
                      value={montoMin}
                      onChange={e => setMontoMin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto_max" className="text-sm font-medium">Filtro: Monto Máximo ($)</Label>
                    <Input 
                      id="monto_max" 
                      type="number"
                      className="bg-background/80"
                      placeholder="Ej: 10000000" 
                      value={montoMax}
                      onChange={e => setMontoMax(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 rounded-b-xl px-6 py-4 mt-6">
                <Button 
                   onClick={handleSaveMatchConfig} 
                   disabled={savingMatch}
                   size="lg"
                   className="w-full sm:w-auto gradient-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all font-semibold"
                >
                  {savingMatch ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...</> : "Guardar Inteligencia de Búsqueda"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB: ACCOUNT */}
          <TabsContent value="account" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-lg p-2 lg:p-4 rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 border border-border">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Datos del Usuario</CardTitle>
                    <CardDescription>Tu identidad y personalización dentro de Vyntra.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium">Nombre Completo</Label>
                    <Input id="nombre" value={profile?.full_name || ""} disabled className="bg-muted/50 text-muted-foreground border-transparent cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico (Login)</Label>
                    <Input id="email" value={profile?.email || ""} disabled className="bg-muted/50 text-muted-foreground border-transparent cursor-not-allowed" />
                  </div>
                </div>

                <Separator className="my-2 bg-border/50" />
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  Personalización del Avatar
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar" className="text-sm font-medium">Avatar Personal (URL)</Label>
                      <Input 
                        id="avatar" 
                        value={avatarUrl} 
                        onChange={(e) => setAvatarUrl(e.target.value)} 
                        placeholder="https://tudominio.com/tu-foto.jpg" 
                        className="bg-background/80"
                      />
                    </div>
                    
                    <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/30">
                      <Label className="text-xs text-muted-foreground block">O selecciona un avatar abstracto rápido:</Label>
                      <div className="flex flex-wrap gap-2">
                         {DEFAULT_AVATARS.map((url, i) => (
                           <div 
                             key={i} 
                             onClick={() => setAvatarUrl(url)}
                             className={`h-10 w-10 rounded-full border-2 cursor-pointer transition-all bg-white/5 ${avatarUrl === url ? 'border-primary ring-2 ring-primary/20 scale-110 shadow-lg' : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'}`}
                           >
                             <img src={url} alt={`Avatar ${i+1}`} className="rounded-full w-full h-full object-cover p-1" />
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname" className="text-sm font-medium">Cargo o Apodo</Label>
                      <Input 
                        id="nickname" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)} 
                        placeholder="Ej: CEO, Account Manager..." 
                        className="bg-background/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium">Edad o Cumpleaños</Label>
                      <Input 
                        id="age" 
                        value={age} 
                        onChange={(e) => setAge(e.target.value)} 
                        placeholder="Ej: 32 años" 
                        className="bg-background/80"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleSaveUserConfig} 
                    disabled={savingUserConfig}
                    className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    {savingUserConfig && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar Perfil de Usuario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: COMPANY */}
          <TabsContent value="company" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-lg p-2 lg:p-4 rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 border border-orange-100 dark:border-orange-900/50">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Identidad Comercial</CardTitle>
                    <CardDescription>Datos legales bajo los cuales postulas a Mercado Público.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="razon" className="text-sm font-medium">{profile?.person_type === 'juridica' ? 'Razón Social' : 'Nombre Comercial'}</Label>
                    <Input
                      id="razon"
                      value={nombreEmpresa}
                      onChange={(e) => setNombreEmpresa(e.target.value)}
                      placeholder="Ej: Textiles Aurora SpA"
                      maxLength={120}
                      className="bg-background/80"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Así aparece tu empresa en las cotizaciones.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="rut" className="text-sm font-medium">RUT de Sincronización (Mercado Público)</Label>
                    </div>
                    <Input 
                      id="rut" 
                      value={rutEmpresa} 
                      onChange={(e) => setRutEmpresa(e.target.value)} 
                      placeholder="Ej: 76.123.456-K" 
                      className="bg-background/80"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Este RUT se vincula con Mercado Público.</p>
                  </div>
                </div>

                <Separator className="my-2 bg-border/50" />
                
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  Timbres Corporativos
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <SubirImagen
                    id="logo"
                    label="Logo de la empresa"
                    ayuda="PNG o JPG. Se imprime en tus cotizaciones en PDF."
                    value={logoUrl}
                    onChange={(dataUrl, color) => {
                      setLogoUrl(dataUrl);
                      setColorDelLogo(color);
                      if (color) setColorMarca(color);
                    }}
                  />
                  <SubirImagen
                    id="firma"
                    label="Firma del representante"
                    ayuda="Idealmente en fondo blanco o transparente."
                    value={firmaUrl}
                    onChange={(dataUrl) => setFirmaUrl(dataUrl)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Color de tus cotizaciones</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[...new Set([...(colorDelLogo ? [colorDelLogo] : []), ...COLORES_SUGERIDOS])].map((c) => (
                      <button
                        key={c}
                        type="button"
                        title={c === colorDelLogo ? "Color de tu logo" : c}
                        aria-label={`Usar color ${c}`}
                        onClick={() => setColorMarca(c)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${colorMarca.toUpperCase() === c.toUpperCase() ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <label className="flex h-8 cursor-pointer items-center gap-2 rounded-full border border-border px-3 text-xs text-muted-foreground hover:bg-muted/50">
                      <input
                        type="color"
                        value={colorMarca}
                        onChange={(e) => setColorMarca(e.target.value.toUpperCase())}
                        className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
                      />
                      Otro color
                    </label>
                  </div>
                  {colorDelLogo && (
                    <p className="text-xs text-muted-foreground">Tomamos el color de tu logo. Puedes elegir otro.</p>
                  )}
                  {/* Vista previa del encabezado del PDF */}
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div
                      className="flex h-14 items-center gap-3 px-3"
                      style={{ backgroundColor: colorMarca, color: esColorClaro(colorMarca) ? "#0F172A" : "#FFFFFF" }}
                    >
                      {logoUrl && (
                        <div className="flex h-10 w-14 items-center justify-center rounded bg-white p-0.5">
                          <img src={logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                      <span className="flex-1 text-center text-sm font-bold tracking-wide">COTIZACIÓN OFICIAL</span>
                    </div>
                    <p className="bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">Así se verá el encabezado de tus cotizaciones.</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleSaveCompanyConfig} 
                    disabled={savingCompany}
                    className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    {savingCompany && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar Identidad Comercial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: NOTIFICATIONS & SYSTEM */}
          <TabsContent value="notifications" className="focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-lg rounded-2xl flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-indigo-500" /> Alertas B2B</CardTitle>
                    <CardDescription>Configura alarmas automatizadas de tus oportunidades.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Avisos por Correo (Email)</p>
                        <p className="text-sm text-muted-foreground">Notificaciones diarias sobre licitaciones.</p>
                      </div>
                      <Switch checked={alertsEmail} onCheckedChange={setAlertsEmail} />
                    </div>
                    <Separator className="bg-border/50" />
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Alertas Flash WhatsApp</p>
                          <p className="text-sm text-muted-foreground">Mensajes instantáneos en aperturas clave.</p>
                        </div>
                        <Switch checked={alertsWhatsapp} onCheckedChange={setAlertsWhatsapp} />
                      </div>
                      {alertsWhatsapp && (
                         <div className="mt-2 space-y-2 bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/20">
                           <Label htmlFor="whatsapp" className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Número Asociado</Label>
                           <Input 
                             id="whatsapp"
                             placeholder="+56 9 1234 5678"
                             value={whatsappNumber}
                             onChange={(e) => setWhatsappNumber(e.target.value)}
                             className="bg-background/80"
                           />
                         </div>
                      )}
                    </div>
                  </CardContent>
                </div>
                <CardFooter className="bg-muted/30 border-t border-border/50 rounded-b-xl px-6 py-4 mt-4">
                  <Button 
                     onClick={handleSaveNotifications}
                     disabled={savingSettings}
                     className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                     {savingSettings && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                     Guardar Preferencias
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-500" /> Seguridad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Protección en 2 Pasos (2FA)</p>
                      <p className="text-sm text-muted-foreground">Agrega una app de autenticación.</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator className="bg-border/50" />
                  <Button variant="outline" className="w-full">
                    Actualizar Contraseña
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
