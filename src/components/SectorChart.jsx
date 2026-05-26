import { useMemo } from 'react';
import { getSectorColor } from '../utils/formatters';

const SectorChart = ({ data }) => {
  const total = useMemo(() => data.reduce((acc, d) => acc + d.total, 0), [data]);

  const radius = 80;
  const innerRadius = 50;

  const slices = useMemo(() => {
    if (data.length === 0 || total === 0) return [];
    let angle = -90;
    return data.map((d) => {
      const sweep = Math.max((d.total / total) * 360, 0.1);
      const startRad = (angle * Math.PI) / 180;
      const endRad = ((angle + sweep) * Math.PI) / 180;
      angle += sweep;

      const x1Outer = 100 + radius * Math.cos(startRad);
      const y1Outer = 100 + radius * Math.sin(startRad);
      const x2Outer = 100 + radius * Math.cos(endRad);
      const y2Outer = 100 + radius * Math.sin(endRad);
      const x1Inner = 100 + innerRadius * Math.cos(endRad);
      const y1Inner = 100 + innerRadius * Math.sin(endRad);
      const x2Inner = 100 + innerRadius * Math.cos(startRad);
      const y2Inner = 100 + innerRadius * Math.sin(startRad);

      const pathData = [
        `M ${x1Outer} ${y1Outer}`,
        `A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${x2Outer} ${y2Outer}`,
        `L ${x1Inner} ${y1Inner}`,
        `A ${innerRadius} ${innerRadius} 0 ${sweep > 180 ? 1 : 0} 0 ${x2Inner} ${y2Inner}`,
        'Z',
      ].join(' ');

      return { sector: d.sector, pathData, color: getSectorColor(d.sector) };
    });
  }, [data, total]);

  if (data.length === 0 || total === 0) {
    return (
      <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gold)' }}>
          Distribución por Sector
        </h3>
        <p className="text-sm opacity-50 text-center py-8">Sin datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gold)' }}>
        Distribución por Sector
      </h3>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 200 200" className="w-44 h-44 shrink-0">
          {slices.map((s, i) => (
            <g key={i}>
              <path
                d={s.pathData}
                fill={s.color}
                opacity={0.85}
                className="cursor-pointer hover:opacity-100 transition-opacity"
              />
            </g>
          ))}
          <text
            x="100" y="95" textAnchor="middle" dominantBaseline="central"
            className="text-xl font-bold" fill="var(--text)"
            style={{ fontSize: '14px' }}
          >
            {data.length}
          </text>
          <text
            x="100" y="110" textAnchor="middle" dominantBaseline="central"
            fill="var(--text)" opacity="0.6"
            style={{ fontSize: '9px' }}
          >
            sectores
          </text>
        </svg>
        <div className="flex-1 space-y-1 text-xs overflow-y-auto max-h-44">
          {data.slice(0, 8).map((d) => (
            <div key={d.sector} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: getSectorColor(d.sector) }}
              />
              <span className="truncate" style={{ color: 'var(--text)' }}>
                {d.sector}
              </span>
              <span className="ml-auto opacity-60 whitespace-nowrap">
                {d.count} · ${(d.total / 1_000_000).toFixed(0)}M
              </span>
            </div>
          ))}
          {data.length > 8 && (
            <p className="text-xs opacity-50 italic">+{data.length - 8} más</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorChart;