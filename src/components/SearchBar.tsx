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

    // Estado para rastrear el índice resaltado con el teclado (-1 significa ninguno)
    const [activeIndex, setActiveIndex] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Sincronización de valor externo
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounce del input
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [localValue, onChange]);

    // Control de visibilidad de sugerencias
    useEffect(() => {
        if (suggestions.length > 0 && localValue.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
        // IMPORTANTE: Resetear el índice cuando cambian las sugerencias
        setActiveIndex(-1);
    }, [suggestions, localValue]);

    // Click outside
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

    // --- LÓGICA DE SCROLL AUTOMÁTICO ---
    // Mantiene el elemento seleccionado visible cuando se navega con flechas
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
                    // Si está por encima, scrollear hacia arriba
                    list.scrollTop = itemTop;
                } else if (itemBottom > listBottom) {
                    // Si está por debajo, scrollear hacia abajo
                    list.scrollTop = itemBottom - list.clientHeight;
                }
            }
        }
    }, [activeIndex]);

    const handleSelect = (lemma: Lemma) => {
        setLocalValue(lemma.lemmaSign);
        onChange(lemma.lemmaSign);
        onSelect(lemma);
        setShowSuggestions(false);
        setActiveIndex(-1);
    };

    // --- MANEJO DE TECLADO ---
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault(); // Evita que el cursor del input se mueva
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
                    placeholder="Escribe una palabra..."
                    value={localValue}
                    onChange={(e) => {
                        setLocalValue(e.target.value);
                        if (!showSuggestions && e.target.value.length > 0) setShowSuggestions(true);
                    }}
                    onFocus={() => {
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

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute w-full bg-white text-gray-800 shadow-xl rounded-b-sm border-t border-gray-100 max-h-[300px] overflow-y-auto z-40 top-full left-0 scroll-smooth"
                >
                    {suggestions.map((lemma, idx) => {
                        // Determinamos si este ítem está activo
                        const isActive = idx === activeIndex;

                        return (
                            <li
                                key={`${lemma.lemmaSign}-${idx}`}
                                className={`px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${isActive
                                        ? "bg-brand-blue/10" // Color de fondo cuando se navega con teclado
                                        : "hover:bg-gray-100" // Color de fondo al pasar el mouse
                                    }`}
                                onClick={() => handleSelect(lemma)}
                                // Sincronizamos el mouse con el teclado:
                                onMouseEnter={() => setActiveIndex(idx)}
                            >
                                <span className={`font-serif font-medium block ${isActive ? "text-brand-blue font-bold" : "text-gray-700"
                                    }`}>
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