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
          <h2 className="text-2xl font-serif font-bold text-brand-blue mb-6 tracking-tight">
            Presentación del Diccionario
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed font-sans text-wrap">
            <p>
              [Texto Inicial]: Este proyecto representa un esfuerzo por documentar la riqueza léxica y las variaciones idiomáticas propias de nuestra región, consolidando una base de datos dinámica para la consulta académica.
            </p>
            <p>
              [Metodología]: A través de un riguroso proceso lexicográfico, se han categorizado términos y subentradas que reflejan la identidad lingüística contemporánea, permitiendo una navegación intuitiva y técnica.
            </p>
            <p>
              [Alcance]: El motor de búsqueda integrado permite explorar no solo lemas principales, sino también estructuras complejas dentro de las subentradas, garantizando una recuperación de información exhaustiva.
            </p>
          </div>
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