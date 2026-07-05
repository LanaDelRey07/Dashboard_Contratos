import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, BarChart3, MapPin, Building, Eye, X, Activity } from 'lucide-react';
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

const InversionPublicaDashboard = ({ selectedDepto }) => {
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
        selectedAdmin
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
  }, [activeSubTab, searchTerm, selectedDepto, selectedSector, selectedAdmin, selectedEjecutor, selectedMuni]);

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
      return getTopMunicipalities(filteredData, selectedDepto).slice(0, 5);
    }
    return [];
  }, [activeSubTab, filteredData, selectedDepto]);

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
          Registros de Inversión Pública / Obras ({allInversionRegistries.length.toLocaleString()})
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeSubTab === 'projects' ? (
          <>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Proyectos Totales</span>
              <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--gold)' }}>{kpis.cantidad.toLocaleString()}</h3>
              <p className="text-[10px] opacity-40 mt-1">En el departamento/filtros</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Presupuesto Vigente 2026</span>
              <h3 className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{fmtBs(kpis.totalPresupuesto)}</h3>
              <p className="text-[10px] opacity-40 mt-1">Acumulado 2025: {fmtBs(kpis.totalAcumulado)}</p>
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
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Obras / Registros</span>
              <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--gold)' }}>{kpis.cantidad.toLocaleString()}</h3>
              <p className="text-[10px] opacity-40 mt-1">Registros con georreferenciación</p>
            </div>
            <div className="rounded-xl p-4 border animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Presupuesto Vigente 2026</span>
              <h3 className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{fmtBs(kpis.totalPresupuesto)}</h3>
              <p className="text-[10px] opacity-40 mt-1">Avance Ejecución: {fmtBs(kpis.totalAvanceMonto)}</p>
            </div>
            <div className="rounded-xl p-4 border col-span-1 sm:col-span-2 animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Avance de Ejecución Promedio (%)</span>
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
        {/* Sector Distribution */}
        <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
            Distribución por Sector
          </h3>
          <div className="space-y-3">
            {sectorDist.slice(0, 5).map((s, idx) => {
              const maxVal = sectorDist[0]?.total || 1;
              const pct = ((s.total / maxVal) * 100).toFixed(0);
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold truncate max-w-[200px]">{s.sector}</span>
                    <span className="opacity-60">{s.count} {s.count === 1 ? 'ítem' : 'ítems'} · {(s.total / 1_000_000).toFixed(1)}M Bs.</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--gray)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--gold)' }}></div>
                  </div>
                </div>
              );
            })}
            {sectorDist.length === 0 && (
              <p className="text-xs opacity-50 text-center py-6">Sin datos sectoriales en este filtro</p>
            )}
          </div>
        </div>

        {/* Municipality Ranking (Registries only) or Sector / Admin distribution (Projects only) */}
        {activeSubTab === 'registries' ? (
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
              Inversión por Municipio (Top 5 en {selectedDepto || 'Nacional'})
            </h3>
            <div className="space-y-3">
              {topMunis.map((m, idx) => {
                const maxVal = topMunis[0]?.total || 1;
                const pct = ((m.total / maxVal) * 100).toFixed(0);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 opacity-50" />
                        {m.municipio}
                      </span>
                      <span className="opacity-60">{m.count} obras · {(m.total / 1_000_000).toFixed(2)}M Bs.</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--gray)' }}>
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {topMunis.length === 0 && (
                <p className="text-xs opacity-50 text-center py-6">Seleccione un departamento con obras registradas para ver la distribución municipal</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
              Top Estados de Proyectos
            </h3>
            <div className="space-y-3">
              {(() => {
                const states = {};
                filteredData.forEach(p => {
                  const est = p.estado || 'Otros';
                  states[est] = (states[est] || 0) + 1;
                });
                const sorted = Object.entries(states)
                  .map(([name, count]) => ({ name, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5);

                const maxCount = sorted[0]?.count || 1;
                return sorted.map((st, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold truncate max-w-[200px]">{st.name}</span>
                      <span className="opacity-60">{st.count} proyectos</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--gray)' }}>
                      <div className="h-2 rounded-full bg-amber-500" style={{ width: `${(st.count / maxCount) * 100}%` }}></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-700">
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
                  <th className="p-3 font-semibold">Obra</th>
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
              {selectedItem.type === 'project' ? (
                <>
                  <div className="border-b pb-2 mb-2">
                    <span className="opacity-50 uppercase text-[9px] font-bold">Proyecto</span>
                    <h4 className="text-sm font-bold mt-0.5" style={{ color: 'var(--gold)' }}>{selectedItem.data.nombre_proyecto}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Código SISIN</span>
                      <span className="font-mono text-sm">{selectedItem.data.sisin}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Departamento</span>
                      <span>{DPTO_DISPLAY_NAMES[selectedItem.data.departamento_macro] || selectedItem.data.departamento_macro || '-'}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Sector Económico</span>
                      <span>{selectedItem.data.sector_economico || '-'}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Tipo de Administración</span>
                      <span>{selectedItem.data.tipo_administracion || '-'}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Presupuesto Vigente 2026</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtBs(selectedItem.data.presupuesto_vigente_2026_bs)}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Ejecución Acumulada 2025</span>
                      <span>{fmtBs(selectedItem.data.ejecucion_acumulada_2025_bs)}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Ejecución Gestión 2026</span>
                      <span>{fmtBs(selectedItem.data.ejecucion_2026_bs)}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Año de Conclusión</span>
                      <span>{selectedItem.data.ano_conclusion || 'Sin registrar'}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Avance Físico</span>
                      <span className="font-semibold">{fmtPercent(selectedItem.data.avance_fisico * 100)}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Avance Financiero</span>
                      <span className="font-semibold">{fmtPercent(selectedItem.data.avance_financiero * 100)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="opacity-50 block uppercase text-[9px] font-bold mb-1">Estado de Ejecución</span>
                    <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border text-slate-700 dark:text-slate-300 font-semibold">
                      {selectedItem.data.estado || 'En proceso'}
                    </span>
                  </div>

                  {selectedItem.data.cronograma_proyecciones && (
                    <div className="border-t pt-3">
                      <span className="opacity-50 block uppercase text-[9px] font-bold mb-2">Cronograma de Proyecciones</span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        {Object.entries(selectedItem.data.cronograma_proyecciones).map(([yr, val]) => (
                          <div key={yr} className="p-2 rounded bg-black/5 dark:bg-white/5">
                            <span className="block font-bold opacity-60">{yr}</span>
                            <span>{val || '0'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="border-b pb-2 mb-2">
                    <span className="opacity-50 uppercase text-[9px] font-bold">Obra / Registro</span>
                    <h4 className="text-sm font-bold mt-0.5" style={{ color: 'var(--gold)' }}>{selectedItem.data.nombre_obra}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Código SISIN</span>
                      <span className="font-mono text-sm">{selectedItem.data.sisin}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Ubicación</span>
                      <span>{selectedItem.data.municipio} ({DPTO_DISPLAY_NAMES[selectedItem.data.departamento] || selectedItem.data.departamento})</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Sector Específico</span>
                      <span>{selectedItem.data.sector_especifico || '-'}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Fuente de Recursos</span>
                      <span>{selectedItem.data.fuente_recursos || '-'}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Presupuesto Vigente 2026</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtBs(selectedItem.data.presupuesto_vigente_2026_bs)}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Avance Ejecución Monto</span>
                      <span className="font-semibold text-blue-500">{fmtBs(selectedItem.data.avance_ejecucion_monto_bs)}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Avance Ejecución Porcentaje</span>
                      <span className="font-semibold text-lg">{fmtPercent(selectedItem.data.avance_ejecucion_porcentaje * 100)}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Institución Ejecutora</span>
                      <span>{selectedItem.data.ejecutor_institucion || '-'}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Fecha Inicio de Obras</span>
                      <span>{selectedItem.data.fecha_inicio_obras || 'Sin registrar'}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block uppercase text-[9px] font-bold">Fecha Estimada Conclusión</span>
                      <span>{selectedItem.data.fecha_estimada_conclusion || 'Sin registrar'}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="opacity-50 block uppercase text-[9px] font-bold mb-1">Estado de la Obra</span>
                    <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border text-slate-700 dark:text-slate-300 font-semibold">
                      {selectedItem.data.estado_obra || 'Sin registrar'}
                    </span>
                  </div>
                </>
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
