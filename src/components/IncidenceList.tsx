import { Lemma } from "@/lib/parser";

interface IncidenceListProps {
    term: string;
    incidences: Lemma[];
    onClose: () => void;
}

export function IncidenceList({ term, incidences, onClose }: IncidenceListProps) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl shadow-2xl rounded-sm overflow-hidden animate-in fade-in zoom-in duration-200">
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

                <div className="p-0 max-h-[70vh] overflow-y-auto bg-white">
                    {incidences.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 font-sans text-sm uppercase tracking-widest">
                            <p>No se encontraron referencias.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {incidences.map((lemma, idx) => (
                                <li key={`${lemma.lemmaSign}-${idx}`} className="p-6 hover:bg-gray-50 transition-colors group cursor-default">
                                    <span className="font-serif font-bold text-xl block mb-2 text-brand-blue">{lemma.lemmaSign}</span>
                                    <span className="font-sans text-base text-gray-600 leading-relaxed block line-clamp-2">
                                        {lemma.senses[0]?.definitions[0]?.plainText}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
                    <span className="font-sans text-xs font-bold uppercase tracking-widest text-brand-blue">{incidences.length} RESULTADOS</span>
                </div>
            </div>
        </div>
    );
}
