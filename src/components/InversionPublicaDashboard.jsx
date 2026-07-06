import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, BarChart3, Building, Eye, X, Activity, Download } from 'lucide-react';
import { exportInversionPublicaPDF } from '../utils/pdfExport';
import { 
  filterInversionProjects, 
  filterInversionRegistries, 
  calculateProjectKPIs, 
  calculateRegistryKPIs, 
  getTopMunicipalities,
  getInversionProjectsSectorDist,
  getInversionRegistriesSectorDist,
  getAdministrationTypes,
  getRegistryEjecutores,
  getInversionSectors,
  getRegistrySectors,
  allInversionProjects,
  allInversionRegistries
} from '../utils/dataProcessingInversionPublica';
import { DPTO_DISPLAY_NAMES } from '../utils/formatters';

const ITEMS_PER_PAGE = 15;

const getInversionProjectStateClass = (estado) => {
  const est = (estado || '').toLowerCase();
  if (est.includes('ejecución') || est.includes('adjudicado') || est.includes('proceso')) {
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-455 border border-emerald-200 dark:border-emerald-800';
  }
  if (est.includes('paralizado') || est.includes('retrasado') || est.includes('cancelado') || est.includes('desestimado') || est.includes('recisión')) {
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-455 border border-rose-200 dark:border-rose-800';
  }
  if (est.includes('cierre') || est.includes('informe') || est.includes('entrega') || est.includes('provisional') || est.includes('definitiva')) {
    return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-455 border border-blue-200 dark:border-blue-800';
  }
  return 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
};

const DonutChart = ({ data, labelField, valueField, countField, valueType = 'Bs.' }) => {
  const total = data.reduce((acc, d) => acc + (d[valueField] || 0), 0);
  const radius = 60;
  const innerRadius = 38;
  const cx = 80;
  const cy = 80;

  const colorsList = [
    '#d4af37', // Gold
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#6366f1'  // Indigo
  ];

  const slices = [];
  let angle = -90;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const val = d[valueField] || 0;
    const sweep = Math.max((val / (total || 1)) * 360, 0.1);
    const startRad = (angle * Math.PI) / 180;
    const endRad = ((angle + sweep) * Math.PI) / 180;

    const x1Outer = cx + radius * Math.cos(startRad);
    const y1Outer = cy + radius * Math.sin(startRad);
    const x2Outer = cx + radius * Math.cos(endRad);
    const y2Outer = cy + radius * Math.sin(endRad);
    const x1Inner = cx + innerRadius * Math.cos(endRad);
    const y1Inner = cy + innerRadius * Math.sin(endRad);
    const x2Inner = cx + innerRadius * Math.cos(startRad);
    const y2Inner = cy + innerRadius * Math.sin(startRad);

    const pathData = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${sweep > 180 ? 1 : 0} 0 ${x2Inner} ${y2Inner}`,
      'Z',
    ].join(' ');

    slices.push({
      label: d[labelField] || 'Otros',
      pathData,
      color: colorsList[i % colorsList.length],
      value: val,
      count: d[countField] || 0
    });
    angle += sweep;
  }

  const formatLegendValue = (val) => {
    if (valueType === 'Bs.') {
      return `Bs. ${(val / 1_000_000).toFixed(1)}M`;
    }
    return `${val.toLocaleString()} items`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
      {total > 0 ? (
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 160 160" className="w-36 h-36 shrink-0">
            {slices.map((s, i) => (
              <path
                key={i}
                d={s.pathData}
                fill={s.color}
                opacity={0.85}
                className="hover:opacity-100 transition-opacity cursor-pointer"
              >
                <title>{s.label}: {formatLegendValue(s.value)} ({s.count} registros)</title>
              </path>
            ))}
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold" style={{ fill: 'var(--text)' }}>
              {valueType === 'Bs.' ? 'Bs.' : 'Items'}
            </text>
          </svg>
        </div>
      ) : (
        <div className="w-36 h-36 shrink-0 flex items-center justify-center border border-dashed border-[var(--nav-border)] rounded-full">
          <span className="text-[10px] opacity-40">Sin datos</span>
        </div>
      )}

      <div className="flex-1 space-y-1.5 text-[10px] w-full max-h-36 overflow-y-auto pr-1 scrollbar-thin">
        {slices.slice(0, 6).map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="truncate max-w-[140px] font-semibold" style={{ color: 'var(--text)' }} title={s.label}>
              {s.label}
            </span>
            <span className="ml-auto opacity-70 whitespace-nowrap font-mono">
              {formatLegendValue(s.value)}
            </span>
          </div>
        ))}
        {slices.length > 6 && (
          <div className="text-[9px] opacity-50 italic pl-4">+{slices.length - 6} más</div>
        )}
      </div>
    </div>
  );
};

const InversionPublicaDashboard = ({ selectedDepto, selectedEstadosIP = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState('projects'); // 'projects' or 'registries'
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedEjecutor, setSelectedEjecutor] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState(null);

  // Reset filters when switching subtabs
  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    setSearchTerm('');
    setSelectedSector('');
    setSelectedAdmin('');
    setSelectedEjecutor('');
    setSelectedMuni('');
    setCurrentPage(1);
  };

  // Sector options
  const sectorOptions = useMemo(() => {
    return activeSubTab === 'projects' ? getInversionSectors() : getRegistrySectors();
  }, [activeSubTab]);

  // Administration options (Projects only)
  const adminOptions = useMemo(() => {
    return activeSubTab === 'projects' ? getAdministrationTypes() : [];
  }, [activeSubTab]);

  // Executor options (Registries only)
  const executorOptions = useMemo(() => {
    return activeSubTab === 'registries' ? getRegistryEjecutores() : [];
  }, [activeSubTab]);

  // Filtered lists
  const filteredData = useMemo(() => {
    if (activeSubTab === 'projects') {
      return filterInversionProjects({
        searchTerm,
        selectedDepto,
        selectedSector,
        selectedAdmin,
        selectedEstadosIP
      });
    } else {
      return filterInversionRegistries({
        searchTerm,
        selectedDepto,
        selectedSector,
        selectedEjecutor,
        selectedMunicipio: selectedMuni
      });
    }
  }, [activeSubTab, searchTerm, selectedDepto, selectedSector, selectedAdmin, selectedEjecutor, selectedMuni, selectedEstadosIP]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (activeSubTab === 'projects') {
      return calculateProjectKPIs(filteredData);
    } else {
      return calculateRegistryKPIs(filteredData);
    }
  }, [activeSubTab, filteredData]);

  // Sector distribution for chart
  const sectorDist = useMemo(() => {
    if (activeSubTab === 'projects') {
      return getInversionProjectsSectorDist(filteredData);
    } else {
      return getInversionRegistriesSectorDist(filteredData);
    }
  }, [activeSubTab, filteredData]);

  // Top municipalities for registries
  const topMunis = useMemo(() => {
    if (activeSubTab === 'registries') {
      return getTopMunicipalities(filteredData, selectedDepto);
    }
    return [];
  }, [activeSubTab, filteredData, selectedDepto]);

  // Project states distribution for donut chart
  const projectStatesDist = useMemo(() => {
    if (activeSubTab !== 'projects') return [];
    const states = {};
    filteredData.forEach(p => {
      const est = p.estado || 'Sin Registro';
      states[est] = (states[est] || 0) + 1;
    });
    return Object.entries(states)
      .map(([name, count]) => ({ name, count, total: count }))
      .sort((a, b) => b.count - a.count);
  }, [activeSubTab, filteredData]);

  // Total pages
  const totalPages = Math.max(Math.ceil(filteredData.length / ITEMS_PER_PAGE), 1);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format currencies
  const fmtBs = (val) => {
    if (val === null || val === undefined) return 'Bs. 0';
    return `Bs. ${val.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`;
  };

  const fmtPercent = (val) => {
    if (isNaN(val)) return '0%';
    return `${val.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row with Title and Export Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 border-[var(--nav-border)]">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            {selectedDepto
              ? `Departamento de ${DPTO_DISPLAY_NAMES[selectedDepto] || selectedDepto}`
              : 'Vista Nacional'}
          </h2>
          <p className="text-xs opacity-60">
            {activeSubTab === 'projects'
              ? `${filteredData.length.toLocaleString()} proyectos en filtros`
              : `${filteredData.length.toLocaleString()} registros en filtros`}
          </p>
        </div>
        <button
          onClick={() => exportInversionPublicaPDF(
            selectedDepto ? DPTO_DISPLAY_NAMES[selectedDepto] || selectedDepto : 'Nacional', 
            filteredData, 
            kpis, 
            activeSubTab
          )}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-90 shrink-0"
          style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
        >
          <Download className="w-4 h-4" />
          Exportar Resumen a PDF
        </button>
      </div>

      {/* Subtab Navigation */}
      <div className="flex border-b shrink-0 no-print" style={{ borderColor: 'var(--nav-border)' }}>
        <button
          onClick={() => handleSubTabChange('projects')}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer"
          style={{
            borderBottomColor: activeSubTab === 'projects' ? 'var(--gold)' : 'transparent',
            color: activeSubTab === 'projects' ? 'var(--gold)' : 'var(--text)',
            opacity: activeSubTab === 'projects' ? 1 : 0.6,
          }}
        >
          <BarChart3 className="w-4 h-4" />
          Proyectos de Inversión Pública ({allInversionProjects.length.toLocaleString()})
        </button>
        <button
          onClick={() => handleSubTabChange('registries')}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer"
          style={{
            borderBottomColor: activeSubTab === 'registries' ? 'var(--gold)' : 'transparent',
            color: activeSubTab === 'registries' ? 'var(--gold)' : 'var(--text)',
            opacity: activeSubTab === 'registries' ? 1 : 0.6,
          }}
        >
          <Activity className="w-4 h-4" />
          Registros de Inversión Pública ({allInversionRegistries.length.toLocaleString()})
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {activeSubTab === 'projects' ? (
          <>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Proyectos Totales</span>
              <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--gold)' }}>{kpis.cantidad.toLocaleString()}</h3>
              <p className="text-[10px] opacity-40 mt-1">En filtros activos</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Presupuesto Vigente 2026</span>
              <h3 className="text-sm font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">{fmtBs(kpis.totalPresupuesto)}</h3>
              <p className="text-[10px] opacity-40 mt-1">Acumulado 2025: {fmtBs(kpis.totalAcumulado)}</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Presupuesto Inicial 2026</span>
              <h3 className="text-sm font-bold mt-1.5 text-blue-600 dark:text-blue-400">{fmtBs(kpis.totalPresupuestoInicial)}</h3>
              <p className="text-[10px] opacity-40 mt-1">Aprobado inicialmente</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Ejecución Gestión 2026</span>
              <h3 className="text-sm font-bold mt-1.5 text-amber-600 dark:text-amber-400">{fmtBs(kpis.totalEjecucion2026)}</h3>
              <p className="text-[10px] opacity-40 mt-1">Devengado esta gestión</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Avance Físico Promedio</span>
              <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{fmtPercent(kpis.avgAvanceFisico)}</h3>
              <div className="w-full h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--gray)' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${Math.min(kpis.avgAvanceFisico, 100)}%`, backgroundColor: 'var(--gold)' }}></div>
              </div>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Avance Financiero Promedio</span>
              <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{fmtPercent(kpis.avgAvanceFinanciero)}</h3>
              <div className="w-full h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--gray)' }}>
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(kpis.avgAvanceFinanciero, 100)}%` }}></div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Registros</span>
              <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--gold)' }}>{kpis.cantidad.toLocaleString()}</h3>
              <p className="text-[10px] opacity-40 mt-1">Con georreferenciación</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Presupuesto Vigente 2026</span>
              <h3 className="text-sm font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">{fmtBs(kpis.totalPresupuesto)}</h3>
              <p className="text-[10px] opacity-40 mt-1">Programado general</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Avance Ejecución Monto</span>
              <h3 className="text-sm font-bold mt-1.5 text-blue-600 dark:text-blue-400">{fmtBs(kpis.totalAvanceMonto)}</h3>
              <p className="text-[10px] opacity-40 mt-1">Inversión acumulada</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Registros En Ejecución</span>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{kpis.obrasEnEjecucion.toLocaleString()}</h3>
              <p className="text-[10px] opacity-40 mt-1">Estado: En ejecución</p>
            </div>
            <div className="rounded-xl p-4 border col-span-1 sm:col-span-2 lg:col-span-2 animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Avance de Ejecución Promedio</span>
              <div className="flex items-center gap-4 mt-1">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{fmtPercent(kpis.avgAvancePorcentaje)}</h3>
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'var(--gray)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(kpis.avgAvancePorcentaje, 100)}%`, backgroundColor: 'var(--gold)' }}></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Grid of Charts and Municipalities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Distribution (Torta) */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
            Distribución Presupuestaria por Sector
          </h3>
          <DonutChart 
            data={sectorDist} 
            labelField={activeSubTab === 'projects' ? 'sector' : 'sector'} 
            valueField="total" 
            countField="count" 
            valueType="Bs."
          />
        </div>

        {/* Municipality Ranking (Torta) or Project States (Torta) */}
        {activeSubTab === 'registries' ? (
          <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
              Distribución por Municipio (Top en {selectedDepto || 'Nacional'})
            </h3>
            <DonutChart 
              data={topMunis} 
              labelField="municipio" 
              valueField="total" 
              countField="count" 
              valueType="Bs."
            />
          </div>
        ) : (
          <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
              Distribución por Estado de Proyecto
            </h3>
            <DonutChart 
              data={projectStatesDist} 
              labelField="name" 
              valueField="count" 
              countField="count" 
              valueType="count"
            />
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-xl p-4 border space-y-4 no-print" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código SISIN, municipio..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--gray)',
                borderColor: 'var(--nav-border)',
                color: 'var(--text)',
                '--tw-ring-color': 'var(--gold)',
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Sector Dropdown */}
            <select
              value={selectedSector}
              onChange={(e) => { setSelectedSector(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs rounded-lg border focus:outline-none"
              style={{ backgroundColor: 'var(--gray)', borderColor: 'var(--nav-border)', color: 'var(--text)' }}
            >
              <option value="">Todos los Sectores</option>
              {sectorOptions.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>

            {/* Subtab Specific Dropdowns */}
            {activeSubTab === 'projects' ? (
              <select
                value={selectedAdmin}
                onChange={(e) => { setSelectedAdmin(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 text-xs rounded-lg border focus:outline-none"
                style={{ backgroundColor: 'var(--gray)', borderColor: 'var(--nav-border)', color: 'var(--text)' }}
              >
                <option value="">Todas las Administraciones</option>
                {adminOptions.map(adm => (
                  <option key={adm} value={adm}>{adm}</option>
                ))}
              </select>
            ) : (
              <>
                <select
                  value={selectedEjecutor}
                  onChange={(e) => { setSelectedEjecutor(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 text-xs rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'var(--gray)', borderColor: 'var(--nav-border)', color: 'var(--text)' }}
                >
                  <option value="">Todos los Ejecutores</option>
                  {executorOptions.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Filtrar Municipio..."
                  value={selectedMuni}
                  onChange={(e) => { setSelectedMuni(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-1.5 text-xs rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'var(--gray)', borderColor: 'var(--nav-border)', color: 'var(--text)' }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
        <div className="overflow-x-auto">
          {activeSubTab === 'projects' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--nav-border)', backgroundColor: 'var(--gray)' }}>
                  <th className="p-3 font-semibold">SISIN</th>
                  <th className="p-3 font-semibold">Proyecto</th>
                  <th className="p-3 font-semibold">Departamento</th>
                  <th className="p-3 font-semibold text-right">Presupuesto Vigente</th>
                  <th className="p-3 font-semibold text-center">Av. Físico</th>
                  <th className="p-3 font-semibold text-center">Av. Financiero</th>
                  <th className="p-3 font-semibold">Estado</th>
                  <th className="p-3 font-semibold text-center no-print">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--nav-border)' }}>
                {paginatedData.map((p) => (
                  <tr key={p._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-[10px]">{p.sisin}</td>
                    <td className="p-3 font-semibold truncate max-w-xs">{p.nombre_proyecto}</td>
                    <td className="p-3">{DPTO_DISPLAY_NAMES[p.departamento_macro] || p.departamento_macro || '-'}</td>
                    <td className="p-3 text-right font-semibold">{fmtBs(p.presupuesto_vigente_2026_bs)}</td>
                    <td className="p-3 text-center">{fmtPercent(p.avance_fisico * 100)}</td>
                    <td className="p-3 text-center">{fmtPercent(p.avance_financiero * 100)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border font-medium whitespace-nowrap ${getInversionProjectStateClass(p.estado)}`}>
                        {p.estado || 'En proceso'}
                      </span>
                    </td>
                    <td className="p-3 text-center no-print">
                      <button 
                        onClick={() => setSelectedItem({ type: 'project', data: p })}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[var(--gold)]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center opacity-50">Ningún proyecto coincide con los filtros activos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--nav-border)', backgroundColor: 'var(--gray)' }}>
                  <th className="p-3 font-semibold">SISIN</th>
                  <th className="p-3 font-semibold">Registro</th>
                  <th className="p-3 font-semibold">Municipio (Depto.)</th>
                  <th className="p-3 font-semibold text-right">Presupuesto Vigente</th>
                  <th className="p-3 font-semibold text-right">Avance Monto</th>
                  <th className="p-3 font-semibold text-center">Av. Ejecución</th>
                  <th className="p-3 font-semibold">Ejecutor</th>
                  <th className="p-3 font-semibold text-center no-print">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--nav-border)' }}>
                {paginatedData.map((r) => (
                  <tr key={r._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-[10px]">{r.sisin}</td>
                    <td className="p-3 font-semibold truncate max-w-xs">{r.nombre_obra}</td>
                    <td className="p-3">{r.municipio} ({DPTO_DISPLAY_NAMES[r.departamento] || r.departamento})</td>
                    <td className="p-3 text-right font-semibold">{fmtBs(r.presupuesto_vigente_2026_bs)}</td>
                    <td className="p-3 text-right">{fmtBs(r.avance_ejecucion_monto_bs)}</td>
                    <td className="p-3 text-center font-semibold">{fmtPercent(r.avance_ejecucion_porcentaje * 100)}</td>
                    <td className="p-3 truncate max-w-[120px]">{r.ejecutor_dashboard}</td>
                    <td className="p-3 text-center no-print">
                      <button 
                        onClick={() => setSelectedItem({ type: 'registry', data: r })}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[var(--gold)]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center opacity-50">Ninguna obra coincide con los filtros activos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginator Footer */}
        <div className="flex items-center justify-between p-3 border-t text-xs no-print" style={{ borderColor: 'var(--nav-border)', backgroundColor: 'var(--gray)' }}>
          <span className="opacity-60">
            Mostrando {Math.min(filteredData.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredData.length, currentPage * ITEMS_PER_PAGE)} de {filteredData.length.toLocaleString()} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded border disabled:opacity-40"
              style={{ borderColor: 'var(--nav-border)', color: 'var(--text)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold">Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border disabled:opacity-40"
              style={{ borderColor: 'var(--nav-border)', color: 'var(--text)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in no-print">
          <div className="w-full max-w-2xl rounded-xl shadow-2xl border overflow-hidden max-h-[85vh] flex flex-col" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--nav-border)' }}>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                  Detalle del {selectedItem.type === 'project' ? 'Proyecto de Inversión' : 'Registro de Obra'}
                </h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:opacity-75">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="border-b pb-2 mb-2">
                <span className="opacity-50 uppercase text-[9px] font-bold">
                  {selectedItem.type === 'project' ? 'Proyecto de Inversión' : 'Registro de Inversión Pública'}
                </span>
                <h4 className="text-sm font-bold mt-0.5" style={{ color: 'var(--gold)' }}>
                  {selectedItem.data.nombre_proyecto || selectedItem.data.nombre_obra || 'Sin nombre'}
                </h4>
                <p className="font-mono text-[10px] opacity-60 mt-0.5">SISIN: {selectedItem.data.sisin || 'Sin registro'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(selectedItem.data).map(([key, val]) => {
                  if (key === '_id' || key === 'cronograma_proyecciones') return null;

                  // Format label: e.g. "ejecucion_acumulada_2025_bs" -> "Ejecucion Acumulada 2025 Bs"
                  const label = key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  let formattedVal = val;
                  if (val === null || val === undefined || val === '') {
                    formattedVal = '-';
                  } else if (typeof val === 'number') {
                    if (key.endsWith('_bs') || key.includes('monto')) {
                      formattedVal = fmtBs(val);
                    } else if (key.includes('avance') || key.includes('porcentaje')) {
                      formattedVal = fmtPercent(val <= 1 ? val * 100 : val);
                    } else {
                      formattedVal = val.toLocaleString();
                    }
                  } else if (typeof val === 'object') {
                    return null;
                  }

                  return (
                    <div key={key} className="p-3 rounded-lg border bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--nav-border)' }}>
                      <span className="opacity-50 block uppercase text-[9px] font-bold mb-0.5">{label}</span>
                      <span className="font-semibold text-xs break-words" style={{ color: 'var(--text)' }}>
                        {String(formattedVal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Cronograma Proyecciones */}
              {selectedItem.type === 'project' && selectedItem.data.cronograma_proyecciones && (
                <div className="border-t pt-3 mt-4">
                  <span className="opacity-50 block uppercase text-[9px] font-bold mb-2">Cronograma de Proyecciones</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    {Object.entries(selectedItem.data.cronograma_proyecciones).map(([yr, val]) => (
                      <div key={yr} className="p-2 rounded bg-black/5 dark:bg-white/5 border" style={{ borderColor: 'var(--nav-border)' }}>
                        <span className="block font-bold opacity-60">{yr}</span>
                        <span>{val || '0'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-4 border-t" style={{ borderColor: 'var(--nav-border)', backgroundColor: 'var(--gray)' }}>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="px-4 py-2 bg-[var(--gold)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InversionPublicaDashboard;
