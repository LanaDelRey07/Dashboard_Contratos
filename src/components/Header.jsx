import { Search, Moon, Sun, RefreshCw } from 'lucide-react';
import logoImg from '/Presidencia.png';

const Header = ({ searchTerm, onSearchChange, darkMode, onToggleDark }) => {
  return (
    <header
      className="sticky top-0 z-50 border-b no-print"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--nav-border)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logoImg}
              alt="Logo"
              className="w-10 h-10 rounded-lg object-contain shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight truncate" style={{ color: 'var(--text)' }}>
                Tablero Gerencial - Financiamiento Externo en Ejecución de Contratos
              </h1>
              <p className="text-xs leading-tight truncate" style={{ color: 'var(--gold)' }}>
                Ministerio de Planificación del Desarrollo y Medio Ambiente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contrato o SISFIN..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-40 sm:w-64 pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--gray)',
                  borderColor: 'var(--nav-border)',
                  color: 'var(--text)',
                  '--tw-ring-color': 'var(--gold)',
                }}
              />
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--gray)', color: 'var(--text)' }}
              title="Refrescar página"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--gray)', color: 'var(--text)' }}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;