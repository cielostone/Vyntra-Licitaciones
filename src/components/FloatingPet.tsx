
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Activity, MessageCircle } from 'lucide-react';

export function FloatingPet() {
    const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
    const [target, setTarget] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
    const [isHovering, setIsHovering] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const requestRef = useRef<number>();

    // Physics constants
    const SPRING = 0.08; // Valor bajo = más "pesado" y fluido / Valor alto = más rápido
    const OFFSET_X = 40; // Distancia del cursor
    const OFFSET_Y = 40;

    // Track mouse
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Si el usuario está interactuando con la mascota, no la movemos bruscamente
            if (!isHovering) {
                setTarget({ x: e.clientX + OFFSET_X, y: e.clientY + OFFSET_Y });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isHovering]);

    // Animation loop (Lerp)
    useEffect(() => {
        const animate = () => {
            setPosition(prev => {
                const dx = target.x - prev.x;
                const dy = target.y - prev.y;

                // Si está muy cerca, no actualizar para ahorrar recursos
                if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return prev;

                return {
                    x: prev.x + dx * SPRING,
                    y: prev.y + dy * SPRING
                };
            });
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [target]);

    const messages = [
        "¡Aquí estoy!",
        "Analizando...",
        "¿Necesitas ayuda?",
        "¡Vamos equipo!",
        "Adjudiquemos todo 🚀",
        "Sistemas OK ✅"
    ];

    const handleClick = () => {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div
            className={cn(
                "fixed z-50 transition-transform duration-75 ease-out cursor-pointer group",
                isHovering ? "scale-110" : "scale-100"
            )}
            style={{
                left: pxToRem(position.x),
                top: pxToRem(position.y),
                transform: `translate(-50%, -50%)`, // Center on coordinates
                pointerEvents: 'auto' // Allow interaction
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleClick}
        >
            {/* Speech Bubble */}
            {message && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-primary px-3 py-1.5 rounded-2xl shadow-lg border border-blue-100 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {message}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-blue-100"></div>
                </div>
            )}

            {/* Pet Container - Spherical Clip to remove generic background if any */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 flex items-center justify-center overflow-hidden hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow duration-300">
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent pointer-events-none"></div>

                <img
                    src="/pets/drone_floating.png"
                    alt="Vyntra Pet"
                    className="w-full h-full object-cover animate-float" // object-cover + rounded-full = circle cutout
                    style={{ animation: 'float 3s ease-in-out infinite' }}
                />
            </div>

            {/* Pulse effect under pet */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full bg-blue-400/20 blur-xl -z-10 animate-pulse"></div>
        </div>
    );
}

// Helper to avoid issues with SSR or types, though here we are client side
function pxToRem(px: number) {
    return `${px}px`;
}
