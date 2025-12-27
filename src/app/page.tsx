// app/page.tsx
"use client";
import { useState } from "react";
import { useDictionary } from "@/hooks/useDictionary";
import { SearchBar } from "@/components/SearchBar";
import { EntryCard } from "@/components/EntryCard";

import { Lemma } from "@/lib/parser";
import { Sidebar } from "@/components/Sidebar"; // <--- IMPORTAR SIDEBAR
import { Menu } from "lucide-react"; // <--- IMPORTAR ICONO MENU

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

  // Estados de UI
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dictionary'); // 'dictionary' | 'presentation' | 'credits' | 'contact'

  // Estados del Diccionario
  const [incidenceTerm, setIncidenceTerm] = useState<string | null>(null);
  const [incidenceResults, setIncidenceResults] = useState<Lemma[]>([]);
  const [selectedLemma, setSelectedLemma] = useState<Lemma | null>(null);

  const handleShowIncidences = (term: string) => {
    const results = getIncidences(term);
    setIncidenceResults(results);
    setIncidenceTerm(term);
  };

  const checkLemmaExists = (term: string): boolean => {
    if (!term) return false;
    const cleanTerm = term.toLowerCase().trim();
    if (allLemmas.some(l => l.lemmaSign.toLowerCase() === cleanTerm)) return true;
    const existsInSubentries = allLemmas.some(l =>
      l.subentries.some(sub =>
        sub.sign.replace(/<[^>]+>/g, "").toLowerCase().trim() === cleanTerm
      )
    );
    return existsInSubentries;
  };

  const handleSelectLemma = (lemma: Lemma) => {
    setSelectedLemma(lemma);
    setSearchQuery(lemma.lemmaSign);
    setActiveSection('dictionary'); // Si selecciona algo, forzamos la vista de diccionario
  };

  const handleNavigate = (term: string) => {
    const cleanTerm = term.trim().toLowerCase();
    let targetLemma = allLemmas.find(
      (l) => l.lemmaSign.toLowerCase() === cleanTerm
    );

    if (!targetLemma) {
      targetLemma = allLemmas.find((l) =>
        l.subentries.some((sub) => {
          const plainSubSign = sub.sign.replace(/<[^>]+>/g, "").toLowerCase().trim();
          return plainSubSign === cleanTerm;
        })
      );
    }

    if (targetLemma) {
      handleSelectLemma(targetLemma);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
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
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-brand-accent selection:text-white flex">

      {/* 1. SIDEBAR (Izquierda) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      {/* 2. CONTENIDO PRINCIPAL (Derecha) */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Header con Buscador Persistente */}
        <header className="border-b border-brand-blue bg-brand-blue text-white shadow-md sticky top-0 z-20">
          <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-8">

            <div className="flex items-center gap-4 mb-6 relative">
              {/* Botón Menú Móvil */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>

              <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight text-center flex-1 lg:text-left">
                ECUATORIANISMOS
              </h1>
            </div>

            <div className="max-w-3xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  if (val === '') setSelectedLemma(null);
                  if (val.length > 0) setActiveSection('dictionary'); // Si escribe, volvemos al diccionario
                }}
                suggestions={lemmas}
                onSelect={handleSelectLemma}
              />
            </div>
          </div>
        </header>

        {/* Cuerpo Dinámico según la Sección Activa */}
        <div className="flex-1 bg-white">
          <div className="max-w-[1200px] mx-auto px-6 py-12">

            {/* VISTA: DICCIONARIO (Tu código original) */}
            {activeSection === 'dictionary' && (
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                {selectedLemma ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EntryCard
                      lemma={selectedLemma}
                      onNavigate={handleNavigate}
                      checkExists={checkLemmaExists}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 lg:py-24 opacity-60">
                    <div className="flex gap-4 justify-center items-center">
                      {/* Aquí irán las imágenes reales cuando te las envíen */}
                      <div className="w-1/4 w-1/4 bg-gray-200 rounded-full flex items-center justify-center text-[18px] text-center text-gray-500">
                        Logo<br />AEL
                      </div>
                      <div className="w-1/4 w-1/4 bg-gray-200 rounded-full flex items-center justify-center text-[18px] text-center text-gray-500">
                        Logo<br />150
                      </div>
                    </div>
                    <img src="./cover.jpg" alt="cover" />
                  </div>
                )}
              </div>
            )}

            {/* VISTA: PRESENTACIÓN */}
            {activeSection === 'presentation' && (
              <div className="max-w-3xl mx-auto prose prose-lg prose-blue animate-in fade-in slide-in-from-left-4 duration-300">
                <h2 className="font-serif text-3xl text-brand-blue mb-6 border-b border-gray-100 pb-4">Presentación del diccionario</h2>
                <div className="text-gray-600 space-y-4">
                  <p className="italic text-gray-400">[Aquí irán los tres párrafos pequeños que enviará el cliente]</p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>
              </div>
            )}

            {/* VISTA: CRÉDITOS */}
            {activeSection === 'credits' && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-left-4 duration-300">
                <h2 className="font-serif text-3xl text-brand-blue mb-6 border-b border-gray-100 pb-4">Equipo de Trabajo</h2>
                <div className="bg-gray-50 p-8 rounded-lg border border-gray-100">
                  <p className="italic text-gray-400 text-center">[Aquí irá la lista de la Comisión de Lexicografía y el equipo técnico]</p>
                </div>
              </div>
            )}

            {/* VISTA: CONTACTO */}
            {activeSection === 'contact' && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-left-4 duration-300">
                <h2 className="font-serif text-3xl text-brand-blue mb-6 border-b border-gray-100 pb-4">Dónde adquirirlo</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-brand-blue mb-2">Academia Ecuatoriana de la Lengua</h3>
                    <p className="text-gray-600 mb-4">Venta física disponible en nuestras oficinas.</p>
                    <p className="text-sm text-gray-500">[Datos de contacto pendientes]</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Global */}
        <footer className="bg-gray-50 border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} Academia Ecuatoriana de la Lengua.
            <br />
            Todos los derechos reservados.
          </p>
        </footer>

      </main>
    </div>
  );
}