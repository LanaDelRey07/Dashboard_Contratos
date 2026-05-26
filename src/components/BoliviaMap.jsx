import { useState, useMemo, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { boliviaViewBox, boliviaPaths, boliviaLabelPositions } from '../utils/boliviaPaths';
import { getDeptoDistribution } from '../utils/dataProcessing';
import { DPTO_DISPLAY_NAMES } from '../utils/formatters';

const DEPTO_IDS = {
  'PANDO': 'pando',
  'BENI': 'beni',
  'LA PAZ': 'la_paz',
  'SANTA CRUZ': 'santa_cruz',
  'COCHABAMBA': 'cochabamba',
  'ORURO': 'oruro',
  'POTOSÍ': 'potosi',
  'CHUQUISACA': 'chuquisaca',
  'TARIJA': 'tarija',
};

const BoliviaMap = ({ selectedDepto, onDeptoSelect, deptoData }) => {
  const [hoveredDepto, setHoveredDepto] = useState(null);

  const distribution = useMemo(() =>
    deptoData || getDeptoDistribution()
  , [deptoData]);

  const getDeptoColor = useCallback((deptoName) => {
    if (!distribution[deptoName]) return null;
    const total = distribution[deptoName].total;
    if (total >= 500_000_000) return '#1e3a5f';
    if (total >= 200_000_000) return '#2d5a8e';
    if (total >= 100_000_000) return '#4a7fb5';
    if (total >= 50_000_000) return '#6b9fd4';
    return '#a3c4e8';
  }, [distribution]);

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  const defaultFill = isDark ? '#2a2a3a' : '#e8e0d4';
  const strokeColor = isDark ? '#555' : '#8b7d6b';
  const goldColor = '#b8952c';

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
              fill={isSelected ? goldColor : (colorFill || defaultFill)}
              stroke={isSelected ? goldColor : strokeColor}
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
                  {data.count} contratos · USD {(data.total / 1_000_000).toFixed(0)}M
                </text>
                <text
                  x={pos.x}
                  y={pos.y - 46}
                  textAnchor="middle"
                  fill="#b8952c"
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
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#a3c4e8' }}></span> &lt;$50M
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#6b9fd4' }}></span> $50-100M
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#2d5a8e' }}></span> $100-500M
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1e3a5f' }}></span> &gt;$500M
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#b8952c' }}></span> Selección
        </span>
      </div>
    </div>
  );
};

export default BoliviaMap;