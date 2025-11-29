import { useEffect, useState, useRef } from "react";
import { Lemma } from "@/lib/parser";

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
    suggestions: Lemma[];
    onSelect: (lemma: Lemma) => void;
}

export function SearchBar({ value, onChange, suggestions, onSelect }: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue, onChange]);

    useEffect(() => {
        if (suggestions.length > 0 && localValue.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [suggestions, localValue]);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (lemma: Lemma) => {
        setLocalValue(lemma.lemmaSign);
        onChange(lemma.lemmaSign);
        onSelect(lemma);
        setShowSuggestions(false);
    };

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <div className="relative group z-30">
                <input
                    type="text"
                    className="w-full py-3 pl-4 pr-12 bg-white/10 border border-white/20 rounded-sm text-white placeholder-white/60 focus:bg-white focus:text-brand-blue focus:placeholder-gray-400 outline-none transition-all font-sans"
                    placeholder="Escribe una palabra..."
                    value={localValue}
                    onChange={(e) => {
                        setLocalValue(e.target.value);
                        if (!showSuggestions && e.target.value.length > 0) setShowSuggestions(true);
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0 && localValue.length > 0) setShowSuggestions(true);
                    }}
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

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute w-full bg-white text-gray-800 shadow-xl rounded-b-sm border-t border-gray-100 max-h-96 overflow-y-auto z-40 top-full left-0">
                    {suggestions.map((lemma, idx) => (
                        <li
                            key={`${lemma.lemmaSign}-${idx}`}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                            onClick={() => handleSelect(lemma)}
                        >
                            <span className="font-serif font-medium text-brand-blue block">
                                {lemma.lemmaSign}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
