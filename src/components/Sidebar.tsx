import { BookOpen, Users, Info, MapPin, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function Sidebar({ isOpen, onClose, activeSection, onNavigate }: SidebarProps) {
  
  const menuItems = [
    { id: 'dictionary', label: 'Diccionario', icon: BookOpen },
    { id: 'presentation', label: 'Presentación', icon: Info },
    { id: 'credits', label: 'Equipo de trabajo', icon: Users }, // "Créditos" o "Equipo técnico"
    { id: 'contact', label: 'Dónde adquirirlo', icon: MapPin },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white z-50 w-[280px] shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-gray-100
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-auto lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          
          {/* 1. Cabecera con Logos (Academia + 150 Años) */}
          <div className="p-6 border-b border-gray-100 bg-brand-blue/5">
            <div className="flex justify-between items-start lg:hidden mb-4">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Menú</span>
               <button onClick={onClose} className="text-gray-500 hover:text-brand-blue">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            {/* Placeholder para los Logos */}
            <div className="flex gap-4 justify-center items-center mb-2">
               {/* Aquí irán las imágenes reales cuando te las envíen */}
               <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-center text-gray-500">
                 Logo<br/>AEL
               </div>
               <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-center text-gray-500">
                 Logo<br/>150
               </div>
            </div>
            <p className="text-center font-serif font-bold text-brand-blue text-sm leading-tight">
              Academia Ecuatoriana<br/>de la Lengua
            </p>
          </div>

          {/* 2. Menú de Navegación */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose(); // Cierra en móvil al seleccionar
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                  ${activeSection === item.id 
                    ? 'bg-brand-blue text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-brand-blue'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'text-gray-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* 3. Espacio para la Portada (Oso/Sello distintivo) */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="aspect-[3/4] bg-white border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm p-4 text-center">
              <span>Espacio para imagen de Portada (Oso)</span>
            </div>
          </div>

          {/* Footer pequeño */}
          <div className="p-4 text-center text-[10px] text-gray-400">
            © 2025 AEL
          </div>
        </div>
      </aside>
    </>
  );
}