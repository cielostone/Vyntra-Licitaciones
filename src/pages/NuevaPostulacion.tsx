
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Send, Save, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/data/licitaciones";
import { fetchLicitacionPorCodigo, type Licitacion } from "@/services/mercadoPublico";
import { useVyntra } from "@/context/VyntraContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function NuevaPostulacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { saveDraft, getDraft, subscriptionPlan } = useVyntra();

    // Cargar licitación desde la API real
    const [licitacion, setLicitacion] = useState<Licitacion | null>(null);
    const [loadingLic, setLoadingLic] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoadingLic(true);
        fetchLicitacionPorCodigo(id)
            .then(data => setLicitacion(data))
            .catch(() => setLicitacion(null))
            .finally(() => setLoadingLic(false));
    }, [id]);

    const [items, setItems] = useState([
        { descripcion: "Servicio Base", cantidad: 1, precioUnitario: 0 }
    ]);

    const [commercialConditions, setCommercialConditions] = useState({
        plazoEntrega: "15",
        validezOferta: "60",
        observaciones: ""
    });

    useEffect(() => {
        if (id) {
            const draft = getDraft(id);
            if (draft) {
                setItems(draft.items);
                setCommercialConditions(draft.commercialConditions);
                toast({
                    title: "Borrador Cargado",
                    description: `Se ha recuperado tu avance del ${new Date(draft.lastUpdated).toLocaleDateString()}`,
                });
            }
        }
    }, [id, getDraft, toast]);

    // Mostrar spinner mientras carga la licitación
    if (loadingLic) {
        return (
            <div className="p-10 flex items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando licitación desde Mercado Público...
            </div>
        );
    }

    if (!licitacion) {
        return <div className="p-10 text-muted-foreground">Licitación no encontrada en Mercado Público.</div>;
    }

    const handleAddItem = () => {
        setItems([...items, { descripcion: "", cantidad: 1, precioUnitario: 0 }]);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const totalNeto = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
    const iva = totalNeto * 0.19;
    const total = totalNeto + iva;

    const handleSave = () => {
        if (!id) return;

        saveDraft({
            id,
            lastUpdated: new Date().toISOString(),
            items,
            commercialConditions
        });

        toast({
            title: "Borrador Guardado",
            description: "Tu postulación ha sido guardada localmente.",
        });
    };

    const handleGenerateQuote = () => {
        if (!licitacion) return;

        if (subscriptionPlan === 'free') {
            toast({
                title: "Función Premium 🔒",
                description: "Actualiza a PRO para generar y descargar cotizaciones en PDF.",
                variant: "destructive",
            });
            return;
        }

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text("COTIZACIÓN", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.text(`Licitación: ${licitacion.id}`, 20, 40);
        doc.text(`Cliente: ${licitacion.organismo}`, 20, 50);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 60);

        // Items Table
        const tableBody = items.map(item => [
            item.descripcion,
            item.cantidad,
            formatCurrency(item.precioUnitario),
            formatCurrency(item.cantidad * item.precioUnitario)
        ]);

        autoTable(doc, {
            startY: 70,
            head: [['Descripción', 'Cant.', 'P. Unit', 'Total Neto']],
            body: tableBody,
            foot: [['', '', 'Total Neto', formatCurrency(totalNeto)]],
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.text(`IVA (19%): ${formatCurrency(iva)}`, 140, finalY);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL: ${formatCurrency(total)}`, 140, finalY + 10);

        // Conditions
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Condiciones Comerciales:", 20, finalY + 30);
        doc.text(`- Plazo de Entrega: ${commercialConditions.plazoEntrega} días`, 20, finalY + 37);
        doc.text(`- Validez de Oferta: ${commercialConditions.validezOferta} días`, 20, finalY + 44);
        if (commercialConditions.observaciones) {
            doc.text(`- Observaciones: ${commercialConditions.observaciones}`, 20, finalY + 51);
        }

        doc.save(`Cotizacion_${licitacion.id}.pdf`);

        toast({
            title: "Cotización Descargada",
            description: "El archivo PDF se ha generado correctamente.",
        });
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Nueva Postulación</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        Respondiento a: <span className="font-mono text-primary">{licitacion.id}</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Form */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles de la Oferta Económica</CardTitle>
                            <CardDescription>Desglose de los servicios o productos a ofertar</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-4 last:border-0">
                                    <div className="col-span-6">
                                        <Label>Descripción del Ítem</Label>
                                        <Input
                                            value={item.descripcion}
                                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                                            placeholder="Ej. Servicio de consultoría..."
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Cant.</Label>
                                        <Input
                                            type="number"
                                            value={item.cantidad}
                                            onChange={(e) => handleItemChange(index, 'cantidad', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Label>Precio Unitario</Label>
                                        <Input
                                            type="number"
                                            value={item.precioUnitario}
                                            onChange={(e) => handleItemChange(index, 'precioUnitario', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={handleAddItem} className="w-full dashed border-primary/20 text-primary">
                                + Agregar Ítem
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Condiciones Comerciales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Plazo de Entrega (Días)</Label>
                                    <Input
                                        type="number"
                                        value={commercialConditions.plazoEntrega}
                                        onChange={(e) => setCommercialConditions({ ...commercialConditions, plazoEntrega: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Validez de la Oferta (Días)</Label>
                                    <Input
                                        type="number"
                                        value={commercialConditions.validezOferta}
                                        onChange={(e) => setCommercialConditions({ ...commercialConditions, validezOferta: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Observaciones / Glosa</Label>
                                <Textarea
                                    value={commercialConditions.observaciones}
                                    onChange={(e) => setCommercialConditions({ ...commercialConditions, observaciones: e.target.value })}
                                    placeholder="Detalles adicionales sobre la propuesta..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="space-y-6">
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumen Financiero</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Neto:</span>
                                <span className="font-mono">{formatCurrency(totalNeto)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>IVA (19%):</span>
                                <span className="font-mono">{formatCurrency(iva)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg text-primary">
                                <span>Total:</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-3">
                        <Button onClick={handleGenerateQuote} className="w-full gap-2">
                            <FileText className="h-4 w-4" />
                            Generar Cotización PDF
                        </Button>
                        <Button variant="outline" onClick={handleSave} className="w-full gap-2">
                            <Save className="h-4 w-4" />
                            Guardar Borrador
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            onClick={() => window.open(licitacion.fuente_url, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Abrir en Mercado Público
                        </Button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm text-blue-900">Checklist IA</h4>
                                <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc pl-3">
                                    <li>Boleta de garantía: OK</li>
                                    <li>Certificados hábiles: OK</li>
                                    <li>Anexos técnicos: Pendiente</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
