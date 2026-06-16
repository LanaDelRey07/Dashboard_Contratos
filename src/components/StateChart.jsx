import { getEstadoColor } from '../utils/formatters';

const StateChart = ({ data }) => {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (data.length === 0) {
    return (
      <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gold)' }}>
          Estado del Crédito
        </h3>
        <p className="text-sm opacity-50 text-center py-8">Sin datos para mostrar</p>
      </div>
    );
  }
  const estadoOrder = ['VIGENTE', 'EN ALP', 'EN GESTIÓN'];
  const sortedData = estadoOrder
    .map(e => data.find(d => d.estado === e))
    .filter(Boolean);

  return (
    <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gold)' }}>
        Estado del Crédito
      </h3>
      <div className="space-y-3">
        {sortedData.map((d) => {
          const colors = getEstadoColor(d.estado);
          const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : 0;
          return (
            <div key={d.estado}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium" style={{ color: 'var(--text)' }}>{d.estado}</span>
                <span className="opacity-70">{d.count} ({pct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: 'var(--gray)' }}>
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: colors.bar,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StateChart;