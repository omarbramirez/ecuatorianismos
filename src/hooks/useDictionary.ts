import { useState, useEffect, useMemo, useCallback } from 'react';
import { Lemma, Sense, Definition } from '@/lib/parser';

export type FilterOptions = {
    initialLetter?: string;
    pos?: string;
    usage?: string;
    geography?: string;
};

export function useDictionary() {
    const [lemmas, setLemmas] = useState<Lemma[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({});

    useEffect(() => {
        fetch('/api/parse')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then((data) => {
                setLemmas(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // --- Derived Data for Filters (Sin cambios, lógica correcta) ---
    const availableFilters = useMemo(() => {
        const letters = new Set<string>();
        const pos = new Set<string>();
        const usage = new Set<string>();
        const geography = new Set<string>();

        lemmas.forEach((lemma) => {
            if (lemma.lemmaSign) {
                // Normalizamos para asegurar que 'Á' caiga en 'A' si se desea, 
                // o lo dejamos estricto según la base. Usaremos charAt directo.
                letters.add(lemma.lemmaSign.charAt(0).toUpperCase());
            }
            lemma.senses.forEach((sense) => {
                if (sense.pos) pos.add(sense.pos);
                sense.definitions.forEach((def) => {
                    if (def.usageLabel) usage.add(def.usageLabel);
                    if (def.geographicLabel) geography.add(def.geographicLabel);
                });
            });
            lemma.subentries.forEach((sub) => {
                sub.sense.forEach(s => {
                    if (s.pos) pos.add(s.pos);
                    s.definitions.forEach(d => {
                        if (d.usageLabel) usage.add(d.usageLabel);
                        if (d.geographicLabel) geography.add(d.geographicLabel);
                    })
                })
            });
        });

        return {
            letters: Array.from(letters).sort(),
            pos: Array.from(pos).sort(),
            usage: Array.from(usage).sort(),
            geography: Array.from(geography).sort(),
        };
    }, [lemmas]);

    // --- Filtering & Searching Logic (MODO ESTRICTO) ---
    const filteredLemmas = useMemo(() => {
        let results = lemmas;

        // 1. Filtros (Primero filtramos por categoría, letra, etc.)
        if (filters.initialLetter) {
            results = results.filter(l => l.lemmaSign.toUpperCase().startsWith(filters.initialLetter!));
        }

        if (filters.pos) {
            results = results.filter(l => 
                l.senses.some(s => s.pos === filters.pos) ||
                l.subentries.some(sub => sub.sense.some(s => s.pos === filters.pos))
            );
        }

        if (filters.usage) {
            results = results.filter(l => 
                l.senses.some(s => s.definitions.some(d => d.usageLabel === filters.usage)) ||
                l.subentries.some(sub => sub.sense.some(s => s.definitions.some(d => d.usageLabel === filters.usage)))
            );
        }

        if (filters.geography) {
            results = results.filter(l => 
                l.senses.some(s => s.definitions.some(d => d.geographicLabel === filters.geography)) ||
                l.subentries.some(sub => sub.sense.some(s => s.definitions.some(d => d.geographicLabel === filters.geography)))
            );
        }

        // 2. Búsqueda de Texto (La parte delicada)
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim();
            
            results = results.filter((lemma) => {
                // A. Coincidencia Lema Principal (STARTS WITH)
                // "Si no lo sabe, ni modes": Solo mostramos si empieza con lo que escribe.
                const matchesSign = lemma.lemmaSign.toLowerCase().startsWith(q);

                // B. Coincidencia Subentradas (STARTS WITH + LIMPIEZA)
                // Esto permite encontrar "hecho funda" escribiendo "hecho f...", 
                // pero NO escribiendo "funda".
                const matchesSubentries = lemma.subentries.some(s => {
                    // Importante: Limpiamos HTML antes de comparar
                    const cleanSign = s.sign.replace(/<[^>]+>/g, "").toLowerCase();
                    return cleanSign.startsWith(q);
                });

                // C. ELIMINADO: Búsqueda en definiciones (matchesDef).
                // Razón: Genera ruido y viola el principio de búsqueda exacta.

                return matchesSign || matchesSubentries;
            });
        }

        // 3. Ordenamiento
        // Mantenemos la lógica de ordenamiento que tenías, es buena.
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return results.sort((a, b) => {
                const aSign = a.lemmaSign.toLowerCase();
                const bSign = b.lemmaSign.toLowerCase();

                if (aSign === q && bSign !== q) return -1;
                if (bSign === q && aSign !== q) return 1;

                // Como ya filtramos por startsWith, el orden alfabético es lo natural
                return aSign.localeCompare(bSign);
            });
        }

        return results;
    }, [lemmas, searchQuery, filters]);

    // --- Incidence Logic (Sin cambios mayores, solo optimización) ---
    const getIncidences = useCallback((term: string) => {
        if (!term) return [];

        const escapeRegExp = (string: string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const escapedTerm = escapeRegExp(term);
        // Mantenemos tu regex unicode, es excelente para este caso.
        const regex = new RegExp(`(?<!\\p{L})${escapedTerm}(?!\\p{L})`, 'iu');

        return lemmas.filter(l => {
            if (l.lemmaSign.toLowerCase() === term.toLowerCase()) return false;

            // Buscamos en plainText, que ya viene limpio del parser
            const inSenses = l.senses.some(s => s.definitions.some(d => regex.test(d.plainText)));
            const inSubentries = l.subentries.some(sub => sub.sense.some(s => s.definitions.some(d => regex.test(d.plainText))));

            return inSenses || inSubentries;
        });
    }, [lemmas]);

    return {
        lemmas: filteredLemmas,
        allLemmas: lemmas, // Exportamos todos para el handleNavigate global
        loading,
        error,
        availableFilters,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        getIncidences
    };
}