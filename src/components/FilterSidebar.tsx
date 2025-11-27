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
}

export function FilterSidebar({ availableFilters, filters, setFilters }: FilterSidebarProps) {
    const toggleFilter = (key: keyof FilterOptions, value: string) => {
        setFilters({
            ...filters,
            [key]: filters[key] === value ? undefined : value,
        });
    };

    return (
        <aside className="w-full md:w-64 h-fit sticky top-8">
            {/* <h3 className="font-display font-bold text-2xl mb-8 text-black border-b-2 border-black pb-2">Filtros</h3> */}

            {/* Letra Inicial */}
            {/* <div className="mb-8">
                <h4 className="font-sans font-bold text-xs text-gray-500 mb-4 uppercase tracking-widest">Inicial</h4>
                <div className="flex flex-wrap gap-2">
                    {availableFilters.letters.map((l) => (
                        <button
                            key={l}
                            onClick={() => toggleFilter("initialLetter", l)}
                            className={`w-8 h-8 flex items-center justify-center text-sm font-bold transition-all ${filters.initialLetter === l
                                    ? "bg-black text-white"
                                    : "bg-transparent text-black hover:bg-gray-200"
                                }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div> */}

            {/* Categoría Gramatical */}
            <div className="mb-8">
                <h4 className="font-sans font-bold text-xs text-gray-500 mb-4 uppercase tracking-widest">Categoría</h4>
                <div className="flex flex-col gap-2">
                    {availableFilters.pos.map((p) => (
                        <label key={p} className="flex items-center space-x-3 cursor-pointer group">
                            <div className={`w-4 h-4 border border-black flex items-center justify-center transition-colors ${filters.pos === p ? 'bg-black' : 'bg-transparent'}`}>
                                {filters.pos === p && <div className="w-2 h-2 bg-white" />}
                            </div>
                            <input
                                type="radio"
                                name="pos"
                                checked={filters.pos === p}
                                onChange={() => toggleFilter("pos", p)}
                                className="hidden"
                            />
                            <span className={`text-sm font-medium transition-colors ${filters.pos === p ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>{p}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Marca de Uso */}
            <div className="mb-8">
                <h4 className="font-sans font-bold text-xs text-gray-500 mb-4 uppercase tracking-widest">Uso</h4>
                <select
                    className="w-1/2 p-3 border-2 border-gray-200 bg-transparent text-sm font-medium focus:border-black outline-none transition-colors appearance-none rounded-none"
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
                <h4 className="font-sans font-bold text-xs text-gray-500 mb-4 uppercase tracking-widest">Región</h4>
                <select
                    className="w-1/2 p-3 border-2 border-gray-200 bg-transparent text-sm font-medium focus:border-black outline-none transition-colors appearance-none rounded-none"
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
                    className="w-full py-3 px-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                    Limpiar Filtros
                </button>
            )}
        </aside>
    );
}
