import { Lemma } from "@/lib/parser";

interface IncidenceListProps {
    term: string;
    incidences: Lemma[];
    onClose: () => void;
    // Opcional: Deberíamos permitir navegar al hacer click en una incidencia
    onSelect?: (lemma: Lemma) => void; 
}

export function IncidenceList({ term, incidences, onClose, onSelect }: IncidenceListProps) {

    // --- HELPER PARA RESOLVER QUÉ MOSTRAR ---
    const getContextDisplay = (lemma: Lemma) => {
        // 1. Si buscamos un término específico y ese término coincide con una subentrada
        // intentamos mostrar esa subentrada específica.
        const targetSubentry = lemma.subentries.find(sub => 
            sub.sign.toLowerCase().includes(term.toLowerCase())
        );

        if (targetSubentry) {
            // Limpiamos el HTML del título de la subentrada para mostrarlo bonito
            const subTitle = targetSubentry.sign.replace(/<[^>]+>/g, "");
            // Buscamos su primera definición
            const subDef = targetSubentry.sense[0]?.definitions[0]?.plainText;
            
            return {
                titleSuffix: <span className="text-gray-400 text-lg font-normal ml-2">↳ {subTitle}</span>,
                description: subDef || "(Ver detalles en subentrada)"
            };
        }

        // 2. Si es el lema principal, intentamos mostrar su definición
        let mainDef = lemma.senses[0]?.definitions[0]?.plainText;

        // 3. FALLBACK: Si el lema principal NO tiene definición (es solo contenedor)
        // pero tiene subentradas, mostramos la primera subentrada como referencia.
        if (!mainDef && lemma.subentries.length > 0) {
            const firstSub = lemma.subentries[0];
            const cleanSign = firstSub.sign.replace(/<[^>]+>/g, "");
            return {
                titleSuffix: null,
                description: `Subentradas: ${cleanSign}, ...`
            };
        }

        return {
            titleSuffix: null,
            description: mainDef || "(Definición no disponible en vista previa)"
        };
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl shadow-2xl rounded-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-brand-blue text-white">
                    <h3 className="font-serif font-bold text-2xl">
                        Incidencias: <span className="italic">"{term}"</span>
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/10 rounded-full p-1 transition-colors duration-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Lista */}
                <div className="p-0 max-h-[70vh] overflow-y-auto bg-white">
                    {incidences.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 font-sans text-sm uppercase tracking-widest">
                            <p>No se encontraron referencias.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {incidences.map((lemma, idx) => {
                                const { titleSuffix, description } = getContextDisplay(lemma);
                                
                                return (
                                    <li 
                                        key={`${lemma.lemmaSign}-${idx}`} 
                                        className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer"
                                        onClick={() => {
                                            if (onSelect) onSelect(lemma);
                                            onClose();
                                        }}
                                    >
                                        <div className="flex items-baseline mb-2">
                                            <span className="font-serif font-bold text-xl text-brand-blue">
                                                {lemma.lemmaSign}
                                            </span>
                                            {/* Mostramos si es una subentrada lo que coincidió */}
                                            {titleSuffix}
                                        </div>
                                        
                                        <span className="font-sans text-base text-gray-600 leading-relaxed block line-clamp-2">
                                            {description}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
                    <span className="font-sans text-xs font-bold uppercase tracking-widest text-brand-blue">
                        {incidences.length} RESULTADOS
                    </span>
                </div>
            </div>
        </div>
    );
}