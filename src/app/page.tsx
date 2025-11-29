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
    searchQuery,
    setSearchQuery,
    getIncidences
  } = useDictionary();

  const [incidenceTerm, setIncidenceTerm] = useState<string | null>(null);
  const [incidenceResults, setIncidenceResults] = useState<Lemma[]>([]);
  const [selectedLemma, setSelectedLemma] = useState<Lemma | null>(null);

  const handleShowIncidences = (term: string) => {
    const results = getIncidences(term);
    setIncidenceResults(results);
    setIncidenceTerm(term);
  };

  const handleSelectLemma = (lemma: Lemma) => {
    setSelectedLemma(lemma);
    setSearchQuery(lemma.lemmaSign);
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
          <div className="max-w-4xl mx-auto">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                if (val === '') setSelectedLemma(null);
              }}
              suggestions={lemmas}
              onSelect={handleSelectLemma}
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-12">
        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
          {selectedLemma ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <EntryCard
                lemma={selectedLemma}
                onShowIncidences={handleShowIncidences}
              />
            </div>
          ) : (
            <div className="text-center py-24 opacity-50">
              <p className="text-2xl font-serif text-gray-400 mb-4">
                Escribe una palabra en el buscador para comenzar.
              </p>
              <div className="text-6xl text-gray-200">
                📖
              </div>
            </div>
          )}
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
