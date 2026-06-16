import { formatCurrencyFull } from '../utils/formatters';

const GeneralReadout = ({ kpis }) => {
  const safeKpis = {
    totalContratado: kpis.totalContratado || 0,
    totalDesembolsado: kpis.totalDesembolsado || 0,
    totalPorDesembolsar: kpis.totalPorDesembolsar || 0,
    cantidadProyectos: kpis.cantidadProyectos || 0,
    avgDesembolso: kpis.avgDesembolso || 0,
    vigentesCount: kpis.vigentesCount || 0,
    enAlpCount: kpis.enAlpCount || 0,
    enGestionCount: kpis.enGestionCount || 0,
  };

  const pct = safeKpis.avgDesembolso;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(pct, 0), 100) / 100) * circumference;

  return (
    <div
      className="rounded-xl p-4 border flex flex-col justify-between transition-all"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--nav-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
          Cuadro de Lectura General
        </h3>

        <div className="flex items-center gap-6 mb-4">
          {/* Circular Progress Ring */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-current opacity-10"
                style={{ color: 'var(--text)' }}
                strokeWidth="8"
                fill="transparent"
              />
              {/* Foreground circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="var(--gold)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-base font-bold" style={{ color: 'var(--text)' }}>
                {pct.toFixed(1)}%
              </span>
              <span className="block text-[8px] uppercase tracking-wider opacity-60">
                Desembolso
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex-1 space-y-2 text-xs">
            <div>
              <span className="opacity-60 block text-[9px] uppercase font-medium">Contratos Activos</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {safeKpis.cantidadProyectos} contratos
              </span>
            </div>
            <div className="flex gap-2 text-[9px]">
              <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold">
                VIG: {safeKpis.vigentesCount}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-semibold">
                ALP: {safeKpis.enAlpCount}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 font-semibold">
                GES: {safeKpis.enGestionCount}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed readout */}
        <div className="space-y-2.5 pt-3 border-t border-[var(--nav-border)] text-xs">
          <div className="flex justify-between items-center">
            <span className="opacity-70">Inversión Contratada:</span>
            <span className="font-bold text-[var(--text)]">{formatCurrencyFull(safeKpis.totalContratado)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-70">Monto Desembolsado:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrencyFull(safeKpis.totalDesembolsado)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-70">Por Desembolsar:</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrencyFull(safeKpis.totalPorDesembolsar)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralReadout;
