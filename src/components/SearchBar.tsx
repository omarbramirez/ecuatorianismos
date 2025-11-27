import { useEffect, useState } from "react";

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue, onChange]);

    return (
        <div className="w-full">
            <div className="relative group">
                <input
                    type="text"
                    className="w-full py-3 pl-4 pr-12 bg-white/10 border border-white/20 rounded-sm text-white placeholder-white/60 focus:bg-white focus:text-brand-blue focus:placeholder-gray-400 outline-none transition-all font-sans"
                    placeholder="Buscar palabra..."
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                        className="text-white/60 group-focus-within:text-brand-blue w-5 h-5 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
