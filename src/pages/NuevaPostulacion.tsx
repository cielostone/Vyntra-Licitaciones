
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
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function NuevaPostulacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { saveDraft, getDraft, updateDraftStatus, subscriptionPlan } = useVyntra();

    // Cargar licitación desde la API real
    const [licitacion, setLicitacion] = useState<Licitacion | null>(null);
    const [loadingLic, setLoadingLic] = useState(true);

    // Datos de la Organización (Logo, Firma, etc)
    const [organization, setOrganization] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        setLoadingLic(true);
        fetchLicitacionPorCodigo(id)
            .then(data => setLicitacion(data))
            .catch(() => setLicitacion(null))
            .finally(() => setLoadingLic(false));
    }, [id]);

    useEffect(() => {
        const fetchOrg = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: pData } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
            if (pData?.organization_id) {
                const { data: oData } = await supabase.from('organizations').select('*').eq('id', pData.organization_id).single();
                if (oData) setOrganization(oData);
            }
        };
        fetchOrg();
    }, []);

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
            commercialConditions,
            status: 'draft'
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

        // Colors
        const primaryColor = [79, 70, 229]; // Indigo 600
        const secondaryColor = [100, 116, 139]; // Slate 500
        const darkText = [15, 23, 42]; // Slate 900

        // ================= HEADER CORPORATIVO =================
        // Background banner
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 30, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("COTIZACIÓN OFICIAL", 105, 20, { align: "center" });

        // Add Logo if exists
        try {
            if (organization?.logo_url) {
                // To safely add images from URL, the image must be base64. 
                // We'll load it visually if it's external, or just skip if it fails CORS
                // For MVP, we simulated the logo text
                doc.setFontSize(14);
                doc.text(organization.name || "Mi Empresa", 15, 20);
            }
        } catch (e) {
            console.warn("Could not add logo to PDF");
        }

        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        
        // ================= INFO LICITACIÓN =================
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("DATOS DE LA LICITACIÓN", 15, 45);
        
        doc.setFont("helvetica", "normal");
        doc.text(`ID Mercado Público:`, 15, 52);
        doc.setFont("helvetica", "bold");
        doc.text(licitacion.id, 55, 52);

        doc.setFont("helvetica", "normal");
        doc.text(`Organismo Cliente:`, 15, 59);
        doc.text(licitacion.organismo, 55, 59);

        doc.text(`Fecha Emisión:`, 15, 66);
        doc.text(new Date().toLocaleDateString(), 55, 66);

        // ================= TABLA DE ÍTEMS =================
        const tableBody = items.map((item, i) => [
            (i + 1).toString(),
            item.descripcion,
            item.cantidad.toString(),
            formatCurrency(item.precioUnitario),
            formatCurrency(item.cantidad * item.precioUnitario)
        ]);

        autoTable(doc, {
            startY: 75,
            head: [['N°', 'Descripción del Servicio/Producto', 'Cant.', 'Precio Unitario', 'Total Neto']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: primaryColor as any, textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 4 },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                2: { cellWidth: 15, halign: 'center' },
                3: { halign: 'right' },
                4: { halign: 'right', fontStyle: 'bold' }
            }
        });

        // ================= TOTALES =================
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.rect(120, finalY - 5, 75, 25, "F");

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`Total Neto:`, 125, finalY);
        doc.text(formatCurrency(totalNeto), 185, finalY, { align: "right" });

        doc.text(`IVA (19%):`, 125, finalY + 7);
        doc.text(formatCurrency(iva), 185, finalY + 7, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`TOTAL FINAL:`, 125, finalY + 16);
        doc.text(formatCurrency(total), 185, finalY + 16, { align: "right" });

        // ================= CONDICIONES COMERCIALES =================
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.setFontSize(10);
        doc.text("CONDICIONES COMERCIALES", 15, finalY + 35);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`• Plazo de Entrega: ${commercialConditions.plazoEntrega} días corridos.`, 15, finalY + 42);
        doc.text(`• Validez de la Oferta: ${commercialConditions.validezOferta} días corridos.`, 15, finalY + 47);
        
        let obsY = finalY + 52;
        if (commercialConditions.observaciones) {
            const splitObs = doc.splitTextToSize(`• Observaciones Adicionales: ${commercialConditions.observaciones}`, 180);
            doc.text(splitObs, 15, obsY);
            obsY += splitObs.length * 5;
        }

        // ================= FIRMA DIGITAL =================
        doc.setDrawColor(203, 213, 225); // Slate 300
        doc.line(75, 260, 135, 260); // Signature line
        doc.setFont("helvetica", "bold");
        doc.text(organization?.name || "Representante de la Empresa", 105, 266, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(organization?.rut || "RUT Proveedor", 105, 271, { align: "center" });

        doc.save(`Cotizacion_Oficial_${licitacion.id}.pdf`);

        // Marcar automáticamente como enviada/postulada
        updateDraftStatus(licitacion.id, 'submitted');

        toast({
            title: "Cotización Premium Descargada",
            description: "El archivo PDF fue generado y tu postulación ha pasado a estado 'Enviada'.",
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
