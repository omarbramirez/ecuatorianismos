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
        <div className="w-full mb-12">
            <div className="relative group">
                <input
                    type="text"
                    className="w-full py-4 bg-transparent border-b-2 border-gray-300 focus:border-black text-3xl font-display font-medium placeholder-gray-400 outline-none transition-colors"
                    placeholder="Buscar palabra..."
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                />
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                    <svg
                        className="text-black w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
