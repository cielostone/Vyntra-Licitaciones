import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { prepararImagen } from "@/lib/marca";
import { toast } from "sonner";

interface SubirImagenProps {
  id: string;
  label: string;
  ayuda?: string;
  value: string;
  // dataUrl vacío = quitar la imagen; color = color dominante detectado
  onChange: (dataUrl: string, color: string | null) => void;
}

// Sube una imagen desde el computador, la reduce y muestra la vista previa
export function SubirImagen({ id, label, ayuda, value, onChange }: SubirImagenProps) {
  const input = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);

  const alElegir = async (archivo?: File) => {
    if (!archivo) return;
    setProcesando(true);
    try {
      const { dataUrl, color } = await prepararImagen(archivo);
      onChange(dataUrl, color);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar la imagen.");
    } finally {
      setProcesando(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-white">
          {value ? (
            <img src={value} alt={label} className="max-h-full max-w-full object-contain p-1" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={input}
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => alElegir(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={procesando} className="gap-2">
            {procesando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {value ? "Cambiar imagen" : "Subir imagen"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("", null)} className="gap-2 text-muted-foreground">
              <Trash2 className="h-4 w-4" /> Quitar
            </Button>
          )}
        </div>
      </div>
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
    </div>
  );
}
