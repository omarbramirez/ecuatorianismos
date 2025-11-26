import { Lemma } from "@/lib/parser";

interface IncidenceListProps {
    term: string;
    incidences: Lemma[];
    onClose: () => void;
}

export function IncidenceList({ term, incidences, onClose }: IncidenceListProps) {
    return (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-background w-full max-w-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b-2 border-black flex justify-between items-center bg-black text-white">
                    <h3 className="font-display font-bold text-2xl">
                        Incidencias: <span className="italic">"{term}"</span>
                    </h3>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-0 max-h-[70vh] overflow-y-auto">
                    {incidences.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 font-mono text-sm uppercase tracking-widest">
                            <p>No se encontraron referencias.</p>
                        </div>
                    ) : (
                        <ul className="divide-y-2 divide-black">
                            {incidences.map((lemma, idx) => (
                                <li key={`${lemma.lemmaSign}-${idx}`} className="p-6 hover:bg-black hover:text-white transition-colors group cursor-default">
                                    <span className="font-display font-bold text-xl block mb-2">{lemma.lemmaSign}</span>
                                    <span className="font-serif text-lg leading-relaxed opacity-80 block line-clamp-2 group-hover:opacity-100">
                                        {lemma.senses[0]?.definitions[0]?.plainText}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t-2 border-black bg-gray-100 text-right">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">{incidences.length} RESULTADOS</span>
                </div>
            </div>
        </div>
    );
}
