import { Fragment } from "react";
import { Sparkles } from "lucide-react";

// Pinta **negritas** dentro de una línea
function conNegritas(linea: string) {
  return linea.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">{parte.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{parte}</Fragment>
    ),
  );
}

// Respuesta del Copiloto: texto plano con títulos en negrita y viñetas "- "
export function CopilotoRespuesta({ texto }: { texto: string }) {
  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-1.5 text-sm leading-relaxed text-foreground/90">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
        <Sparkles className="h-3.5 w-3.5" /> Copiloto IA
      </div>
      {texto.split("\n").map((linea, i) => {
        const t = linea.trim();
        if (!t) return <div key={i} className="h-1" />;
        if (t.startsWith("- ")) {
          return (
            <p key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-indigo-500">
              {conNegritas(t.slice(2))}
            </p>
          );
        }
        return <p key={i}>{conNegritas(t)}</p>;
      })}
      <p className="pt-2 text-[11px] text-muted-foreground">
        Generado con IA a partir de los datos públicos de Mercado Público. Verifica siempre las bases oficiales.
      </p>
    </div>
  );
}
