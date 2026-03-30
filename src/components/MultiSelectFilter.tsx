"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface MultiSelectFilterProps {
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export default function MultiSelectFilter({ options, selectedValues, onChange, placeholder = "전체" }: MultiSelectFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close options when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleCheckboxChange = (value: string) => {
        let newValues: string[];
        if (selectedValues.includes(value)) {
            newValues = selectedValues.filter(v => v !== value);
        } else {
            newValues = [...selectedValues, value];
        }
        onChange(newValues);
    };

    const handleSelectAll = () => {
        if (selectedValues.length === options.length) {
            onChange([]);
        } else {
            onChange([...options]);
        }
    };

    const displayLabel = selectedValues.length === 0 
        ? placeholder 
        : selectedValues.length === 1 
            ? selectedValues[0] 
            : `${selectedValues[0]} 외 ${selectedValues.length - 1}개`;

    return (
        <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block', width: '100%', marginTop: '0.25rem' }}>
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: "0.4rem 0.6rem", 
                    fontSize: "0.8rem", 
                    border: "1px solid #d1d5db", 
                    borderRadius: "0.25rem", 
                    backgroundColor: "white", 
                    cursor: "pointer", 
                    color: selectedValues.length > 0 ? "#111827" : "#6b7280",
                    fontWeight: selectedValues.length > 0 ? 600 : "normal"
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayLabel}</span>
                <ChevronDown size={14} style={{ flexShrink: 0, marginLeft: '0.25rem' }} />
            </div>

            {isOpen && (
                <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    marginTop: '0.25rem', 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.375rem', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    zIndex: 50 
                }}>
                    <div 
                        onClick={(e) => { e.stopPropagation(); handleSelectAll(); }}
                        style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}
                    >
                        <input 
                            type="checkbox" 
                            checked={selectedValues.length === options.length && options.length > 0} 
                            onChange={() => {}} 
                            style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>전체 선택</span>
                    </div>
                    {options.map((option, idx) => (
                        <div 
                            key={`${option}-${idx}`}
                            onClick={(e) => { e.stopPropagation(); handleCheckboxChange(option); }}
                            style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderBottom: idx < options.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <input 
                                type="checkbox" 
                                checked={selectedValues.includes(option)} 
                                onChange={() => {}} 
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
