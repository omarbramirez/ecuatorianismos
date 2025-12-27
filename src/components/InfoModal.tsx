import { X } from "lucide-react";

interface InfoModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function InfoModal({ title, isOpen, onClose, children }: InfoModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header Modal */}
                <div className="bg-brand-blue p-5 flex justify-between items-center shrink-0">
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">
                        {title}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Contenido Scrollable */}
                <div className="p-6 md:p-8 overflow-y-auto font-sans text-gray-700 leading-relaxed space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
}