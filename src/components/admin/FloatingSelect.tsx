'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface FloatingSelectOption {
  label: string;
  value: string;
}

interface FloatingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | FloatingSelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
}

export default function FloatingSelect({
  label,
  value,
  onChange,
  options,
  placeholder = '-- Select --',
  disabled = false,
  required = false,
  className = '',
  error,
}: FloatingSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to { label, value } format
  const normalizedOptions: FloatingSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        const nextIndex = currentIndex < normalizedOptions.length - 1 ? currentIndex + 1 : 0;
        onChange(normalizedOptions[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : normalizedOptions.length - 1;
        onChange(normalizedOptions[prevIndex].value);
      }
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const borderColor = error
    ? '#ef4444'
    : isOpen
    ? 'var(--primary-color, #ce962e)'
    : value
    ? '#0f172a'
    : '#94a3b8';

  const labelColor = error
    ? '#ef4444'
    : isOpen
    ? 'var(--primary-color, #ce962e)'
    : value
    ? '#0f172a'
    : '#64748b';

  return (
    <div
      ref={containerRef}
      className={`floating-select-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        margin: '0.8rem 0',
      }}
    >
      {/* Trigger Box */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '48px',
          padding: '0.8rem 1.4rem',
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          border: `1.5px solid ${disabled ? '#e2e8f0' : borderColor}`,
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(15, 23, 42, 0.08)'
            : 'none',
        }}
      >
        {/* Floating Label on top border notch */}
        <span
          style={{
            position: 'absolute',
            top: '-10px',
            left: '12px',
            backgroundColor: '#ffffff',
            padding: '0 6px',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: disabled ? '#94a3b8' : labelColor,
            lineHeight: 1,
            pointerEvents: 'none',
            letterSpacing: '0.3px',
            zIndex: 2,
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </span>

        {/* Selected Value or Placeholder */}
        <span
          style={{
            fontSize: '1.4rem',
            color: selectedOption ? '#1e293b' : '#94a3b8',
            fontWeight: selectedOption ? 600 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingRight: '1rem',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Dropdown Chevron */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: disabled ? '#cbd5e1' : '#475569',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            maxHeight: '230px',
            overflowY: 'auto',
            zIndex: 1200,
            padding: '4px 0',
            animation: 'fadeInDown 0.15s ease-out',
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div
              style={{
                padding: '12px 16px',
                fontSize: '1.35rem',
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#334155';
                    }
                  }}
                  style={{
                    padding: '10px 16px',
                    fontSize: '1.4rem',
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? '#0f172a' : '#334155',
                    backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && (
        <span style={{ fontSize: '1.2rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}
