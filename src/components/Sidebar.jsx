import { useMemo } from 'react';
import { X, MapPin, Filter, RotateCcw } from 'lucide-react';
import BoliviaMap from './BoliviaMap';
import { getAllSectors, getDeptoDistribution } from '../utils/dataProcessing';
import { DEPARTMENTS, DPTO_DISPLAY_NAMES, ESTADOS_CREDITO, getEstadoColor } from '../utils/formatters';

const Sidebar = ({ selectedDepto, onDeptoSelect, selectedSector, onSectorChange, selectedEstados, onEstadosChange, onClose }) => {
  const sectors = useMemo(() => getAllSectors(), []);
  const distribution = useMemo(() => getDeptoDistribution(), []);

  const clearFilters = () => {
    onDeptoSelect(null);
    onSectorChange('');
    onEstadosChange([]);
  };

  const estadosArray = selectedEstados || [];
  const hasFilters = selectedDepto || selectedSector || estadosArray.length > 0;

  const toggleEstado = (estado) => {
    if (estadosArray.includes(estado)) {
      onEstadosChange(estadosArray.filter(e => e !== estado));
    } else {
      onEstadosChange([...estadosArray, estado]);
    }
  };

  return (
    <aside
      className="w-72 shrink-0 border-r overflow-y-auto scrollbar-thin no-print"
      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}
    >
      {onClose && (
        <div className="flex items-center justify-between px-5 pt-3 md:hidden">
          <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>Filtros</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-70"
            style={{ color: 'var(--text)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
            <MapPin className="w-4 h-4 inline mr-1" />
            Filtro Geográfico
          </h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors hover:opacity-80"
              style={{ color: 'var(--gold)' }}
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>

        <BoliviaMap
          selectedDepto={selectedDepto}
          onDeptoSelect={onDeptoSelect}
          deptoData={distribution}
        />

        <div className="mt-5">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
              Departamentos
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['NACIONAL', ...DEPARTMENTS].map((depto) => {
              const isSelected = selectedDepto === depto;
              const count = depto === 'NACIONAL'
                ? '-'
                : distribution[depto]?.count || 0;
              return (
                <button
                  key={depto}
                  onClick={() => onDeptoSelect(isSelected ? null : depto)}
                  className="px-2.5 py-1 text-xs font-medium rounded-full transition-all border"
                  style={{
                    backgroundColor: isSelected ? 'var(--gold)' : 'var(--gray)',
                    color: isSelected ? '#fff' : 'var(--text)',
                    borderColor: isSelected ? 'var(--gold)' : 'var(--nav-border)',
                  }}
                >
                  {DPTO_DISPLAY_NAMES[depto]}
                  {count !== '-' && (
                    <span className="ml-1 opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--nav-border)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gold)' }}>
          <Filter className="w-4 h-4 inline mr-1" />
          Filtros
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5 opacity-70">Sector</label>
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => onSectorChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border appearance-none pr-8 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--gray)',
                  borderColor: 'var(--nav-border)',
                  color: 'var(--text)',
                  '--tw-ring-color': 'var(--gold)',
                }}
              >
                <option value="">Todos los sectores</option>
                {sectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {selectedSector && (
                <button
                  onClick={() => onSectorChange('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium opacity-70">Estado del Crédito</label>
              {estadosArray.length > 0 && (
                <button
                  onClick={() => onEstadosChange([])}
                  className="text-xs opacity-50 hover:opacity-100"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS_CREDITO.map((estado) => {
                const isActive = estadosArray.includes(estado);
                const colors = getEstadoColor(estado);
                return (
                  <button
                    key={estado}
                    onClick={() => toggleEstado(estado)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all border ${colors.bg} ${colors.text} ${colors.border}`}
                    style={{
                      backgroundColor: isActive ? colors.bar : 'var(--gray)',
                      color: isActive ? '#fff' : 'var(--text)',
                      borderColor: isActive ? colors.bar : 'var(--nav-border)',
                      '--bar-color': colors.bar,
                    }}
                  >
                    {estado}
                  </button>
                );
              })}
            </div>
            {estadosArray.length > 0 && (
              <p className="text-xs opacity-50 mt-1">
                {estadosArray.length} estado{estadosArray.length > 1 ? 's' : ''} seleccionado{estadosArray.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;