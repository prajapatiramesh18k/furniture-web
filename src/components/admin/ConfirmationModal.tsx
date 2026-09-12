'use client';

import React from 'react';
import { TrashIcon } from './DeleteButton';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  boldWord?: string;
  afterBold?: string;
  subtext?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'danger' | 'primary';
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
  confirmButtonVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isPrimary = confirmButtonVariant === 'primary';
  const confirmBorderColor = isPrimary ? 'var(--primary-color)' : '#ef4444';
  const confirmTextColor = isPrimary ? 'var(--primary-color)' : '#ef4444';
  const confirmHoverBg = isPrimary ? '#fef8ee' : '#fef2f2';

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
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: isPrimary ? '#fef8ee' : '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.4rem',
          }}
        >
          {isPrimary ? (
            <i className="fas fa-check-circle" style={{ fontSize: '2.2rem', color: 'var(--primary-color)' }}></i>
          ) : (
            <TrashIcon size={24} color="#ef4444" />
          )}
        </div>

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
              border: `1.8px solid ${confirmBorderColor}`,
              backgroundColor: '#ffffff',
              color: confirmTextColor,
              borderRadius: '8px',
              fontSize: '1.35rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = confirmHoverBg;
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
              border: '1.8px solid #94a3b8',
              backgroundColor: '#ffffff',
              color: '#475569',
              borderRadius: '8px',
              fontSize: '1.35rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
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

export interface ConfirmOptions {
  message: string;
  boldWord?: string;
  afterBold?: string;
  subtext?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
}

export function useConfirmModal() {
  const [modalState, setModalState] = React.useState<ConfirmOptions & { isOpen: boolean }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const confirm = React.useCallback((options: ConfirmOptions) => {
    setModalState({
      ...options,
      isOpen: true,
    });
  }, []);

  const close = React.useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmModal = React.useCallback(() => {
    return (
      <ConfirmationModal
        isOpen={modalState.isOpen}
        message={modalState.message}
        boldWord={modalState.boldWord}
        afterBold={modalState.afterBold}
        subtext={modalState.subtext}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        confirmButtonVariant={modalState.confirmButtonVariant}
        onConfirm={async () => {
          close();
          await modalState.onConfirm();
        }}
        onCancel={close}
      />
    );
  }, [modalState, close]);

  return {
    confirm,
    close,
    ConfirmModal,
  };
}
