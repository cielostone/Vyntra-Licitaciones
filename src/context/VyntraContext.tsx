
import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

interface VyntraContextType {
    favorites: string[];
    toggleFavorite: (id: string) => void;
    drafts: Draft[];
    saveDraft: (draft: Draft) => void;
    getDraft: (id: string) => Draft | undefined;
}

const VyntraContext = createContext<VyntraContextType | undefined>(undefined);

export function VyntraProvider({ children }: { children: React.ReactNode }) {
    // Load initial state from localStorage
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('vyntra_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    const [drafts, setDrafts] = useState<Draft[]>(() => {
        const saved = localStorage.getItem('vyntra_drafts');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('vyntra_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('vyntra_drafts', JSON.stringify(drafts));
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
        return drafts.find(d => d.id === id);
    };

    return (
        <VyntraContext.Provider value={{ favorites, toggleFavorite, drafts, saveDraft, getDraft }}>
            {children}
        </VyntraContext.Provider>
    );
}

export function useVyntra() {
    const context = useContext(VyntraContext);
    if (context === undefined) {
        throw new Error('useVyntra must be used within a VyntraProvider');
    }
    return context;
}
