import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { formatCurrencyTable, getEstadoColor, DPTO_DISPLAY_NAMES } from '../utils/formatters';
import { getProjectsWithAlerts } from '../utils/dataProcessing';

const ITEMS_PER_PAGE = 10;

const ProjectList = ({ projects, onSelectProject }) => {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState('Monto Contratado (USD)');
  const [sortDir, setSortDir] = useState('desc');

  const alerts = useMemo(() => {
    const set = new Set(getProjectsWithAlerts(projects).map(p => p._id));
    return set;
  }, [projects]);

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (sortField === 'Monto Contratado (USD)' || sortField === 'Monto Desembolsado (USD)') {
        va = parseFloat(String(va).replace(',', '.')) || 0;
        vb = parseFloat(String(vb).replace(',', '.')) || 0;
      } else {
        va = String(va || '').toLowerCase();
        vb = String(vb || '').toLowerCase();
      }
      if (sortDir === 'asc') return va > vb ? 1 : va < vb ? -1 : 0;
      return va < vb ? 1 : va > vb ? -1 : 0;
    });
  }, [projects, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 opacity-50">
        <p className="text-lg font-medium">No se encontraron contratos</p>
        <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm opacity-70">
          Mostrando {page * ITEMS_PER_PAGE + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, sorted.length)} de {sorted.length} contratos
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--nav-border)' }}>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--gray)' }}>
              <th className="text-left px-3 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
Contrato
              </th>
              <th
                className="text-left px-3 py-2.5 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:opacity-80"
                style={{ color: 'var(--gold)' }}
                onClick={() => toggleSort('Organismo Financiador')}
              >
                Organismo <ArrowUpDown className="w-3 h-3 inline" />
              </th>
              <th
                className="text-right px-3 py-2.5 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:opacity-80"
                style={{ color: 'var(--gold)' }}
                onClick={() => toggleSort('Monto Contratado (USD)')}
              >
                Monto <ArrowUpDown className="w-3 h-3 inline" />
              </th>
              <th className="text-center px-3 py-2.5 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--gold)' }}>
                Depto.
              </th>
              <th className="text-center px-3 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => {
              const estadoColors = getEstadoColor(p['Estado del Crédito']);
              const hasAlert = alerts.has(p._id);
              return (
                <tr
                  key={p._id}
                  className="cursor-pointer transition-colors hover:opacity-90"
                  style={{ borderBottom: '1px solid var(--nav-border)' }}
                  onClick={() => onSelectProject(p)}
                >
                  <td className="px-3 py-2.5 max-w-xs">
                    <div className="flex items-start gap-1.5">
                      {hasAlert && (
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                      )}
                      <span className="font-medium truncate" style={{ color: 'var(--text)' }}>
                        {p['Nombre del Proyecto']}
                      </span>
                    </div>
                    {p.SISFIN && p.SISFIN !== '*' && (
                      <span className="text-xs opacity-50 ml-5">{p.SISFIN}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--text)' }}>
                    {p['Organismo Financiador']}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap" style={{ color: 'var(--text)' }}>
                    {formatCurrencyTable(p['Monto Contratado (USD)'])}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell" style={{ color: 'var(--text)' }}>
                    {DPTO_DISPLAY_NAMES[p.Departamento] || p.Departamento}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoColors.bg} ${estadoColors.text}`}>
                      {p['Estado del Crédito']}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-30"
            style={{ borderColor: 'var(--nav-border)', color: 'var(--text)' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page <= 2) {
                pageNum = i;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="w-8 h-8 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: page === pageNum ? 'var(--gold)' : 'transparent',
                    color: page === pageNum ? '#fff' : 'var(--text)',
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-30"
            style={{ borderColor: 'var(--nav-border)', color: 'var(--text)' }}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectList;