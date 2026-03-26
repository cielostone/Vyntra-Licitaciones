import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, MapPin } from "lucide-react";

export default function FAQ() {
  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-4xl mx-auto min-h-screen">
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-2 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-500 border border-indigo-500/30">
            <HelpCircle className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground md:text-5xl tracking-tight">
          Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Ayuda</span>
        </h1>
        <p className="text-lg font-medium text-muted-foreground mt-4 max-w-2xl mx-auto">
          Encuentra respuestas rápidas sobre el uso del Piloto Automático, Cotizaciones Premium y Conexión con Mercado Público.
        </p>
      </div>

      <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Preguntas Técnicas */}
        <section className="bg-white/70 dark:bg-[#0c0e1a]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-slate-200 dark:border-white/10 pb-4">Conexión con Mercado Público</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-bold text-lg">¿Cómo funciona el Piloto Automático de Vyntra?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                El Piloto Automático cruza el RUT de tu Organización con la base oficial del Gobierno de Chile (Mercado Público). Si has guardado una cotización y la adjudicación real del gobierno resulta a tu favor, Vyntra detectará tu victoria, moverá la oportunidad al historial de éxito y te notificará inmediatamente.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-bold text-lg">¿Por qué las licitaciones activas demoraron en cargar la primera vez?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                El servicio del Gobierno entrega listados masivos de datos (hasta 15.000 licitaciones vivas), lo que toma unos segundos procesar. Vyntra cuenta con un **Motor de Caché**, lo que significa que el sistema sufrirá lentitud únicamente durante tu primera visita diaria. Las navegaciones posteriores cargarán a la velocidad de la luz gracias a nuestra optimización interna B2B.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Facturación y Suscripciones */}
        <section className="bg-white/70 dark:bg-[#0c0e1a]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-slate-200 dark:border-white/10 pb-4">Identidad y Cotizaciones</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-bold text-lg">¿Cómo personalizo mis Cotizaciones B2B en PDF?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                Debes tener una suscripción PRO o superior. En la esquina superior derecha, usa el menú y ve a **Mis Preferencias / RUT**. Allí puedes subir la URL del Logo Oficial de tu empresa y una imagen con tu Firma gráfica en fondo transparente (PNG). Vyntra utilizará esos assets para darle validez corporativa a tus ofertas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-bold text-lg">Cambié mi logo corporativo pero no se actualiza en el menú Arriba.</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                En Vyntra, el Top Navigation utiliza automáticamente la misma imagen configurada en tu base de datos de "Cotizaciones". Simplemente actualiza la URL en "Configuración" y luego en la pestaña "Empresa", cierra sesión, y vuelve a entrar. La caché forzará la lectura de tu nueva imagen de marca.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Contacto Real */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 justify-center items-center p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
           <Mail className="h-10 w-10 text-indigo-500" />
           <div className="text-center md:text-left">
             <h3 className="text-xl font-bold text-foreground">¿Aún tienes dudas técnicas?</h3>
             <p className="text-muted-foreground mt-1">Nuestro equipo de soporte está listo para asistirte 24/7.</p>
           </div>
           <a 
              href="mailto:soporte@vyntra.cl?subject=Soporte Técnico Especializado"
              className="mt-4 md:mt-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
             Crear Ticket Ahora
           </a>
        </div>
      </div>
    </div>
  );
}
