import { Lemma, Sense, Definition, Subentry } from "@/lib/parser";

interface EntryCardProps {
    lemma: Lemma;
    onShowIncidences: (term: string) => void;
}

export function EntryCard({ lemma, onShowIncidences }: EntryCardProps) {
    return (
        <div className="bg-white border-b border-gray-200 py-8 hover:bg-gray-50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-blue tracking-tight ">
                    {lemma.lemmaSign}
                </h2>
            </div>

            {lemma.variants && (
                <p className="text-sm text-gray-500 mb-6 font-sans">
                    Variantes: {" "} <span className="italic font-serif text-gray-700 ">{Array.isArray(lemma.variants) ? lemma.variants.join(", ") : lemma.variants}</span>
                </p>
            )}

            {lemma.etimologia && (
                <div className="mb-6">
                    <p className="font-serif text-gray-700 text-lg">
                        <span
                            dangerouslySetInnerHTML={{ __html: lemma.etimologia }}
                            className="[&>i]:font-serif [&>i]:italic"
                        />
                    </p>
                </div>
            )}

            {/* Senses and Definitions */}
            <div className="space-y-6">
                {lemma.senses.map((sense, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <div className="flex items-baseline gap-3 border-b border-gray-100 pb-1 mb-2">
                            {sense.pos && <span className="text-[21px] font-sans text-sm text-gray-500 ">{sense.pos}</span>}
                        </div>
                        {sense.scientificName && (
                            <span className="font-serif text-lg text-gray-600 ">
                                <span className="not-italic text-gray-400 mr-1 text-sm"></span>
                                <span dangerouslySetInnerHTML={{ __html: sense.scientificName }} />
                                <span className="not-italic text-gray-400 ml-1 text-sm"></span>
                            </span>
                        )}
                        {/* CORRECCIÓN 1: Inserción de Etimología en la entrada principal */}
                        {sense.etimologia && (
                            <div className="mb-2">
                                <span
                                    className="font-sans text-sm text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: sense.etimologia }}
                                />
                            </div>
                        )}

                        <div className="block">
                            {sense.definitions.map((def, idx) => (
                                <div key={idx} className="mb-3 last:mb-0 relative pl-6">
                                    <span className="absolute left-0 top-0 font-bold text-brand-blue text-lg">
                                        {idx + 1}.
                                    </span>
                                    <div className="mb-1">
                                        {def.usageLabel && <span className="text-[21px] font-bold tracking-wider text-brand-accent mr-2 ">{def.usageLabel}</span>}
                                        {def.geographicLabel && <span className="text-[21px] font-bold tracking-wider text-brand-accent mr-2">{def.geographicLabel}</span>}
                                        {def.contorno && (
                                            <span
                                                className="font-sans text-lg text-gray-500 mr-1 italic"
                                                dangerouslySetInnerHTML={{ __html: def.contorno }}
                                            />
                                        )}

                                        <span className="font-sans text-lg leading-relaxed text-gray-800" dangerouslySetInnerHTML={{ __html: def.text }} />
                                        {def.examples.length > 0 && <span className="font-sans text-lg font-bold">:</span>}
                                    </div>
                                    {/* Examples */}
                                    {def.examples.length > 0 && (
                                        <div className="pl-4 mt-1 border-l-2 border-gray-200">
                                            {def.examples.map((example, exIdx) => (
                                                <p key={exIdx} className="font-serif italic text-gray-600 mb-1 last:mb-0">
                                                    <span dangerouslySetInnerHTML={{ __html: `${example.text}` }} />
                                                    {example.source && <span className="text-gray-400 not-italic text-lg font-sans ml-2">— {example.source}</span>}
                                                    {example.adHocLabel && <span className="text-gray-500 not-italic text-lg font-sans ml-2">{example.adHocLabel}</span>}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {lemma.subentries.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="space-y-6 pl-0 md:pl-8">
                        {lemma.subentries.map((sub, idx) => (
                            <div key={idx} className="border-l-2 border-brand-accent/20 pl-4">
                                <h3
                                    className="font-serif font-bold text-xl text-brand-blue mb-3 px-4 md:px-0 break-words [&>u]:decoration-brand-accent [&>u]:underline-offset-4"
                                    dangerouslySetInnerHTML={{ __html: sub.sign }}
                                />
                                {sub.sense.map((s, i) => (
                                    <SenseBlock
                                        key={i}
                                        sense={s}
                                        isSubentry
                                        senseIndex={i + 1}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SenseBlock({ sense, isSubentry = false, senseIndex }: { sense: Sense; isSubentry?: boolean; senseIndex?: number }) {
    return (
        <div className={`text-gray-800 ${isSubentry ? "mt-2" : ""}`}>
            <div className="flex items-baseline gap-2 mb-1">
                {sense.pos && <span className="text-[21px] font-sans text-sm text-gray-500 ">{sense.pos}</span>}
            </div>

            {sense.scientificName && (
                <span className="font-serif text-base text-gray-600">
                    <span className="not-italic text-gray-400 mr-1 text-sm"></span>
                    <span dangerouslySetInnerHTML={{ __html: sense.scientificName }} />
                    <span className="not-italic text-gray-400 ml-1 text-sm"></span>
                </span>
            )}

            {sense.etimologia && (
                <div className="mb-2">
                    <span className="font-sans text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: sense.etimologia }} />
                </div>
            )}

            <div className="block">
                {sense.definitions.map((def, idx) => (
                    <div key={idx} className="mb-3 last:mb-0 relative pl-6">
                        <span className="absolute left-0 top-0 font-bold text-brand-blue text-lg">
                            {idx + 1}.
                        </span>
                        <div className="mb-1">
                            {def.usageLabel && <span className="text-[21px] font-bold tracking-wider text-brand-accent  mr-2">{def.usageLabel}</span>}
                            {def.geographicLabel && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-2 ">{def.geographicLabel}</span>}
                            {def.contorno && <span className="font-sans text-lg text-gray-500 mr-1 italic" dangerouslySetInnerHTML={{ __html: def.contorno }} />}
                            <span className="font-sans text-lg leading-relaxed text-gray-800" dangerouslySetInnerHTML={{ __html: def.text }} />
                            {def.examples.length > 0 && <span className="font-sans text-lg font-bold">:</span>}
                        </div>

                        {def.examples.length > 0 && (
                            <div className="pl-4 mt-1 border-l-2 border-gray-200">
                                {def.examples.map((ex, i) => (
                                    <p key={i} className="font-serif italic text-gray-600 mb-1 last:mb-0">
                                        <span dangerouslySetInnerHTML={{ __html: `${ex.text}` }} />
                                        {ex.source && <span className="text-gray-400 not-italic text-lg font-sans ml-2">— {ex.source}</span>}
                                        {ex.adHocLabel && <span className="text-gray-500 not-italic text-lg font-sans ml-2">{ex.adHocLabel}</span>}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}