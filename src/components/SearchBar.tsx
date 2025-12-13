import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { Lemma } from "@/lib/parser";

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
    suggestions: Lemma[];
    onSelect: (lemma: Lemma) => void;
}

export function SearchBar({ value, onChange, suggestions, onSelect }: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Sincronización de valor externo (cuando el padre limpia el input)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounce para no saturar al padre con cada tecla
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [localValue, onChange]);

    // --- CORRECCIÓN CLAVE ---
    // Eliminamos el useEffect que forzaba la apertura automática al cambiar props.
    // Ahora la visibilidad se controla exclusivamente en los eventos (onChange, onSelect).
    
    // Solo reseteamos el índice si cambian las sugerencias
    useEffect(() => {
        setActiveIndex(-1);
    }, [suggestions]);

    // Click outside (Cierra la lista si clicas fuera)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setActiveIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Scroll automático (Mantiene la selección visible)
    useEffect(() => {
        if (activeIndex !== -1 && listRef.current) {
            const list = listRef.current;
            const activeItem = list.children[activeIndex] as HTMLElement;

            if (activeItem) {
                const itemTop = activeItem.offsetTop;
                const itemBottom = itemTop + activeItem.clientHeight;
                const listTop = list.scrollTop;
                const listBottom = listTop + list.clientHeight;

                if (itemTop < listTop) {
                    list.scrollTop = itemTop;
                } else if (itemBottom > listBottom) {
                    list.scrollTop = itemBottom - list.clientHeight;
                }
            }
        }
    }, [activeIndex]);

    const handleSelect = (lemma: Lemma) => {
        setLocalValue(lemma.lemmaSign);
        onChange(lemma.lemmaSign);
        onSelect(lemma);
        
        // AL SELECCIONAR: Forzamos el cierre y como ya no hay useEffect vigilando, se queda cerrado.
        setShowSuggestions(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // Si la lista está cerrada, flecha abajo la abre
        if (e.key === "ArrowDown" && !showSuggestions && suggestions.length > 0) {
            e.preventDefault();
            setShowSuggestions(true);
            return;
        }

        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    handleSelect(suggestions[activeIndex]);
                    // Aseguramos cierre al dar Enter
                    setShowSuggestions(false);
                    // Quitamos el foco para esconder teclado en móviles (opcional, buena UX)
                    (e.target as HTMLInputElement).blur();
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setActiveIndex(-1);
                break;
        }
    };

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <div className="relative group z-30">
                <input
                    type="text"
                    className="w-full py-3 pl-4 pr-12 bg-white/10 border border-white/20 rounded-sm text-white placeholder-white/60 focus:bg-white focus:text-brand-blue focus:placeholder-gray-400 outline-none transition-all font-sans"
                    placeholder="Consultar término..."
                    value={localValue}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setLocalValue(newValue);
                        
                        // LÓGICA DE APERTURA: Solo abrimos si el usuario está escribiendo
                        if (newValue.length > 0) {
                            setShowSuggestions(true);
                        } else {
                            setShowSuggestions(false);
                        }
                    }}
                    onFocus={() => {
                        // Al hacer foco, si hay texto y sugerencias, abrimos
                        if (suggestions.length > 0 && localValue.length > 0) setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                        className="text-white/60 group-focus-within:text-brand-blue w-5 h-5 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute w-full bg-white text-gray-800 shadow-xl rounded-b-sm border-t border-gray-100 max-h-[150px] overflow-y-auto z-40 top-full left-0"
                >
                    {suggestions.map((lemma, idx) => {
                        const isActive = idx === activeIndex;

                        return (
                            <li
                                key={`${lemma.lemmaSign}-${idx}`}
                                className={`px-4 py-2 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                                    isActive
                                        ? "bg-brand-blue/10 text-brand-blue"
                                        : "hover:bg-gray-100 text-gray-700"
                                }`}
                                onClick={() => handleSelect(lemma)}
                                onMouseEnter={() => setActiveIndex(idx)}
                            >
                                <span className={`font-serif block ${isActive ? "font-bold" : "font-medium"}`}>
                                    {lemma.lemmaSign}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}