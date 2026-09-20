'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable from '@/components/admin/DataTable';
import UIDropdown from '@/components/UIDropdown';
import { ListPagination, usePagination } from '@/components/admin/ListPagination';
import { ModuleShell, useAdminFetch } from '@/components/admin/ModuleBits';

interface Task {
  _id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  assignedTo?: { name: string } | null;
  projectId?: { _id: string; name: string } | string | null;
}

interface Project {
  _id: string;
  name: string;
}

const projName = (t: Task) => (t.projectId && typeof t.projectId === 'object' ? t.projectId.name : '—');
const projId = (t: Task) => {
  if (!t.projectId) return '';
  return typeof t.projectId === 'object' ? t.projectId._id : String(t.projectId);
};

export default function AdminTasksHub() {
  const { data, loading, refresh } = useAdminFetch<{ tasks: Task[] }>('/api/tasks');
  const { data: pData } = useAdminFetch<{ projects: Project[] }>('/api/projects');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [projectTouched, setProjectTouched] = useState(false);

  const tasks = useMemo(() => data?.tasks || [], [data]);

  const projectOptions = useMemo(() => {
    const fromApi = pData?.projects || [];
    if (fromApi.length > 0) return fromApi;
    // Fallback: derive from tasks (populated projectId) if projects API is empty/slow
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      const id = projId(t);
      if (id && !map.has(id)) map.set(id, projName(t));
    });
    return Array.from(map.entries()).map(([_id, name]) => ({ _id, name }));
  }, [pData, tasks]);

  // Default to latest project (API returns newest first). Runs once when options load.
  useEffect(() => {
    if (!projectTouched && !projectFilter && projectOptions.length > 0) {
      setProjectFilter(projectOptions[0]._id);
    }
  }, [projectOptions, projectTouched, projectFilter]);

  const effectiveProject = projectFilter || 'all';

  const selectedProjectName: string | null = useMemo(() => {
    if (effectiveProject === 'all') return null;
    const fromList = projectOptions.find((p) => p._id === effectiveProject)?.name;
    if (fromList) return fromList;
    const fromTask = tasks.find((t) => projId(t) === effectiveProject);
    return fromTask ? projName(fromTask) : null;
  }, [effectiveProject, projectOptions, tasks]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false;
      if (effectiveProject !== 'all' && projId(t) !== effectiveProject) return false;
      if (!s) return true;
      return `${t.title} ${t.category} ${projName(t)}`.toLowerCase().includes(s);
    });
  }, [tasks, q, filter, effectiveProject]);

  const { page, totalPages, paged, setPage, pageSize } = usePagination(rows, 10, [q, filter, effectiveProject]);

  const cycle = async (t: Task) => {
    const next = t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'todo';
    const res = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t._id, status: next }),
    });
    if (res.ok) refresh();
  };

  const open = tasks.filter((t) => t.status !== 'done').length;

  return (
    <ModuleShell
      title="Tasks"
      sub={`${tasks.length} tasks · ${open} open across all projects`}
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ahf-search-inline">
            <i className="fas fa-search"></i>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
          </div>
        </div>
      )}
    >
      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UIDropdown
              label="Filter by project"
              value={effectiveProject}
              style={{ minWidth: 240 }}
              options={[
                { value: 'all', label: `All projects (${tasks.length})` },
                ...projectOptions.map((p) => {
                  const count = tasks.filter((t) => projId(t) === p._id).length;
                  return { value: p._id, label: `${p.name}${count ? ` (${count})` : ''}` };
                }),
              ]}
              onChange={(v) => { setProjectTouched(true); setProjectFilter(v); }}
            />
            <UIDropdown
              label="Task status filter"
              value={filter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'todo', label: 'Todo' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'done', label: 'Done' },
              ]}
              onChange={(v) => setFilter(v as typeof filter)}
            />
            {effectiveProject !== 'all' && (
              <button
                className="ahf-btn ahf-btn-ghost ahf-btn-sm"
                onClick={() => { setProjectTouched(true); setProjectFilter('all'); }}
              >
                <i className="fas fa-times"></i> Clear project
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="ahf-panel list-compact">
        <div className="ahf-panel-head">
          <div>
            <h3>{effectiveProject === 'all' ? 'All tasks' : `Tasks · ${selectedProjectName || 'Selected project'}`}</h3>
            <p>
              {effectiveProject === 'all'
                ? 'Click the box to advance status — manage details inside the project'
                : `${rows.length} task${rows.length === 1 ? '' : 's'} in this project — click the box to advance status`}
            </p>
          </div>
          {effectiveProject !== 'all' && (
            <Link href={`/admin/projects/${effectiveProject}`} className="ahf-btn ahf-btn-ghost ahf-btn-sm">
              <i className="fas fa-arrow-right"></i> Open project
            </Link>
          )}
        </div>
        <DataTable
            columns={[
              {
                key: 't', header: 'Task', render: (t) => (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={() => cycle(t)} title="Advance status" style={{ width: 22, height: 22, borderRadius: 6, border: '1.5px solid #a27341', background: t.status === 'done' ? '#2e7d4f' : t.status === 'in_progress' ? '#e8b23f' : '#fff', color: '#fff', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
                      {t.status === 'done' ? '✓' : ''}
                    </button>
                    <div>
                      <div style={{ fontWeight: 600, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: '#8a7a66' }}>{t.category}{t.assignedTo?.name ? ` · ${t.assignedTo.name}` : ''}{t.dueDate ? ` · due ${new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'p', header: 'Project', render: (t) => (
                  projId(t) ? <Link href={`/admin/projects/${projId(t)}`}>{projName(t)}</Link> : <span>—</span>
                ),
              },
              { key: 's', header: 'Status', render: (t) => <StatusBadge status={t.status.replace('_', ' ')} /> },
            ]}
            rows={paged}
            emptyText={effectiveProject === 'all'
              ? 'No tasks yet — they are seeded automatically when a quotation becomes a project.'
              : 'No tasks in this project for the current search / status.'}
            loading={loading}
          />
        {!loading && (
          <ListPagination page={page} totalPages={totalPages} pageSize={pageSize} total={rows.length} onPage={setPage} />
        )}
      </div>
    </ModuleShell>
  );
}
