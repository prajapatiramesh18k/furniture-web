'use client';

import React, { useState } from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  prefixText?: string;
}

export default function FloatingInput({
  label,
  required,
  error,
  disabled,
  value,
  onChange,
  type = 'text',
  className = '',
  style,
  prefixText,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value !== undefined && value !== null && value !== '';

  const borderColor = error
    ? '#ef4444'
    : isFocused
    ? 'var(--primary-color, #1e40af)'
    : hasValue
    ? '#1e40af'
    : '#94a3b8';

  const labelColor = error
    ? '#ef4444'
    : isFocused || hasValue
    ? '#1e40af'
    : '#64748b';

  return (
    <div style={{ position: 'relative', width: '100%', margin: '0.8rem 0' }} className={className}>
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

      {prefixText ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            minHeight: '48px',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            border: `1.5px solid ${disabled ? '#e2e8f0' : borderColor}`,
            borderRadius: '8px',
            boxShadow: isFocused ? '0 0 0 3px rgba(30, 64, 175, 0.12)' : 'none',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 1.4rem',
              backgroundColor: '#f8fafc',
              borderRight: `1.5px solid ${isFocused ? 'rgba(30, 64, 175, 0.25)' : '#e2e8f0'}`,
              color: '#475569',
              fontSize: '1.4rem',
              fontWeight: 600,
              minHeight: '46px',
              userSelect: 'none',
              flexShrink: 0,
              transition: 'border-color 0.2s ease',
            }}
          >
            {prefixText}
          </div>
          <input
            type={type}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            style={{
              flex: 1,
              width: '100%',
              minHeight: '46px',
              padding: '0.8rem 1.4rem',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.4rem',
              fontWeight: 600,
              color: '#1e293b',
              outline: 'none',
              margin: 0,
              ...style,
            }}
            {...props}
          />
        </div>
      ) : (
        <input
          type={type}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '0.8rem 1.4rem',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            border: `1.5px solid ${disabled ? '#e2e8f0' : borderColor}`,
            borderRadius: '8px',
            fontSize: '1.4rem',
            fontWeight: 600,
            color: '#1e293b',
            outline: 'none',
            boxShadow: isFocused ? '0 0 0 3px rgba(30, 64, 175, 0.12)' : 'none',
            transition: 'all 0.2s ease',
            margin: 0,
            ...style,
          }}
          {...props}
        />
      )}

      {error && (
        <span style={{ fontSize: '1.2rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}
