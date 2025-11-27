import { useState } from "react";
import { FilterOptions } from "@/hooks/useDictionary";

interface FilterSidebarProps {
    availableFilters: {
        letters: string[];
        pos: string[];
        usage: string[];
        geography: string[];
    };
    filters: FilterOptions;
    setFilters: (f: FilterOptions) => void;
    className?: string;
}

function Tooltip({ text }: { text: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block ml-2 align-middle">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className="text-gray-400 hover:text-black transition-colors focus:outline-none"
                aria-label="Más información"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute z-50 w-48 p-3 mt-2 text-xs font-normal text-white bg-black rounded shadow-xl left-0 top-full">
                    {text}
                    <div className="absolute -top-1 left-2 w-2 h-2 bg-black rotate-45"></div>
                </div>
            )}
        </div>
    );
}

export function FilterSidebar({ availableFilters, filters, setFilters, className = "" }: FilterSidebarProps) {
    const toggleFilter = (key: keyof FilterOptions, value: string) => {
        setFilters({
            ...filters,
            [key]: filters[key] === value ? undefined : value,
        });
    };

    return (
        <aside className={`h-full ${className}`}>
            {/* <h3 className="font-serif font-bold text-2xl mb-8 text-brand-blue border-b-2 border-brand-blue pb-2">Filtros</h3> */}

            {/* Letra Inicial */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <h4 className="font-sans font-bold text-xs text-brand-blue uppercase tracking-widest">Inicial</h4>
                    <Tooltip text="Filtra palabras que empiezan con la letra seleccionada." />
                </div>
                <div className="flex flex-wrap gap-2">
                    {availableFilters.letters.map((l) => (
                        <button
                            key={l}
                            onClick={() => toggleFilter("initialLetter", l)}
                            className={`w-8 h-8 flex items-center justify-center text-sm font-bold transition-all rounded-sm ${filters.initialLetter === l
                                ? "bg-brand-accent text-white"
                                : "bg-transparent text-brand-blue hover:bg-gray-100"
                                }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categoría Gramatical */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <h4 className="font-sans font-bold text-xs text-brand-blue uppercase tracking-widest">Categoría</h4>
                    <Tooltip text="Filtra por la función gramatical de la palabra (ej. adjetivo, sustantivo)." />
                </div>
                <div className="flex flex-row gap-5 flex-wrap">
                    {availableFilters.pos.map((p) => (
                        <label key={p} className="flex items-center space-x-3 cursor-pointer group">
                            <div className={`w-4 h-4 border border-brand-blue flex items-center justify-center transition-colors ${filters.pos === p ? 'bg-brand-accent border-brand-accent' : 'bg-transparent'}`}>
                                {filters.pos === p && <div className="w-2 h-2 bg-white" />}
                            </div>
                            <input
                                type="radio"
                                name="pos"
                                checked={filters.pos === p}
                                onChange={() => toggleFilter("pos", p)}
                                className="hidden"
                            />
                            <span className={`text-sm font-medium transition-colors ${filters.pos === p ? 'text-brand-accent' : 'text-gray-600 group-hover:text-brand-blue'}`}>{p}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Marca de Uso */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <h4 className="font-sans font-bold text-xs text-brand-blue uppercase tracking-widest">Uso</h4>
                    <Tooltip text="Filtra según el contexto o registro en el que se emplea la palabra (ej. coloquial, juvenil)." />
                </div>
                <select
                    className="w-full p-3 border border-gray-300 bg-white text-sm font-medium focus:border-brand-accent outline-none transition-colors appearance-none rounded-sm text-gray-700"
                    value={filters.usage || ""}
                    onChange={(e) => toggleFilter("usage", e.target.value)}
                >
                    <option value="">Todos</option>
                    {availableFilters.usage.map((u) => (
                        <option key={u} value={u}>
                            {u}
                        </option>
                    ))}
                </select>
            </div>

            {/* Geografía */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <h4 className="font-sans font-bold text-xs text-brand-blue uppercase tracking-widest">Región</h4>
                    <Tooltip text="Limita los resultados a una zona geográfica específica de Ecuador." />
                </div>
                <select
                    className="w-full  p-3 border border-gray-300 bg-white text-sm font-medium focus:border-brand-accent outline-none transition-colors appearance-none rounded-sm text-gray-700"
                    value={filters.geography || ""}
                    onChange={(e) => toggleFilter("geography", e.target.value)}
                >
                    <option value="">Todas</option>
                    {availableFilters.geography.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>
            </div>

            {(filters.initialLetter || filters.pos || filters.usage || filters.geography) && (
                <button
                    onClick={() => setFilters({})}
                    className="w-full py-3 px-4 bg-brand-blue text-white text-sm font-bold uppercase tracking-wider hover:bg-brand-accent transition-colors rounded-sm"
                >
                    Limpiar Filtros
                </button>
            )}
        </aside>
    );
}
