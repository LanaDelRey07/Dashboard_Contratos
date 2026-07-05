import { useState, useMemo, useCallback } from 'react';
import { boliviaViewBox, boliviaPaths, boliviaLabelPositions } from '../utils/boliviaPaths';
import { getDeptoDistribution } from '../utils/dataProcessing';
import { DPTO_DISPLAY_NAMES } from '../utils/formatters';

const BoliviaMap = ({ selectedDepto, onDeptoSelect, deptoData, activeDashboard }) => {
  const [hoveredDepto, setHoveredDepto] = useState(null);

  const distribution = useMemo(() =>
    deptoData || getDeptoDistribution()
  , [deptoData]);

  const getDeptoColor = useCallback((deptoName) => {
    if (!distribution[deptoName]) return null;
    const total = distribution[deptoName].total;
    if (total >= 500_000_000) return 'var(--map-fill-5)';
    if (total >= 200_000_000) return 'var(--map-fill-4)';
    if (total >= 100_000_000) return 'var(--map-fill-3)';
    if (total >= 50_000_000) return 'var(--map-fill-2)';
    return 'var(--map-fill-1)';
  }, [distribution]);

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  const defaultFill = 'var(--map-fill-empty)';
  const strokeColor = 'var(--map-stroke)';
  const contrastColor = '#d4af37'; // Gold contrast color

  const labelPositionsScaled = useMemo(() => {
    return boliviaLabelPositions;
  }, []);

  return (
    <div className="relative">
      <svg
        viewBox={boliviaViewBox}
        className="w-full h-auto"
        style={{ maxHeight: '380px' }}
      >
        {Object.entries(boliviaPaths).map(([deptoName, pathData]) => {
          const isSelected = selectedDepto === deptoName;
          const isHovered = hoveredDepto === deptoName;
          const colorFill = getDeptoColor(deptoName);

          return (
            <path
              key={deptoName}
              d={pathData}
              fill={isSelected ? contrastColor : (colorFill || defaultFill)}
              stroke={isSelected ? contrastColor : strokeColor}
              strokeWidth={isSelected ? '4' : isHovered ? '3' : '2'}
              className="depto-path"
              style={{
                opacity: selectedDepto && !isSelected && !isHovered ? 0.4 : 1,
                filter: isHovered && !isSelected ? 'brightness(1.15)' : 'none',
                transition: 'fill 0.2s, stroke 0.2s, opacity 0.2s',
              }}
              onClick={() => onDeptoSelect(isSelected ? null : deptoName)}
              onMouseEnter={() => setHoveredDepto(deptoName)}
              onMouseLeave={() => setHoveredDepto(null)}
            />
          );
        })}

        {Object.entries(labelPositionsScaled).map(([deptoName, pos]) => {
          const isSelected = selectedDepto === deptoName;
          const isHovered = hoveredDepto === deptoName;
          if (selectedDepto && !isSelected && !isHovered) return null;

          const displayNames = {
            'PANDO': 'Pando',
            'BENI': 'Beni',
            'LA PAZ': 'La Paz',
            'SANTA CRUZ': 'Santa Cruz',
            'COCHABAMBA': 'Cochabamba',
            'ORURO': 'Oruro',
            'POTOSÍ': 'Potosí',
            'CHUQUISACA': 'Chuquisaca',
            'TARIJA': 'Tarija',
          };

          return (
            <text
              key={`label-${deptoName}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none select-none"
              fill={isSelected ? '#fff' : (isDark ? '#d1d5db' : '#1a1a1a')}
              fontSize={deptoName === 'SANTA CRUZ' ? '65' : '58'}
              fontWeight={isSelected ? '700' : '600'}
              letterSpacing="1"
              style={{
                textShadow: isDark
                  ? '0 0 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)'
                  : '0 0 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.6)',
              }}
            >
              {displayNames[deptoName]}
            </text>
          );
        })}

        {hoveredDepto && distribution[hoveredDepto] && (
          (() => {
            const pos = labelPositionsScaled[hoveredDepto];
            if (!pos) return null;
            const data = distribution[hoveredDepto];
            return (
              <g>
                <rect
                  x={pos.x - 100}
                  y={pos.y - 90}
                  width="200"
                  height="50"
                  rx="6"
                  fill="rgba(0,0,0,0.85)"
                  className="pointer-events-none"
                />
                <text
                  x={pos.x}
                  y={pos.y - 68}
                  textAnchor="middle"
                  fill="white"
                  fontSize="22"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {activeDashboard === 'financiamiento-externo' 
                    ? `${data.count} contratos · USD ${(data.total / 1_000_000).toFixed(0)}M`
                    : `${data.count} registros · Bs. ${(data.total / 1_000_000).toFixed(0)}M`
                  }
                </text>
                <text
                  x={pos.x}
                  y={pos.y - 46}
                  textAnchor="middle"
                  fill={contrastColor}
                  fontSize="18"
                  fontWeight="500"
                  className="pointer-events-none"
                >
                  {DPTO_DISPLAY_NAMES[hoveredDepto]}
                </text>
              </g>
            );
          })()
        )}
      </svg>

      <div className="flex items-center justify-center gap-3 mt-2 text-xs" style={{ color: 'var(--text)', opacity: 0.7 }}>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--map-fill-1)' }}></span> {activeDashboard === 'financiamiento-externo' ? '<$50M' : '<50M Bs.'}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--map-fill-2)' }}></span> {activeDashboard === 'financiamiento-externo' ? '$50-100M' : '50-100M Bs.'}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--map-fill-3)' }}></span> {activeDashboard === 'financiamiento-externo' ? '$100-500M' : '100-500M Bs.'}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--map-fill-5)' }}></span> {activeDashboard === 'financiamiento-externo' ? '>$500M' : '>500M Bs.'}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: contrastColor }}></span> Selección
        </span>
      </div>
    </div>
  );
};

export default BoliviaMap;