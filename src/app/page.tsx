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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
    <main className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-brand-accent selection:text-white">
      {/* Header */}
      <header className="border-b border-brand-blue sticky top-0 z-20 bg-brand-blue text-white shadow-md">
        <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-12">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight mb-8 text-center">
            ECUATORIANISMOS
          </h1>
          <div className="flex gap-4 items-start max-w-4xl mx-auto">
            <div className="flex-grow">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden mt-1 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Abrir filtros"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2">
            <FilterSidebar
              availableFilters={availableFilters}
              filters={filters}
              setFilters={setFilters}
              className="w-full sticky top-32"
            />
          </div>

          {/* Results */}
          <div className="md:col-span-9 lg:col-span-10">
            <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-2">
              <span className="font-sans text-sm font-bold uppercase tracking-widest text-brand-blue">
                Resultados: {lemmas.length}
              </span>
            </div>

            {lemmas.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-2xl font-serif font-bold text-gray-400 mb-4">Sin resultados</p>
                <button
                  onClick={() => { setSearchQuery(''); setFilters({}); }}
                  className="text-brand-blue border-b border-brand-blue hover:text-brand-accent hover:border-brand-accent transition-all"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {lemmas.slice(0, 50).map((lemma, idx) => (
                  <EntryCard
                    key={`lemma.lemmaSign-${idx}`}
                    lemma={lemma}
                    onShowIncidences={handleShowIncidences}
                  />
                ))}
                {lemmas.length > 50 && (
                  <div className="text-center py-12 border-t border-gray-200 mt-8">
                    <span className="font-sans text-xs uppercase tracking-widest text-gray-500">
                      Mostrando 50 de {lemmas.length}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-brand-blue text-white">
              <h2 className="font-serif text-xl font-bold">Filtros</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <FilterSidebar
                availableFilters={availableFilters}
                filters={filters}
                setFilters={setFilters}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

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
