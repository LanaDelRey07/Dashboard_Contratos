import { useEffect, useRef, useState } from 'react';
import { TrendingUp, FolderKanban, BarChart3 } from 'lucide-react';
import { formatCurrencyFull, formatPercentage } from '../utils/formatters';

const AnimatedNumber = ({ value, formatter, duration = 1200 }) => {
  const safeValue = typeof value === 'number' && isFinite(value) ? value : 0;
  const [displayed, setDisplayed] = useState(0);
  const startTime = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(safeValue * eased);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setDisplayed(safeValue);
      }
    };
    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [safeValue, duration]);

  return <>{formatter(displayed)}</>;
};

const KPICards = ({ kpis, isNational }) => {
  const safeKpis = {
    totalContratado: typeof kpis.totalContratado === 'number' && isFinite(kpis.totalContratado) ? kpis.totalContratado : 0,
    cantidadProyectos: typeof kpis.cantidadProyectos === 'number' && isFinite(kpis.cantidadProyectos) ? kpis.cantidadProyectos : 0,
    avgDesembolso: typeof kpis.avgDesembolso === 'number' && isFinite(kpis.avgDesembolso) ? kpis.avgDesembolso : 0,
  };

  const cards = [
    {
      title: 'Inversión Total Contratada',
      value: safeKpis.totalContratado,
      formatter: (v) => formatCurrencyFull(v),
      icon: TrendingUp,
      accent: 'var(--gold)',
      bgAccent: 'rgba(184, 149, 44, 0.1)',
    },
    {
      title: 'Cantidad de Contratos',
      value: safeKpis.cantidadProyectos,
      formatter: (v) => Math.round(v).toLocaleString('es-BO'),
      icon: FolderKanban,
      accent: '#2563eb',
      bgAccent: 'rgba(37, 99, 235, 0.1)',
    },
    {
      title: isNational ? 'Desembolso Promedio' : 'Avance Promedio',
      value: safeKpis.avgDesembolso,
      formatter: (v) => `${isFinite(v) ? v.toFixed(1) : '0.0'}%`,
      icon: BarChart3,
      accent: '#16a34a',
      bgAccent: 'rgba(22, 163, 74, 0.1)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="kpi-card rounded-xl p-5 border transition-all"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--nav-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: card.bgAccent }}
              >
                <Icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-1">
              {card.title}
            </p>
            <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
              <AnimatedNumber value={card.value} formatter={card.formatter} duration={1400} />
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;