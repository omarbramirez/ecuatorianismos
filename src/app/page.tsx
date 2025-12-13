// app/page.tsx
"use client";
import { useState } from "react";
import { useDictionary } from "@/hooks/useDictionary";
import { SearchBar } from "@/components/SearchBar";
import { EntryCard } from "@/components/EntryCard";
import { IncidenceList } from "@/components/IncidenceList";
import { Lemma } from "@/lib/parser";

export default function Page() {
  const {
    lemmas,
    allLemmas,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    getIncidences
  } = useDictionary();

  const [incidenceTerm, setIncidenceTerm] = useState<string | null>(null);
  const [incidenceResults, setIncidenceResults] = useState<Lemma[]>([]);
  const [selectedLemma, setSelectedLemma] = useState<Lemma | null>(null);

  // Mantenemos esta lógica por si se usa en otro lado
  const handleShowIncidences = (term: string) => {
    const results = getIncidences(term);
    setIncidenceResults(results);
    setIncidenceTerm(term);
  };

  const handleSelectLemma = (lemma: Lemma) => {
    setSelectedLemma(lemma);
    setSearchQuery(lemma.lemmaSign);
  };

  // --- LÓGICA DE NAVEGACIÓN MEJORADA (Soporte para Subentradas) ---
  const handleNavigate = (term: string) => {
    const cleanTerm = term.trim().toLowerCase();

    // 1. Intento A: Buscar coincidencia exacta en el LEMA PRINCIPAL
    // Ejemplo: Busca "hecho, -a" -> Encuentra "hecho, -a"
    let targetLemma = allLemmas.find(
      (l) => l.lemmaSign.toLowerCase() === cleanTerm
    );

    // 2. Intento B: Si falla, buscar dentro de las SUBENTRADAS
    // Ejemplo: Busca "hecho funda" -> El buscador revisa las subentradas y encuentra que pertenece al padre "hecho"
    if (!targetLemma) {
      targetLemma = allLemmas.find((l) =>
        l.subentries.some((sub) => {
          // Limpiamos el HTML del título de la subentrada (ej: "<u>hecho</u> funda")
          // para compararlo texto con texto ("hecho funda")
          const plainSubSign = sub.sign.replace(/<[^>]+>/g, "").toLowerCase().trim();
          return plainSubSign === cleanTerm;
        })
      );
    }

    if (targetLemma) {
      // ¡Éxito! Abrimos la ficha del padre que contiene la subentrada o el lema
      handleSelectLemma(targetLemma);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Fallback: Si definitivamente no existe, mostramos incidencias
      console.warn(`Lema no encontrado: ${term}, mostrando incidencias.`);
      handleShowIncidences(term);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl font-display font-bold animate-pulse text-brand-blue">CARGANDO...</div>
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
                // Si el usuario borra todo, limpiamos la selección
                if (val === '') setSelectedLemma(null);
              }}
              suggestions={lemmas}
              onSelect={handleSelectLemma}
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {selectedLemma ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <EntryCard
                lemma={selectedLemma}
                onNavigate={handleNavigate}
              />
            </div>
          ) : (
            <div className="text-center py-24 opacity-50">
              <p className="text-2xl font-serif text-gray-400 mb-4">
                Escribe una palabra en el buscador para comenzar.
              </p>
              <div className="text-6xl text-gray-200">📖</div>
            </div>
          )}
        </div>
      </div>

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