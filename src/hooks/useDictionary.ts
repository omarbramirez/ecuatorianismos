import { useState, useEffect, useMemo, useCallback } from 'react';
import { Lemma, Sense, Definition } from '@/lib/parser';

export type FilterOptions = {
    initialLetter?: string;
    pos?: string; // Categoría gramatical
    usage?: string; // Marca de uso
    geography?: string; // Marca geográfica
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

    // --- Derived Data for Filters ---
    const availableFilters = useMemo(() => {
        const letters = new Set<string>();
        const pos = new Set<string>();
        const usage = new Set<string>();
        const geography = new Set<string>();

        lemmas.forEach((lemma) => {
            if (lemma.lemmaSign) {
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

    // --- Filtering & Searching Logic ---
    const filteredLemmas = useMemo(() => {
        const results = lemmas.filter((lemma) => {
            // 1. Text Search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesSign = lemma.lemmaSign.toLowerCase().includes(q);
                const matchesSubentries = lemma.subentries.some(s => s.sign.toLowerCase().includes(q));

                // Also search in definitions if needed, but primary search is usually on the sign
                // Let's include definition search for "richer" results
                const matchesDef = lemma.senses.some(s =>
                    s.definitions.some(d => d.plainText.toLowerCase().includes(q))
                );

                if (!matchesSign && !matchesSubentries && !matchesDef) return false;
            }

            // 2. Filters
            if (filters.initialLetter && !lemma.lemmaSign.toUpperCase().startsWith(filters.initialLetter)) {
                return false;
            }

            if (filters.pos) {
                const hasPos = lemma.senses.some(s => s.pos === filters.pos) ||
                    lemma.subentries.some(sub => sub.sense.some(s => s.pos === filters.pos));
                if (!hasPos) return false;
            }

            if (filters.usage) {
                const hasUsage = lemma.senses.some(s => s.definitions.some(d => d.usageLabel === filters.usage)) ||
                    lemma.subentries.some(sub => sub.sense.some(s => s.definitions.some(d => d.usageLabel === filters.usage)));
                if (!hasUsage) return false;
            }

            if (filters.geography) {
                const hasGeo = lemma.senses.some(s => s.definitions.some(d => d.geographicLabel === filters.geography)) ||
                    lemma.subentries.some(sub => sub.sense.some(s => s.definitions.some(d => d.geographicLabel === filters.geography)));
                if (!hasGeo) return false;
            }

            return true;
        });

        // Sort by relevance if there is a search query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return results.sort((a, b) => {
                const aSign = a.lemmaSign.toLowerCase();
                const bSign = b.lemmaSign.toLowerCase();

                // 1. Exact match
                if (aSign === q && bSign !== q) return -1;
                if (bSign === q && aSign !== q) return 1;

                // 2. Starts with
                const aStarts = aSign.startsWith(q);
                const bStarts = bSign.startsWith(q);
                if (aStarts && !bStarts) return -1;
                if (bStarts && !aStarts) return 1;

                // 3. Alphabetical fallback
                return aSign.localeCompare(bSign);
            });
        }

        return results;
    }, [lemmas, searchQuery, filters]);

    // --- Incidence Logic ---
    const getIncidences = useCallback((term: string) => {
        if (!term) return [];
        const lowerTerm = term.toLowerCase();

        // Find lemmas where the definition contains the term
        // We exclude the lemma itself to avoid self-reference
        return lemmas.filter(l => {
            if (l.lemmaSign.toLowerCase() === lowerTerm) return false;

            const inSenses = l.senses.some(s => s.definitions.some(d => d.plainText.toLowerCase().includes(lowerTerm)));
            const inSubentries = l.subentries.some(sub => sub.sense.some(s => s.definitions.some(d => d.plainText.toLowerCase().includes(lowerTerm))));

            return inSenses || inSubentries;
        });
    }, [lemmas]);

    return {
        lemmas: filteredLemmas,
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
