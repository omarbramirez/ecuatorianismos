/* components/EntryCard.tsx */
import { Lemma, Sense } from "@/lib/parser";
import React from "react";
import { ArrowUpRight } from "lucide-react";

// --- TIPOS ---
interface EntryCardProps {
    lemma: Lemma;
    onNavigate: (term: string) => void;
    // NUEVA PROP: Función para verificar si un lema existe en la BD
    checkExists?: (term: string) => boolean;
}

// --- 1. COMPONENTE DE HIDRATACIÓN (INTELIGENTE) ---
const RichDefinitionText = ({
    htmlContent,
    onLinkClick,
    checkExists
}: {
    htmlContent: string;
    onLinkClick: (term: string) => void;
    checkExists?: (term: string) => boolean;
}) => {
    if (!htmlContent) return null;

    const parts = htmlContent.split(/(<b>.*?<\/b>)/g);

    return (
        <span>
            {parts.map((part, index) => {
                const boldMatch = part.match(/^<b>(.*?)<\/b>$/);

                if (boldMatch) {
                    const rawText = boldMatch[1];
                    // Limpieza básica (quitar +, números)
                    const visualText = rawText.replace(/[+\d]/g, '').trim();
                    // Limpieza para búsqueda (quitar puntuación final)
                    const navigationTerm = visualText.replace(/[.,:;]+$/, '').trim();

                    // --- LÓGICA DE DECISIÓN (CRITERIO "PLÁTANO VERDE") ---
                    let shouldSplit = false;

                    // Solo intentamos dividir si hay espacios y tenemos la función de verificación
                    if (navigationTerm.includes(' ') && checkExists) {
                        // Si la frase completa NO existe como lema/subentrada, entonces dividimos
                        // Ej: "plátano verde" -> No existe -> Split
                        // Ej: "a golpe" -> Sí existe -> No Split
                        if (!checkExists(navigationTerm)) {
                            shouldSplit = true;
                        }
                    }

                    // CASO A: FRASE COMPUESTA NO REGISTRADA (Renderizar palabra por palabra)
                    if (shouldSplit) {
                        const words = visualText.split(/\s+/);
                        return (
                            <span key={index} className="inline-flex flex-wrap gap-x-1 items-baseline">
                                {words.map((word, wIdx) => {
                                    // Limpiamos cada palabra individualmente para el link
                                    const wordLink = word.replace(/[.,:;]+$/, '').trim();
                                    return (
                                        <button
                                            key={wIdx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onLinkClick(wordLink);
                                            }}
                                            className="font-bold text-brand-blue hover:text-brand-accent hover:underline decoration-2 underline-offset-2 transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-baseline gap-0.5 align-baseline group/link"
                                            title={`Ir a: ${wordLink}`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: word }} />
                                            <ArrowUpRight 
                                                className="w-3 h-3 inline-block opacity-50 group-hover/link:opacity-100 transition-opacity relative top-[1px]" 
                                                strokeWidth={2.5} 
                                            />
                                        </button>
                                    );
                                })}
                            </span>
                        );
                    }

                    // CASO B: LEMA ÚNICO O FRASE REGISTRADA (Comportamiento estándar)
                    return (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                onLinkClick(navigationTerm);
                            }}
                            className="font-bold text-brand-blue hover:text-brand-accent hover:underline decoration-2 underline-offset-2 transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-baseline gap-0.5 align-baseline group/link"
                            title={`Ir a la entrada de: ${navigationTerm}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: visualText }} />
                            <ArrowUpRight 
                                className="w-3.5 h-3.5 inline-block opacity-60 group-hover/link:opacity-100 transition-opacity relative top-[2px]" 
                                strokeWidth={2.5} 
                            />
                        </button>
                    );
                }

                return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
            })}
        </span>
    );
};

// ... SenseBlock se mantiene igual pero pasando checkExists ...

function SenseBlock({
    sense,
    onNavigate,
    checkExists, // Recibimos la prop
    isSubentry = false
}: {
    sense: Sense;
    onNavigate: (term: string) => void;
    checkExists?: (term: string) => boolean; // Definimos tipo
    senseIndex?: number;
    isSubentry?: boolean;
}) {
    return (
        <div className={`text-gray-800 ${isSubentry ? "mt-2" : ""}`}>
            {/* ... Cabecera del Sentido (sin cambios) ... */}
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
                 {/* ... (código existente) ... */}
                 {sense.senseNumber && (
                    <span className="font-bold text-brand-blue text-lg mr-1">
                        {sense.senseNumber}.
                    </span>
                )}
                {sense.pos && (
                    <span className="text-[21px] font-sans text-sm text-gray-500 italic">
                        {sense.pos}
                    </span>
                )}
                 {sense.scientificName && (
                    <span className={`font-serif text-gray-600 ${isSubentry ? "text-base" : "text-lg"}`}>
                        <span dangerouslySetInnerHTML={{ __html: sense.scientificName }} />
                    </span>
                )}
            </div>
            
            {/* Etimología Sense */}
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
                            {def.acepcion ? def.acepcion : `${idx + 1}.`}
                        </span>

                        <div className="mb-1">
                             {/* ... Marcas (Uso, geo, utc) sin cambios ... */}
                             <div className="inline">
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
                                {def.utc && (
                                    <span className="text-xs font-mono font-bold text-gray-400 mr-2 border border-gray-300 rounded px-1">
                                        {def.utc}
                                    </span>
                                )}
                            </div>

                            {def.contorno && (
                                <span
                                    className="font-sans text-lg text-gray-500 mr-1 italic"
                                    dangerouslySetInnerHTML={{ __html: def.contorno }}
                                />
                            )}

                            {/* TEXTO DE DEFINICIÓN (Pasamos checkExists) */}
                            <span className="font-sans text-lg leading-relaxed text-gray-800">
                                <RichDefinitionText
                                    htmlContent={def.text}
                                    onLinkClick={onNavigate}
                                    checkExists={checkExists} // <--- AQUÍ
                                />
                            </span>

                            {def.examples.length > 0 && <span className="font-sans text-lg font-bold">:</span>}
                        </div>

                        {/* Ejemplos (Pasamos checkExists) */}
                        {def.examples.length > 0 && (
                            <div className="pl-4 mt-1 border-l-2 border-gray-200">
                                {def.examples.map((ex, i) => (
                                    <p key={i} className="font-serif italic text-gray-600 mb-1 last:mb-0">
                                        <RichDefinitionText 
                                            htmlContent={ex.text}
                                            onLinkClick={onNavigate}
                                            checkExists={checkExists} // <--- AQUÍ
                                        />
                                        {ex.source && (
                                            <span className="text-gray-400 not-italic text-sm font-sans ml-2 block sm:inline">
                                                — {ex.source}
                                            </span>
                                        )}
                                        {ex.adHocLabel && (
                                            <span className="text-gray-500 not-italic text-sm font-sans ml-2 block sm:inline opacity-75">
                                                [{ex.adHocLabel}]
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
export function EntryCard({ lemma, onNavigate, checkExists }: EntryCardProps) {
    return (
        <div className="bg-white border-b border-gray-200 py-8 hover:bg-gray-50 transition-colors group">
            {/* ... Encabezado y Variantes sin cambios ... */}
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
            {lemma.observations && (
                <div className="mb-6 p-3 bg-blue-50/50 border-l-4 border-gray-300 rounded-r">
                    <p className="font-serif text-gray-700 text-lg">
                        <span className="font-sans text-xs font-bold uppercase text-gray-400 mr-2 tracking-wider">
                            Observaciones
                        </span>
                        {lemma.observations}
                    </p>
                </div>
            )}

            {/* Sentidos Principales */}
            <div className="space-y-6">
                {lemma.senses.map((sense, index) => (
                    <SenseBlock
                        key={index}
                        sense={sense}
                        onNavigate={onNavigate}
                        checkExists={checkExists} // <--- Pasamos la prop
                    />
                ))}
            </div>

            {/* Subentradas */}
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
                                        checkExists={checkExists} // <--- Pasamos la prop
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