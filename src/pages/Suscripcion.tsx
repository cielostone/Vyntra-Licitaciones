
import { Check, Star, Zap, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVyntra } from "@/context/VyntraContext";
import { useToast } from "@/hooks/use-toast";

const plans = [
    {
        id: "free",
        name: "Gratis",
        price: "$0",
        description: "Para comenzar a explorar",
        features: [
            "Radar de licitaciones activas",
            "Match AI con el perfil de tu empresa",
            "Copiloto IA que explica cada licitación",
            "Hasta 3 favoritos"
        ],
        icon: Star,
        color: "bg-gray-100 text-gray-900"
    },
    {
        id: "pro",
        name: "Profesional",
        price: "$29.990",
        period: "/mes",
        description: "Para profesionales independientes",
        features: [
            "Todo lo de Gratis",
            "Favoritos ilimitados",
            "Cotizaciones en PDF con tu logo y firma",
            "Seguimiento de postulaciones y tasa de éxito",
            "Alertas por correo (Próximamente)"
        ],
        popular: true,
        icon: Zap,
        color: "bg-primary text-primary-foreground"
    },
    {
        id: "enterprise",
        name: "Empresas",
        price: "$79.990",
        period: "/mes",
        description: "Para equipos de licitaciones",
        features: [
            "Todo lo de Profesional",
            "Múltiples usuarios (Próximamente)",
            "Análisis de competidores (Próximamente)",
            "API de integración (Próximamente)",
            "Soporte prioritario"
        ],
        icon: Building,
        color: "bg-gray-900 text-white"
    }
];

export default function Suscripcion() {
    const { subscriptionPlan } = useVyntra();
    const { toast } = useToast();

    // El plan se activa desde el servidor (organizations.plan); aún no hay pago en línea
    const handleSubscribe = (planName: string) => {
        toast({
            title: `Plan ${planName}`,
            description: "El pago en línea estará disponible pronto. Mientras tanto, activamos tu plan a mano.",
            duration: 4000,
        });
    };

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Elige el plan perfecto para ti
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Desbloquea todo el potencial de Vyntra Licitaciones y gana más oportunidades.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {plans.map((plan, index) => {
                    const Icon = plan.icon;
                    const isCurrent = subscriptionPlan === plan.id;
                    const isHighlighted = isCurrent;

                    return (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col transition-all duration-200 hover:shadow-xl ${isHighlighted ? 'border-primary shadow-md scale-105 z-10' : 'border-border'
                                } animate-fade-in`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {isCurrent && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <Badge className="bg-primary text-primary-foreground hover:bg-primary pointer-events-none">
                                        Tu Plan Actual
                                    </Badge>
                                </div>
                            )}

                            {!isCurrent && plan.popular && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <Badge variant="secondary" className="pointer-events-none">
                                        Más Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`p-2 rounded-lg ${plan.id === 'pro' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    )}
                                </div>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <ul className="space-y-3 text-sm">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={isCurrent ? "default" : "outline"}
                                    onClick={() => handleSubscribe(plan.name)}
                                    disabled={isCurrent || plan.id === "free"}
                                >
                                    {isCurrent ? "Plan Actual" : plan.id === "free" ? "Incluido" : "Quiero este plan"}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                <p className="text-sm text-muted-foreground">
                    ¿Necesitas un plan a medida? <a href="#" className="text-primary underline">Contáctanos</a> para licitaciones corporativas.
                </p>
            </div>
        </div>
    );
}
