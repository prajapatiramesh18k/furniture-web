'use client';

import React from 'react';

export function TrashIcon({
  size = 18,
  color = '#ef4444',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'block' }}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  iconSize?: number;
}

export default function DeleteButton({
  size = 34,
  iconSize = 18,
  title = 'Delete',
  style,
  onClick,
  ...props
}: DeleteButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#fee2e2',
        border: 'none',
        borderRadius: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        padding: 0,
        flexShrink: 0,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#fecaca';
        e.currentTarget.style.transform = 'scale(1.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fee2e2';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      {...props}
    >
      <TrashIcon size={iconSize} color="#ef4444" />
    </button>
  );
}
