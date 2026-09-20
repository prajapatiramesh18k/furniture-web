'use client';

import QMSelect from './QMSelect';
import { DEPARTMENT_CONFIGS } from '@/lib/quotation/departments';
import { DEPARTMENT_IDS, type DepartmentId } from '@/lib/quotation/types';

export default function DepartmentSelector({
  value,
  onChange,
  branchValue,
  branchOptions,
  onBranchChange,
}: {
  value: DepartmentId;
  onChange: (d: DepartmentId) => void;
  branchValue?: string;
  branchOptions?: string[];
  onBranchChange?: (b: string) => void;
}) {
  return (
    <div className="quotation-section">
      <h3 className="quotation-section-title">Department & Branch</h3>
      <div className="qm-grid2">
        <div className="qm-field">
          <label className="qm-label" htmlFor="qm-department">
            <i className="fas fa-briefcase"></i> Select department <span className="qm-req">*</span>
          </label>
          <QMSelect
            label="Select department"
            value={value}
            options={DEPARTMENT_IDS.map((id) => DEPARTMENT_CONFIGS[id].name)}
            onChange={(name) => {
              const hit = DEPARTMENT_IDS.find((id) => DEPARTMENT_CONFIGS[id].name === name);
              if (hit) onChange(hit);
            }}
          />
        </div>
        {branchOptions && onBranchChange && (
          <div className="qm-field">
            <label className="qm-label" htmlFor="qm-branch">
              <i className="fas fa-code-branch"></i> Branch
            </label>
            <QMSelect label="Select branch" value={branchValue || ''} options={branchOptions} onChange={onBranchChange} />
          </div>
        )}
      </div>
      <div className="quotation-package-pills" style={{ marginTop: 10 }}>
        {DEPARTMENT_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`quotation-package-pill${value === id ? ' is-active' : ''}`}
            onClick={() => onChange(id)}
          >
            {DEPARTMENT_CONFIGS[id].short}
          </button>
        ))}
      </div>
    </div>
  );
}
