import { useState, useMemo, useCallback } from 'react';
import { Download, AlertTriangle, Menu } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import SectorChart from './components/SectorChart';
import StateChart from './components/StateChart';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import { filterProjects, calculateKPIs, getSectorDistribution, getEstadoDistribution, getProjectsWithAlerts, allProjects } from './utils/dataProcessing';
import { exportResumenPDF } from './utils/pdfExport';
import { DPTO_DISPLAY_NAMES } from './utils/formatters';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepto, setSelectedDepto] = useState(null);
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedEstados, setSelectedEstados] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDark = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const filteredProjects = useMemo(() => {
    try {
      const term = (searchTerm || '').trim().slice(0, 100);
      return filterProjects({ searchTerm: term, selectedDepto, selectedSector, selectedEstados });
    } catch {
      return allProjects;
    }
  }, [searchTerm, selectedDepto, selectedSector, selectedEstados]);

  const kpisForTotals = useMemo(() => {
    if (!selectedDepto || selectedDepto === 'NACIONAL') {
      return calculateKPIs(filteredProjects);
    }
    const deptOnlyProjects = filteredProjects.filter(p => p['Departamento'] === selectedDepto);
    return calculateKPIs(deptOnlyProjects);
  }, [filteredProjects, selectedDepto]);

  const sectorDist = useMemo(() => {
    try { return getSectorDistribution(filteredProjects); } catch { return []; }
  }, [filteredProjects]);
  const estadoDist = useMemo(() => {
    try { return getEstadoDistribution(filteredProjects); } catch { return []; }
  }, [filteredProjects]);
  const alertProjects = useMemo(() => {
    try { return getProjectsWithAlerts(filteredProjects); } catch { return []; }
  }, [filteredProjects]);

  const handleExportResumen = () => {
    const deptoName = selectedDepto ? DPTO_DISPLAY_NAMES[selectedDepto] || selectedDepto : 'Nacional';
    exportResumenPDF(deptoName, filteredProjects, kpisForTotals);
  };

  const handleDeptoSelect = (depto) => {
    setSelectedDepto(depto);
    setSelectedProject(null);
    setSidebarOpen(false);
  };

  const crumbs = [];
  crumbs.push({ label: 'Inicio', onClick: () => { setSelectedProject(null); setSelectedDepto(null); setSearchTerm(''); setSelectedSector(''); setSelectedEstados([]); } });
  if (selectedDepto) {
    crumbs.push({ label: DPTO_DISPLAY_NAMES[selectedDepto] || selectedDepto, onClick: () => setSelectedProject(null) });
  }
  if (selectedProject) {
    crumbs.push({ label: (selectedProject['Nombre del Proyecto'] || 'Sin nombre').substring(0, 40) + '...' });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:relative md:transform-none md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <Sidebar
            selectedDepto={selectedDepto}
            onDeptoSelect={handleDeptoSelect}
            selectedSector={selectedSector}
            onSectorChange={(v) => { setSelectedSector(v); setSelectedProject(null); }}
            selectedEstados={selectedEstados}
            onEstadosChange={(v) => { setSelectedEstados(v); setSelectedProject(null); }}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg border"
                style={{ borderColor: 'var(--nav-border)', backgroundColor: 'var(--gray)', color: 'var(--text)' }}
              >
                <Menu className="w-5 h-5" />
              </button>
              <nav className="flex items-center gap-2 text-xs opacity-60">
                {crumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span>/</span>}
                    {c.onClick ? (
                      <button onClick={c.onClick} className="hover:underline" style={{ color: 'var(--gold)' }}>
                        {c.label}
                      </button>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            </div>

            {selectedProject ? (
              <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                      {selectedDepto
                        ? `Departamento de ${DPTO_DISPLAY_NAMES[selectedDepto] || selectedDepto}`
                        : 'Vista Nacional'}
                    </h2>
                    <p className="text-xs opacity-60">
                      {searchTerm
                        ? `${filteredProjects.length} resultados para "${searchTerm}"`
                        : `${filteredProjects.length} contratos`}
                    </p>
                    {selectedDepto && selectedDepto !== 'NACIONAL' && (
                      <p className="text-xs opacity-40 mt-0.5">
                        Los montos reflejan solo contratos del departamento
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleExportResumen}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-90 shrink-0"
                    style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                  >
                    <Download className="w-4 h-4" />
                    Exportar Resumen a PDF
                  </button>
                </div>

                <KPICards kpis={kpisForTotals} isNational={!selectedDepto || selectedDepto === 'NACIONAL'} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <SectorChart data={sectorDist} />
                  <StateChart data={estadoDist} />
                </div>

                {alertProjects.length > 0 && (
                  <div
                    className="rounded-xl p-4 mb-6 border-l-4 border-amber-500"
                    style={{ backgroundColor: 'rgba(234, 88, 12, 0.06)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-semibold text-amber-600">
                        Contratos que requieren atención ({alertProjects.length})
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alertProjects.slice(0, 5).map(p => (
                        <button
                          key={p._id}
                          onClick={() => setSelectedProject(p)}
                          className="text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80 border border-amber-300 bg-amber-50 text-amber-800"
                        >
                          {p['Nombre del Proyecto'].substring(0, 50)}...
                        </button>
                      ))}
                      {alertProjects.length > 5 && (
                        <span className="text-xs px-3 py-1.5 text-amber-600">
                          +{alertProjects.length - 5} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="rounded-xl p-4 mb-4 border"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gold)' }}>
                    Lista de Contratos
                  </h3>
                  <ProjectList
                    projects={filteredProjects}
                    onSelectProject={setSelectedProject}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;