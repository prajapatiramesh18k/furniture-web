'use client';

import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  boldWord?: string;
  afterBold?: string;
  subtext?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  message,
  boldWord,
  afterBold,
  subtext,
  confirmText = 'Yes',
  cancelText = 'No, Go Back',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 99999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2.4rem 2.2rem 2rem',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.22)',
          animation: 'fadeInScale 0.2s ease-out',
        }}
      >
        <p
          style={{
            fontSize: '1.5rem',
            color: '#0f172a',
            lineHeight: 1.55,
            margin: '0 0 0.8rem 0',
            fontWeight: 500,
          }}
        >
          {message}{' '}
          {boldWord && (
            <strong style={{ fontWeight: 800, color: '#0f172a' }}>
              {boldWord}
            </strong>
          )}
          {afterBold && ` ${afterBold}`}
        </p>

        {subtext && (
          <p
            style={{
              fontSize: '1.25rem',
              color: '#64748b',
              lineHeight: 1.5,
              margin: '0 0 2rem 0',
            }}
          >
            {subtext}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: '1.2rem',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: subtext ? '0' : '1.8rem',
          }}
        >
          <button
            type="button"
            onClick={onConfirm}
            style={{
              minWidth: '130px',
              padding: '0.75rem 1.8rem',
              border: '1.8px solid #ef4444',
              backgroundColor: '#ffffff',
              color: '#ef4444',
              borderRadius: '8px',
              fontSize: '1.35rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            {confirmText}
          </button>

          <button
            type="button"
            onClick={onCancel}
            style={{
              minWidth: '130px',
              padding: '0.75rem 1.8rem',
              border: '1.8px solid #1d4ed8',
              backgroundColor: '#ffffff',
              color: '#1d4ed8',
              borderRadius: '8px',
              fontSize: '1.35rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
