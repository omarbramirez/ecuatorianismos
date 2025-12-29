// components/WelcomeModal.tsx
"use client";

import React from 'react';

export interface TeamMember {
  id: string;
  name: string;
  lastName: string;
  role: string;
  category: 'technical' | 'lexicographic' | 'commission';
}

export interface WelcomeContent {
  paragraphs: string[];
  team: TeamMember[];
}


interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col border border-brand-blue"
        role="dialog"
        aria-modal="true"
      >
        {/* Sección de Conceptualización */}
        <div className="p-8 border-b border-gray-100">
           <section className="max-w-4xl mx-auto my-12 bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
      <div className="p-8 md:p-12 border-b border-gray-50">
        <h2 className="text-3xl font-serif font-bold text-[#1a365d] mb-8 tracking-tight border-l-4 border-blue-600 pl-6">
          Presentación del Diccionario
        </h2>
        
        <div className="space-y-6 text-gray-800 leading-relaxed font-sans text-wrap">
          {/* Introducción Institucional */}
          <div className="group">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
              Naturaleza de la Obra
            </h3>
            <p className="text-lg text-gray-700">
              El <span className="font-semibold text-gray-900">Diccionario académico de ecuatorianismos (DAE)</span> es una obra lexicográfica de carácter descriptivo, sincrónico y diferencial que reúne más de diez mil palabras. Concebido para registrar y explicar el léxico del español tal como se habla y se escribe en el Ecuador, su publicación conmemora el sesquicentenario de la Academia Ecuatoriana de la Lengua, la institución cultural más antigua del país.
            </p>
          </div>

          {/* Fundamentación Metodológica */}
          <div className="group">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
              Metodología y Rigor Científico
            </h3>
            <p className="text-gray-700">
              Su elaboración es el resultado de más de diez años de trabajo continuo por parte de la Comisión de Lexicografía. La obra se sustenta en un robusto corpus textual propio (<span className="italic">corpha.ec</span>), que documenta la evolución lingüística desde 1930 hasta la actualidad. Cada entrada incorpora marcas diatópicas, diastráticas y diafásicas que orientan al usuario sobre la vitalidad, distribución y contextos de empleo de los ecuatorianismos.
            </p>
          </div>

          {/* Innovación y Alcance Digital */}
          <div className="group">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
              Alcance y Dimensión Digital
            </h3>
            <p className="text-gray-700">
              Esta primera edición completamente digital —y tercera edición impresa— trasciende la consulta tradicional mediante un motor de búsqueda especializado. El sistema permite una exploración exhaustiva de lemas, acepciones, etimologías y nombres científicos, facilitando actualizaciones dinámicas que integran al DAE plenamente en el siglo XXI como una memoria lingüística viva y reapropiada por la comunidad hispanohablante.
            </p>
          </div>
        </div>

        {/* Nota al pie de respaldo institucional */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Proyecto desarrollado con el respaldo del Ministerio de Educación, Deporte y Cultura del Ecuador.
          </p>
        </div>
      </div>
    </section>
        </div>

        {/* Sección de Equipo Técnico y Lexicográfico */}
        <div className="p-8 bg-gray-50/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">
            Equipo de Trabajo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-serif font-semibold text-brand-blue border-b border-brand-blue/20 pb-1">Técnico</h4>
              <ul className="text-sm space-y-2">
                <li className="flex flex-col"><span className="font-bold">Tu Nombre</span> <span className="text-gray-500 italic">Arquitectura & Fullstack</span></li>
                <li className="flex flex-col"><span className="font-bold">Víctor [Apellido]</span> <span className="text-gray-500 italic">Desarrollo Frontend</span></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-serif font-semibold text-brand-blue border-b border-brand-blue/20 pb-1">Lexicografía</h4>
              <ul className="text-sm space-y-2 text-wrap">
                <li className="font-bold text-gray-800 italic text-xs uppercase tracking-tighter">Cuerpo de Lexicógrafas</li>
                <li className="text-gray-600 italic">Comisión Lexicográfica (En proceso)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer / Acción */}
        <div className="p-6 bg-white border-t sticky bottom-0 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-brand-blue text-white font-bold rounded hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/20 uppercase tracking-widest text-xs"
          >
            Explorar Diccionario
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;