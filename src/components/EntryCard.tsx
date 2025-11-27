import { Lemma, Sense, Definition, Subentry } from "@/lib/parser";

interface EntryCardProps {
    lemma: Lemma;
    onShowIncidences: (term: string) => void;
}

export function EntryCard({ lemma, onShowIncidences }: EntryCardProps) {
    return (
        <div className="bg-transparent border-b-2 border-black py-8 hover:bg-white/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-black tracking-tight group-hover:text-gray-800 transition-colors">
                    {lemma.lemmaSign}
                </h2>
                <button
                    onClick={() => onShowIncidences(lemma.lemmaSign)}
                    className="text-xs font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                >
                    Incidencias
                </button>
            </div>

            {lemma.variants && (
                <p className="text-sm text-gray-500 mb-6 font-mono">
                    Variantes: <span className="italic">{Array.isArray(lemma.variants) ? lemma.variants.join(", ") : lemma.variants}</span>
                </p>
            )}

            <div className="space-y-6">
                {lemma.senses.map((sense, idx) => (
                    <SenseBlock key={idx} sense={sense} />
                ))}
            </div>

            {lemma.subentries.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Subentradas</h3>
                    <div className="space-y-6 pl-0 md:pl-8">
                        {lemma.subentries.map((sub, idx) => (
                            <div key={idx} className="border-l-2 border-gray-200 pl-4">
                                <span className="font-display font-bold text-xl text-black block mb-2">{sub.sign}</span>
                                {sub.sense.map((s, i) => (
                                    <SenseBlock key={i} sense={s} isSubentry />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function romanToArabic(roman: string): string {
    const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    let prev = 0;
    const upper = roman.toUpperCase().replace('.', ''); // Remove dots if present

    for (let i = upper.length - 1; i >= 0; i--) {
        const curr = map[upper[i]];
        if (!curr) return roman; // Return original if not a valid roman numeral
        if (curr >= prev) {
            result += curr;
        } else {
            result -= curr;
        }
        prev = curr;
    }
    return result.toString();
}

function SenseBlock({ sense, isSubentry = false }: { sense: Sense; isSubentry?: boolean }) {
    return (
        <div className={`text-black ${isSubentry ? "mt-2" : ""}`}>
            <div className="flex items-baseline gap-2 mb-1">
                {sense.senseNumber && (
                    <span className="font-mono font-bold text-black text-sm">
                        {romanToArabic(sense.senseNumber)}.
                    </span>
                )}
                {sense.pos && <span className="font-mono text-sm text-gray-500">{sense.pos}</span>}
            </div>

            <div className="block">
                {sense.definitions.map((def, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                        <div className="mb-1">
                            {def.usageLabel && <span className="text-[10px] font-bold tracking-wider text-white bg-black px-1 py-0.5 mr-2">{def.usageLabel}</span>}
                            {def.geographicLabel && <span className="text-[10px] font-bold uppercase tracking-wider text-black border border-black px-1 py-0.5 mr-2">{def.geographicLabel}</span>}
                            <span className="font-serif text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: def.text }} />
                            {def.examples.length > 0 && <span className="font-serif text-lg font-bold">:</span>}
                        </div>
                        {def.examples.length > 0 && (
                            <div className="mt-2 pl-4 border-l border-black/20">
                                {def.examples.map((ex, i) => (
                                    <div key={i} className="text-gray-600 italic font-serif text-base mb-1">
                                        <span dangerouslySetInnerHTML={{ __html: `"${ex.text}"` }} />
                                        {ex.source && <span className="text-gray-400 not-italic text-xs font-sans ml-2">— {ex.source}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
