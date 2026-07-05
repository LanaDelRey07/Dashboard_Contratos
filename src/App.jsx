import { useState, useMemo, useCallback } from 'react';
import { Download, AlertTriangle, Menu } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import SectorChart from './components/SectorChart';
import StateChart from './components/StateChart';
import GeneralReadout from './components/GeneralReadout';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import InversionPublicaDashboard from './components/InversionPublicaDashboard';
import InversionPlurianualDashboard from './components/InversionPlurianualDashboard';
import { 
  filterProjects, 
  calculateKPIs, 
  getSectorDistribution, 
  getEstadoDistribution, 
  getProjectsWithAlerts, 
  allProjects,
  getDeptoDistribution
} from './utils/dataProcessing';
import { allInversionProjects, getInversionProjectsDeptoDist } from './utils/dataProcessingInversionPublica';
import { getPlurianualDeptoDist } from './utils/dataProcessingPlurianual';
import { exportResumenPDF } from './utils/pdfExport';
import { DPTO_DISPLAY_NAMES } from './utils/formatters';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState('financiamiento-externo'); // 'financiamiento-externo', 'inversion-publica', 'inversion-plurianual'
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

  const [selectedOrganismo, setSelectedOrganismo] = useState('');

  const filteredProjects = useMemo(() => {
    try {
      const term = (searchTerm || '').trim().slice(0, 100);
      return filterProjects({ searchTerm: term, selectedDepto, selectedSector, selectedEstados, selectedOrganismo });
    } catch {
      return allProjects;
    }
  }, [searchTerm, selectedDepto, selectedSector, selectedEstados, selectedOrganismo]);

  const projectsForMap = useMemo(() => {
    try {
      const term = (searchTerm || '').trim().slice(0, 100);
      return filterProjects({
        searchTerm: term,
        selectedSector,
        selectedEstados,
        selectedOrganismo
      });
    } catch {
      return allProjects;
    }
  }, [searchTerm, selectedSector, selectedEstados, selectedOrganismo]);

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

  const mapDistribution = useMemo(() => {
    if (activeDashboard === 'financiamiento-externo') {
      return getDeptoDistribution(projectsForMap || []);
    } else if (activeDashboard === 'inversion-publica') {
      return getInversionProjectsDeptoDist(allInversionProjects);
    } else {
      return getPlurianualDeptoDist();
    }
  }, [activeDashboard, projectsForMap]);

  const crumbs = [];
  const getDashboardLabel = () => {
    if (activeDashboard === 'financiamiento-externo') return 'Financiamiento Externo';
    if (activeDashboard === 'inversion-publica') return 'Inversión Pública';
    return 'Inversión Plurianual';
  };
  crumbs.push({ 
    label: getDashboardLabel(), 
    onClick: () => { 
      setSelectedProject(null); 
      setSelectedDepto(null); 
      setSearchTerm(''); 
      setSelectedSector(''); 
      setSelectedEstados([]); 
      setSelectedOrganismo(''); 
    } 
  });
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
        activeDashboard={activeDashboard}
      />

      {/* Top Navigation Menu Bar */}
      <div className="flex border-b shrink-0 bg-[var(--bg-card)] no-print px-4 sm:px-8 py-2.5 gap-4 items-center justify-start border-[var(--nav-border)] overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mr-2 text-[var(--gold)] whitespace-nowrap">
          Panel General:
        </span>
        <button
          onClick={() => { setActiveDashboard('financiamiento-externo'); setSelectedDepto(null); setSelectedProject(null); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
            activeDashboard === 'financiamiento-externo' ? 'bg-[var(--gold)] text-white border-[var(--gold)] shadow-md' : 'bg-[var(--gray)] text-[var(--text)] border-[var(--nav-border)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          💳 Financiamiento Externo
        </button>
        <button
          onClick={() => { setActiveDashboard('inversion-publica'); setSelectedDepto(null); setSelectedProject(null); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
            activeDashboard === 'inversion-publica' ? 'bg-[var(--gold)] text-white border-[var(--gold)] shadow-md' : 'bg-[var(--gray)] text-[var(--text)] border-[var(--nav-border)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          🏛️ Inversión Pública
        </button>
        <button
          onClick={() => { setActiveDashboard('inversion-plurianual'); setSelectedDepto(null); setSelectedProject(null); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
            activeDashboard === 'inversion-plurianual' ? 'bg-[var(--gold)] text-white border-[var(--gold)] shadow-md' : 'bg-[var(--gray)] text-[var(--text)] border-[var(--nav-border)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          📅 Inversión Plurianual
        </button>
      </div>

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
            selectedOrganismo={selectedOrganismo}
            onOrganismoChange={(v) => { setSelectedOrganismo(v); setSelectedProject(null); }}
            deptoDistribution={mapDistribution}
            onClose={() => setSidebarOpen(false)}
            activeDashboard={activeDashboard}
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

            {activeDashboard === 'financiamiento-externo' ? (
              selectedProject ? (
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

                  <KPICards kpis={kpisForTotals} />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <SectorChart data={sectorDist} />
                    <StateChart data={estadoDist} />
                    <GeneralReadout kpis={kpisForTotals} />
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
              )
            ) : activeDashboard === 'inversion-publica' ? (
              <InversionPublicaDashboard selectedDepto={selectedDepto} onDeptoSelect={setSelectedDepto} />
            ) : (
              <InversionPlurianualDashboard selectedDepto={selectedDepto} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;