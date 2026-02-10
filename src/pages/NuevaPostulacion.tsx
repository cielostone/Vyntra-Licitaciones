
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Send, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { licitaciones, formatCurrency } from "@/data/licitaciones";

export default function NuevaPostulacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const licitacion = licitaciones.find(l => l.id === id);

    const [items, setItems] = useState([
        { descripcion: "Servicio Base", cantidad: 1, precioUnitario: 0 }
    ]);

    if (!licitacion) {
        return <div className="p-10">Licitación no encontrada</div>;
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
        toast({
            title: "Borrador Guardado",
            description: "Tu postulación ha sido guardada localmente.",
        });
    };

    const handleGenerateQuote = () => {
        toast({
            title: "Generando Cotización...",
            description: "El PDF se está generando con los datos ingresados.",
        });
        // Here we would trigger the PDF generation logic
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
                                    <Input type="number" placeholder="15" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Validez de la Oferta (Días)</Label>
                                    <Input type="number" defaultValue={60} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Observaciones / Glosa</Label>
                                <Textarea placeholder="Detalles adicionales sobre la propuesta..." />
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
                        <Button variant="secondary" className="w-full gap-2 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
                            <Send className="h-4 w-4" />
                            Enviar a MercadoPúblico
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
