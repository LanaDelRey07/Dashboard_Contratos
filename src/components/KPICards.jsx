import { useEffect, useRef, useState } from 'react';
import { TrendingUp, FolderKanban, BarChart3 } from 'lucide-react';
import { formatCurrencyFull, formatCurrency } from '../utils/formatters';

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

const KPICards = ({ kpis }) => {
  const safeKpis = {
    totalContratado: typeof kpis.totalContratado === 'number' && isFinite(kpis.totalContratado) ? kpis.totalContratado : 0,
    totalDesembolsado: typeof kpis.totalDesembolsado === 'number' && isFinite(kpis.totalDesembolsado) ? kpis.totalDesembolsado : 0,
    totalPorDesembolsar: typeof kpis.totalPorDesembolsar === 'number' && isFinite(kpis.totalPorDesembolsar) ? kpis.totalPorDesembolsar : 0,
    cantidadProyectos: typeof kpis.cantidadProyectos === 'number' && isFinite(kpis.cantidadProyectos) ? kpis.cantidadProyectos : 0,
    avgDesembolso: typeof kpis.avgDesembolso === 'number' && isFinite(kpis.avgDesembolso) ? kpis.avgDesembolso : 0,
    avgAvanceFisico: typeof kpis.avgAvanceFisico === 'number' && isFinite(kpis.avgAvanceFisico) ? kpis.avgAvanceFisico : null,
    vigentesCount: typeof kpis.vigentesCount === 'number' && isFinite(kpis.vigentesCount) ? kpis.vigentesCount : 0,
    enAlpCount: typeof kpis.enAlpCount === 'number' && isFinite(kpis.enAlpCount) ? kpis.enAlpCount : 0,
    enGestionCount: typeof kpis.enGestionCount === 'number' && isFinite(kpis.enGestionCount) ? kpis.enGestionCount : 0,
  };

  const cards = [
    {
      title: 'Inversión Total Contratada',
      value: safeKpis.totalContratado,
      formatter: (v) => formatCurrencyFull(v),
      icon: TrendingUp,
      accent: 'var(--gold)',
      bgAccent: 'rgba(184, 149, 44, 0.1)',
      breakdown: (
        <div className="mt-3 pt-3 border-t border-[var(--nav-border)] grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="opacity-60 block text-[10px] uppercase font-medium">Monto Desembolsado</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(safeKpis.totalDesembolsado)}
            </span>
          </div>
          <div>
            <span className="opacity-60 block text-[10px] uppercase font-medium">Por Desembolsar</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {formatCurrency(safeKpis.totalPorDesembolsar)}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Cantidad de Contratos',
      value: safeKpis.cantidadProyectos,
      formatter: (v) => Math.round(v).toLocaleString('es-BO'),
      icon: FolderKanban,
      accent: '#2563eb',
      bgAccent: 'rgba(37, 99, 235, 0.1)',
      breakdown: (
        <div className="mt-3 pt-3 border-t border-[var(--nav-border)] grid grid-cols-3 gap-1 text-[10px] text-center">
          <div>
            <span className="opacity-60 block">Vigente</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{safeKpis.vigentesCount}</span>
          </div>
          <div>
            <span className="opacity-60 block">En ALP</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{safeKpis.enAlpCount}</span>
          </div>
          <div>
            <span className="opacity-60 block">En Gestión</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">{safeKpis.enGestionCount}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Avance Físico Promedio',
      value: safeKpis.avgAvanceFisico !== null ? safeKpis.avgAvanceFisico : 0,
      formatter: (v) => safeKpis.avgAvanceFisico !== null ? `${v.toFixed(1)}%` : '0.0%',
      icon: BarChart3,
      accent: '#8b5cf6',
      bgAccent: 'rgba(139, 92, 246, 0.1)',
      breakdown: (
        <div className="mt-3 pt-3 border-t border-[var(--nav-border)] grid grid-cols-2 gap-2 text-xs text-center">
          <div>
            <span className="opacity-60 block text-[10px] uppercase font-medium">Av. Financiero</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {safeKpis.avgDesembolso.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="opacity-60 block text-[10px] uppercase font-medium">Físico Registrado</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {safeKpis.avgAvanceFisico !== null ? `${safeKpis.avgAvanceFisico.toFixed(1)}%` : '0.0%'}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="kpi-card rounded-xl p-5 border transition-all flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--nav-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div>
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
            {card.breakdown && card.breakdown}
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;