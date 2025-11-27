// app/page.tsx
"use client";
import { useState } from "react";
import { useDictionary } from "@/hooks/useDictionary";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { EntryCard } from "@/components/EntryCard";
import { IncidenceList } from "@/components/IncidenceList";
import { Lemma } from "@/lib/parser";

export default function Page() {
  const {
    lemmas,
    loading,
    error,
    availableFilters,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    getIncidences
  } = useDictionary();

  const [incidenceTerm, setIncidenceTerm] = useState<string | null>(null);
  const [incidenceResults, setIncidenceResults] = useState<Lemma[]>([]);

  const handleShowIncidences = (term: string) => {
    const results = getIncidences(term);
    setIncidenceResults(results);
    setIncidenceTerm(term);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl font-display font-bold animate-pulse">CARGANDO...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-mono">
        ERROR: {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="border-b-2 border-black sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-12">
          <h1 className="text-4xl md:text-8xl font-display font-bold text-black tracking-tighter mb-8 leading-[0.8] text-center">
            Ecuatorianismos
          </h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="md:col-span-3 lg:col-span-2">
            <FilterSidebar
              availableFilters={availableFilters}
              filters={filters}
              setFilters={setFilters}
            />
          </div>

          {/* Results */}
          <div className="md:col-span-9 lg:col-span-10">
            <div className="mb-8 flex justify-between items-end border-b border-black pb-2">
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500">
                Resultados: {lemmas.length}
              </span>
            </div>

            {lemmas.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-2xl font-display font-bold text-gray-400 mb-4">Sin resultados</p>
                <button
                  onClick={() => { setSearchQuery(''); setFilters({}); }}
                  className="text-black border-b border-black hover:bg-black hover:text-white transition-all"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {lemmas.slice(0, 50).map((lemma) => (
                  <EntryCard
                    key={lemma.lemmaSign}
                    lemma={lemma}
                    onShowIncidences={handleShowIncidences}
                  />
                ))}
                {lemmas.length > 50 && (
                  <div className="text-center py-12 border-t-2 border-black mt-8">
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-500">
                      Mostrando 50 de {lemmas.length}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Incidence Modal */}
      {incidenceTerm && (
        <IncidenceList
          term={incidenceTerm}
          incidences={incidenceResults}
          onClose={() => setIncidenceTerm(null)}
        />
      )}
    </main>
  );
}
