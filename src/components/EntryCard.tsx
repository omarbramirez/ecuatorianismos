/* components/EntryCard.tsx */

import { Lemma, Sense } from "@/lib/parser";
import React from "react";

// --- TIPOS ---
interface EntryCardProps {
    lemma: Lemma;
    onNavigate: (term: string) => void;
}

// --- 1. COMPONENTE DE HIDRATACIÓN DE TEXTO CON HEURÍSTICA ---
const RichDefinitionText = ({
    htmlContent,
    onLinkClick
}: {
    htmlContent: string;
    onLinkClick: (term: string) => void
}) => {
    // A. LÓGICA HEURÍSTICA (Referencia Implícita)
    // Caso: <Definition><Bold>tumbaburros</Bold></Definition>
    // El string llega como: "<b>tumbaburros</b>" (sin texto alrededor)
    const trimmedContent = htmlContent.trim();
    // Regex: Empieza con <b>, captura contenido, termina con </b>.
    // El ^ y $ aseguran que no haya nada más antes o después.
    const implicitMatch = trimmedContent.match(/^<b>(.*?)<\/b>$/);

    if (implicitMatch) {
        // Es una referencia pura (tipo "zumbaburros -> tumbaburros")
        const term = implicitMatch[1].trim();

        // Verificamos si el término ya trae el "+" visualmente o no
        // Si quieres forzar que siempre se vea el "+", podrías agregarlo aquí,
        // pero por ahora respetamos el texto original del XML.
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    // Limpiamos cualquier "+" que pudiera venir dentro del bold por accidente
                    const cleanTerm = term.replace('+', '').trim();
                    onLinkClick(cleanTerm);
                }}
                className="font-bold text-brand-blue hover:text-brand-accent hover:underline decoration-2 underline-offset-2 transition-colors cursor-pointer bg-transparent border-none p-0 align-baseline"
                title={`Ir a la entrada de: ${term}`}
            >
                {term}
            </button>
        );
    }

    // B. LÓGICA ESTÁNDAR (Referencia Explícita con "+")
    // Caso: "Madurar una fruta... <Bold>amarillear+ </Bold>..."
    // Usamos el regex robusto que creamos antes (tolerante a espacios)
    const crossRefRegex = /<b>(.*?)\s*\+\s*<\/b>/g;

    if (!htmlContent.match(crossRefRegex)) {
        return <span dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    const parts = htmlContent.split(/(<b>.*?\s*\+\s*<\/b>)/g);

    return (
        <span>
            {parts.map((part, index) => {
                const match = part.match(/<b>(.*?)\s*\+\s*<\/b>/);

                if (match) {
                    const term = match[1].trim();
                    return (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                onLinkClick(term);
                            }}
                            className="font-bold text-brand-blue hover:text-brand-accent hover:underline decoration-2 underline-offset-2 transition-colors cursor-pointer bg-transparent border-none p-0 align-baseline"
                            title={`Ir a la definición de: ${term}`}
                        >
                            {term} +
                        </button>
                    );
                }
                return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
            })}
        </span>
    );
};

// --- 2. BLOQUE DE SENTIDO (SENSE) ---
function SenseBlock({
    sense,
    onNavigate,
    isSubentry = false
}: {
    sense: Sense;
    onNavigate: (term: string) => void;
    senseIndex?: number;
    isSubentry?: boolean;
}) {
    return (
        <div className={`text-gray-800 ${isSubentry ? "mt-2" : ""}`}>
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
                {sense.pos && (
                    <span className="text-[21px] font-sans text-sm text-gray-500">
                        {sense.pos}
                    </span>
                )}
                {sense.scientificName && (
                    <span className={`font-serif text-gray-600 ${isSubentry ? "text-base" : "text-lg"}`}>
                        <span className="not-italic text-gray-400 mr-1 text-sm"></span>
                        <span dangerouslySetInnerHTML={{ __html: sense.scientificName }} />
                        <span className="not-italic text-gray-400 ml-1 text-sm"></span>
                    </span>
                )}
            </div>

            {sense.etimologia && (
                <div className="mb-2">
                    <span
                        className="font-sans text-sm text-gray-600 [&>i]:font-serif [&>i]:italic"
                        dangerouslySetInnerHTML={{ __html: sense.etimologia }}
                    />
                </div>
            )}

            <div className="block">
                {sense.definitions.map((def, idx) => (
                    <div key={idx} className="mb-3 last:mb-0 relative pl-6">
                        <span className="absolute left-0 top-0 font-bold text-brand-blue text-lg select-none">
                            {idx + 1}.
                        </span>

                        <div className="mb-1">
                            {def.usageLabel && (
                                <span className="text-[21px] font-bold tracking-wider text-brand-accent mr-2">
                                    {def.usageLabel}
                                </span>
                            )}

                            {def.geographicLabel && (
                                <span className={
                                    isSubentry
                                        ? "text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-2"
                                        : "text-[21px] font-bold tracking-wider text-brand-accent mr-2"
                                }>
                                    {def.geographicLabel}
                                </span>
                            )}

                            {def.contorno && (
                                <span
                                    className="font-sans text-lg text-gray-500 mr-1 italic"
                                    dangerouslySetInnerHTML={{ __html: def.contorno }}
                                />
                            )}

                            {/* TEXTO ENRIQUECIDO CON HEURÍSTICA */}
                            <span className="font-sans text-lg leading-relaxed text-gray-800">
                                <RichDefinitionText
                                    htmlContent={def.text}
                                    onLinkClick={onNavigate}
                                />
                            </span>

                            {def.examples.length > 0 && <span className="font-sans text-lg font-bold">:</span>}
                        </div>

                        {def.examples.length > 0 && (
                            <div className="pl-4 mt-1 border-l-2 border-gray-200">
                                {def.examples.map((ex, i) => (
                                    <p key={i} className="font-serif italic text-gray-600 mb-1 last:mb-0">
                                        <span dangerouslySetInnerHTML={{ __html: ex.text }} />
                                        {ex.source && (
                                            <span className="text-gray-400 not-italic text-lg font-sans ml-2">
                                                — {ex.source}
                                            </span>
                                        )}
                                        {ex.adHocLabel && (
                                            <span className="text-gray-500 not-italic text-lg font-sans ml-2">
                                                {ex.adHocLabel}
                                            </span>
                                        )}
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

// --- 3. COMPONENTE PRINCIPAL (EntryCard) ---
export function EntryCard({ lemma, onNavigate }: EntryCardProps) {
    return (
        <div className="bg-white border-b border-gray-200 py-8 hover:bg-gray-50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-blue tracking-tight">
                    {lemma.lemmaSign}
                </h2>
            </div>

            {lemma.variants && (
                <p className="text-sm text-gray-500 mb-6 font-sans">
                    Variantes:{" "}
                    <span className="italic font-serif text-gray-700">
                        {Array.isArray(lemma.variants) ? lemma.variants.join(", ") : lemma.variants}
                    </span>
                </p>
            )}

            {lemma.etimologia && (
                <div className="mb-6 p-3 bg-gray-50 border-l-4 border-brand-accent/30 rounded-r">
                    <p className="font-serif text-gray-700 text-lg">
                        <span className="font-sans text-xs font-bold uppercase text-gray-400 mr-2 tracking-wider">
                            Etimología
                        </span>
                        <span
                            dangerouslySetInnerHTML={{ __html: lemma.etimologia }}
                            className="[&>i]:font-serif [&>i]:italic"
                        />
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {lemma.senses.map((sense, index) => (
                    <SenseBlock
                        key={index}
                        sense={sense}
                        onNavigate={onNavigate}
                    />
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
                                        isSubentry={true}
                                        senseIndex={i + 1}
                                        onNavigate={onNavigate}
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