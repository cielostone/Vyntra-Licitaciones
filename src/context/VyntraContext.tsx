import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "pro" | "enterprise";

export interface Draft {
    id: string; // Licitacion ID
    lastUpdated: string;
    items: Array<{
        descripcion: string;
        cantidad: number;
        precioUnitario: number;
    }>;
    commercialConditions: {
        plazoEntrega: string;
        validezOferta: string;
        observaciones: string;
    };
    status?: 'draft' | 'submitted' | 'won' | 'lost'; // Estado del flujo de ventas B2B
}

interface VyntraContextType {
    favorites: string[];
    toggleFavorite: (id: string) => void;
    drafts: Draft[];
    saveDraft: (draft: Draft) => void;
    getDraft: (id: string) => Draft | undefined;
    updateDraftStatus: (id: string, status: 'draft' | 'submitted' | 'won' | 'lost') => void;
    // Plan de la organización, leído de la base de datos (no se cambia desde el navegador)
    subscriptionPlan: SubscriptionPlan;
}

const VyntraContext = createContext<VyntraContextType | undefined>(undefined);

export function VyntraProvider({ children }: { children: React.ReactNode }) {
    // Load initial state from localStorage
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem("vyntra_favorites");
        return saved ? JSON.parse(saved) : [];
    });

    const [drafts, setDrafts] = useState<Draft[]>(() => {
        const saved = localStorage.getItem("vyntra_drafts");
        return saved ? JSON.parse(saved) : [];
    });

    const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>("free");

    // El plan vive en organizations.plan; se recarga al iniciar o cerrar sesión
    useEffect(() => {
        const cargarPlan = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return setSubscriptionPlan("free");
            const { data: perfil } = await supabase.from("profiles").select("organization_id").eq("id", user.id).maybeSingle();
            if (!perfil?.organization_id) return setSubscriptionPlan("free");
            const { data: org } = await supabase.from("organizations").select("plan").eq("id", perfil.organization_id).maybeSingle();
            const plan = org?.plan;
            setSubscriptionPlan(plan === "pro" || plan === "enterprise" ? plan : "free");
        };
        cargarPlan();
        localStorage.removeItem("vyntra_subscription"); // ya no se usa
        // setTimeout: no llamar a supabase dentro del callback de auth (puede bloquearse)
        const { data } = supabase.auth.onAuthStateChange((evento) => {
            if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") setTimeout(cargarPlan, 0);
        });
        return () => data.subscription.unsubscribe();
    }, []);

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem("vyntra_favorites", JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem("vyntra_drafts", JSON.stringify(drafts));
    }, [drafts]);

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const saveDraft = (newDraft: Draft) => {
        setDrafts(prev => {
            const existingIndex = prev.findIndex(d => d.id === newDraft.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...newDraft, lastUpdated: new Date().toISOString() };
                return updated;
            }
            return [...prev, { ...newDraft, lastUpdated: new Date().toISOString() }];
        });
    };

    const getDraft = (id: string) => {
        return drafts.find((d) => d.id === id);
    };

    const updateDraftStatus = (id: string, status: 'draft' | 'submitted' | 'won' | 'lost') => {
        setDrafts(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    };

    return (
        <VyntraContext.Provider
            value={{
                favorites,
                toggleFavorite,
                drafts,
                saveDraft,
                getDraft,
                updateDraftStatus,
                subscriptionPlan,
            }}
        >
            {children}
        </VyntraContext.Provider>
    );
}

export function useVyntra() {
    const context = useContext(VyntraContext);
    if (context === undefined) {
        throw new Error("useVyntra must be used within a VyntraProvider");
    }
    return context;
}
