import React from 'react';

/**
 * Interface para la estructura de datos de una abreviatura.
 * Garantiza tipado estricto para el mapeo de datos.
 */
interface AbbreviationEntry {
    abbr: string;
    definition: string;
    category?: 'grammar' | 'geography' | 'usage'; // Categorización opcional para futuros filtros
}

/**
 * Base de datos extraída del documento "Diccionario Final AEL-37-38.pdf".
 * Se ha respetado la ortografía y puntuación original del documento académico.
 */
const ABBREVIATIONS_DATA: AbbreviationEntry[] = [
    { abbr: 'adj.', definition: 'adjetivo' },
    { abbr: 'adv.', definition: 'adverbio' },
    { abbr: 'Amz.', definition: 'Amazonía' },
    { abbr: 'C.', definition: 'Costa' },
    { abbr: 'Cc.', definition: 'Costa centro' },
    { abbr: 'Cn.', definition: 'Costa norte' },
    { abbr: 'Cs.', definition: 'Costa sur' },
    { abbr: 'coloq.', definition: 'coloquial' },
    { abbr: 'delinc.', definition: 'delincuencial' },
    { abbr: 'desp.', definition: 'despectivo' },
    { abbr: 'euf.', definition: 'eufemismo' },
    { abbr: 'f.', definition: 'sustantivo de género femenino' },
    { abbr: 'fórm.', definition: 'fórmula' },
    { abbr: 'Gal.', definition: 'Galápagos' },
    { abbr: 'hist.', definition: 'histórico' },
    { abbr: 'hum.', definition: 'humorístico' },
    { abbr: 'interj.', definition: 'interjección' },
    { abbr: 'intr.', definition: 'verbo intransitivo' },
    { abbr: 'irón.', definition: 'irónico' },
    { abbr: 'loc.', definition: 'locución' },
    { abbr: 'loc. adv.', definition: 'locución adverbial' },
    { abbr: 'loc. conj.', definition: 'locución conjuntiva' },
    { abbr: 'loc. interj.', definition: 'locución interjectiva' },
    { abbr: 'loc. sust.', definition: 'locución sustantiva' },
    { abbr: 'loc. sust./adj.', definition: 'locución sustantiva y adjetiva' },
    { abbr: 'loc. verb.', definition: 'locución verbal' },
    { abbr: 'm.', definition: 'sustantivo de género masculino' },
    { abbr: 'm. y f.', definition: 'sustantivo masculino y femenino' },
    { abbr: 'm.-f.', definition: 'sustantivo masculino o femenino' },
    { abbr: 'malson.', definition: 'malsonante' },
    { abbr: 'obsol.', definition: 'obsolescente' },
    { abbr: 'pl.', definition: 'plural' },
    { abbr: 'pop.', definition: 'popular' },
    { abbr: 'prnl.', definition: 'verbo pronominal' },
    { abbr: 'rur.', definition: 'rural' },
    { abbr: 'S.', definition: 'Sierra' },
    { abbr: 'Sc.', definition: 'Sierra centro' },
    { abbr: 'Sn.', definition: 'Sierra norte' },
    { abbr: 'Ss.', definition: 'Sierra sur' },
    { abbr: 'spp.', definition: 'después de un género, se refiere a más de una especie sin nombre específico' },
    { abbr: 'tr.', definition: 'verbo transitivo' },
    { abbr: 'u. t. c. adj.', definition: 'usado también como adjetivo' },
    { abbr: 'U. m. en dim.', definition: 'usado más en diminutivo' },
    { abbr: 'U. m. en pl.', definition: 'usado más en plural' },
    { abbr: 'vulg.', definition: 'vulgar' },
];

/**
 * Componente AbbreviationsSection
 * Renderiza la sección de "Guía de uso > Abreviaturas" del Diccionario.
 * Utiliza un diseño de tarjetas compactas para facilitar la referencia rápida.
 */
const AbbreviationsSection: React.FC = () => {
    return (
        <section className="max-w-4xl mx-auto bg-white  overflow-hidden ">
            <div className="p-8 md:p-12 border-b border-gray-50">
                <h2 className="text-3xl font-serif font-bold text-[#1a365d] mb-8 tracking-tight border-l-4 border-blue-600 pl-6">
                    Abreviaturas
                </h2>

                {/* Contenedor de Tabla/Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header de la Tabla (Visible en desktop) */}
                    <div className="hidden md:grid grid-cols-12 bg-slate-100 border-b border-slate-200 py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-3">Abreviatura</div>
                        <div className="col-span-9">Desglose / Significado</div>
                    </div>

                    {/* Cuerpo de Datos */}
                    <div className="divide-y divide-slate-100">
                        {ABBREVIATIONS_DATA.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-12 hover:bg-slate-50 transition-colors duration-150 group"
                            >
                                {/* Columna Abreviatura */}
                                <div className="col-span-1 md:col-span-3 py-3 px-6 flex items-center">
                                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded text-sm group-hover:bg-blue-100 transition-colors">
                                        {item.abbr}
                                    </span>
                                </div>

                                {/* Columna Definición */}
                                <div className="col-span-1 md:col-span-9 py-2 px-6 md:py-3 flex items-center">
                                    <span className="text-slate-700 text-sm leading-relaxed">
                                        {item.definition}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AbbreviationsSection;