import React from 'react';
import { Code, Users, ArrowUpRight } from 'lucide-react';

/**
 * Interfaz para definir la estructura de un miembro del equipo.
 */
interface TeamMember {
    name: string;
    role?: string;
    isDeceased?: boolean; // Para manejar el símbolo '+' de autores fallecidos
}

// --- BASE DE DATOS DEL EQUIPO (Extraída del DOCX) ---

const ONLINE_LEXICOGRAPHERS: TeamMember[] = [
    { name: 'Valeria Elizabeth Guzmán Pérez', role: 'Coordinadora' },
    { name: 'Iskra Sashenka Silva Villacrés' },
    { name: 'Daniela Alejandra Vera Dávila' },
];

const DEV_TEAM: TeamMember[] = [
    { name: 'Omar Becerril Ramírez', role: 'Arquitectura y Desarrollo de Software' },
    { name: 'Víctor Adrián García Córdova', role: 'Consultoría en procesamiento digital' },
];

const COMMISSION_MEMBERS: TeamMember[] = [
    { name: 'Julio Pazos Barrera' },
    { name: 'Fernando Miño-Garcés', isDeceased: true },
    { name: 'Diego Araujo Sánchez' },
    { name: 'Simón Espinosa Cordero' },
    { name: 'Rodrigo Borja Cevallos', isDeceased: true },
    { name: 'Susana Cordero de Espinosa' },
    { name: 'Bruno Sáenz Andrade', isDeceased: true },
    { name: 'Marco Antonio Rodríguez' },
    { name: 'Fabián Corral Burbano de Lara' },
];

/**
 * Componente TeamAndAcquisitionSection
 * Muestra los créditos del proyecto y la información para adquirir la versión física.
 */
const TeamAndAcquisitionSection: React.FC = () => {
    return (
        <section className="max-w-4xl mx-auto bg-white  overflow-hidden ">
            <h2 className="text-3xl font-serif font-bold text-[#1a365d] mb-8 tracking-tight border-l-4 border-blue-600 pl-6">
                Equipo de Trabajo
            </h2>
            <div className="flex items-center gap-2 mb-6 text-blue-800">
                <h3 className="text-xl font-serif font-bold">Equipo Técnico</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 tracking-widest mb-4 border-b border-slate-200 pb-2">
                        Lexicógrafas de la versión en línea
                    </h4>
                    <ul className="space-y-3">
                        {ONLINE_LEXICOGRAPHERS.map((member, idx) => (
                            <li key={idx} className="text-slate-700">
                                <span className="font-semibold block">{member.name}</span>
                                {member.role && <span className="text-sm text-slate-500 italic">{member.role}</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 tracking-widest mb-4 border-b border-slate-200 pb-2">
                        Programadores
                    </h4>
                    <ul className="space-y-3">
                        {DEV_TEAM.map((member, idx) => (
                            <li key={idx} className="text-slate-700">
                                <span className="font-semibold block">{member.name}</span>
                                {member.role && <span className="text-sm text-slate-500 italic">{member.role}</span>}
                            </li>
                        ))}
                    </ul>
                </div>


                <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 tracking-widest mb-4 border-b border-slate-200 pb-2">
                        Comisión de Lexicografía
                    </h4>
                    <ul className="space-y-3">
                        {COMMISSION_MEMBERS.map((member, idx) => (
                            <li key={idx} className="text-slate-700 flex flex-row">
                                <span className="font-semibold block">{member.name}</span>
                                {member.role}
                                {member.isDeceased && (
                                   <ArrowUpRight className='cursor-pointer'/>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </section>
    );
};

export default TeamAndAcquisitionSection;