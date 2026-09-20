'use client';

import UIDropdown from '@/components/UIDropdown';

/**
 * Custom dropdown for the quotation editor (native <option> lists are
 * OS-rendered and can't be styled). Thin wrapper around the shared
 * UIDropdown — one implementation for the whole application.
 */
export default function QMSelect({
  value,
  options,
  onChange,
  label,
  placeholder = '— Select —',
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
}) {
  return (
    <UIDropdown
      value={value}
      options={options}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
    />
  );
}
