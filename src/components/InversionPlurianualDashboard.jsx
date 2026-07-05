import { useMemo } from 'react';
import { calculatePlurianualSummary, getPlurianualDataByDepto } from '../utils/dataProcessingPlurianual';
import { DollarSign, Landmark, CalendarRange, TrendingUp } from 'lucide-react';

const InversionPlurianualDashboard = ({ selectedDepto }) => {
  // Fetch data based on selected department
  const plurianualData = useMemo(() => {
    return getPlurianualDataByDepto(selectedDepto);
  }, [selectedDepto]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    return calculatePlurianualSummary(plurianualData);
  }, [plurianualData]);

  // Format currencies
  const fmtBs = (val) => {
    if (val === null || val === undefined) return 'Bs. 0';
    return `Bs. ${val.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`;
  };

  const fmtBsMillions = (val) => {
    if (val === null || val === undefined) return 'Bs. 0M';
    return `Bs. ${(val / 1_000_000).toFixed(1)}M`;
  };

  // Prepare projections data for chart
  const chartData = useMemo(() => {
    const years = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', 'mayores_2034'];
    const maxVal = Math.max(...years.map(yr => summary.projectionsSum[yr] || 0), 1);
    
    return years.map(yr => ({
      year: yr === 'mayores_2034' ? '2034+' : yr,
      amount: summary.projectionsSum[yr] || 0,
      heightPercentage: ((summary.projectionsSum[yr] || 0) / maxVal) * 100
    }));
  }, [summary]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border flex items-center gap-4 animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Presupuesto Vigente 2026</span>
            <h3 className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{fmtBs(summary.total2026)}</h3>
            <p className="text-[10px] opacity-40">Año inicial programado</p>
          </div>
        </div>

        <div className="rounded-xl p-4 border flex items-center gap-4 animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
          <div className="p-3 rounded-lg text-[var(--gold)]" style={{ backgroundColor: 'rgba(184, 149, 44, 0.1)' }}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total Consolidado Plurianual</span>
            <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--gold)' }}>{fmtBs(summary.totalConsolidado)}</h3>
            <p className="text-[10px] opacity-40">Presupuesto consolidado total</p>
          </div>
        </div>

        <div className="rounded-xl p-4 border flex items-center gap-4 animate-count-up" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
          <div className="p-3 rounded-lg text-blue-500 bg-blue-500/10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Proyección Promedio Anual</span>
            <h3 className="text-xl font-bold mt-1 text-blue-500">
              {fmtBs(summary.totalConsolidado / 9)}
            </h3>
            <p className="text-[10px] opacity-40">Calculado a 9 períodos</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart and Source Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projections Bar Chart */}
        <div className="rounded-xl p-4 border lg:col-span-2" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
            <CalendarRange className="w-4 h-4" />
            Cronograma de Proyecciones de Inversión Pública (Bs. Millones)
          </h3>
          
          <div className="h-64 flex items-end justify-between gap-2 pt-4 px-2">
            {chartData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 text-white text-[9px] px-2 py-1 rounded absolute mb-20 pointer-events-none transform -translate-y-8 z-10 whitespace-nowrap shadow-lg">
                  {fmtBs(d.amount)}
                </div>
                
                {/* Bar */}
                <div 
                  className="w-full rounded-t transition-all duration-500 cursor-pointer hover:opacity-85"
                  style={{
                    height: `${Math.max(d.heightPercentage, 2)}%`,
                    backgroundColor: idx === 0 ? 'var(--gold)' : 'var(--gold-light)',
                    minHeight: d.amount > 0 ? '4px' : '1px'
                  }}
                />
                
                {/* Amount Label */}
                <span className="text-[9px] opacity-65 mt-2 font-mono">
                  {d.amount > 0 ? `${(d.amount / 1_000_000).toFixed(0)}M` : '-'}
                </span>
                
                {/* Year Label */}
                <span className="text-[10px] font-semibold mt-1" style={{ color: 'var(--text)' }}>
                  {d.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resources Source Split */}
        <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
            Origen de los Recursos Plurianuales
          </h3>
          <div className="space-y-4 pt-2">
            {Object.entries(summary.bySource).map(([source, data], idx) => {
              const total = summary.totalConsolidado || 1;
              const pct = ((data.total / total) * 100).toFixed(1);
              return (
                <div key={idx} className="p-3 rounded-lg border" style={{ borderColor: 'var(--nav-border)', backgroundColor: 'var(--gray)' }}>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold">{source}</span>
                    <span className="font-semibold" style={{ color: 'var(--gold)' }}>{pct}%</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{fmtBs(data.total)}</h4>
                  <p className="text-[9px] opacity-50 mt-1">Presupuesto Vigente 2026: {fmtBs(data['2026'])}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--bg)' }}>
                    <div 
                      className="h-1.5 rounded-full" 
                      style={{ 
                        width: `${pct}%`, 
                        backgroundColor: source.toLowerCase().includes('interno') ? 'var(--gold)' : '#3b82f6' 
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(summary.bySource).length === 0 && (
              <p className="text-xs opacity-50 text-center py-6">Sin datos de origen de recursos</p>
            )}
          </div>
        </div>
      </div>

      {/* Projections Detail List Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--nav-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
            Detalle Plurianual consolidado por Departamento y Origen ({plurianualData.length} registros)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--nav-border)', backgroundColor: 'var(--gray)' }}>
                <th className="p-3 font-semibold">Departamento</th>
                <th className="p-3 font-semibold">Origen Recursos</th>
                <th className="p-3 font-semibold text-right">Vigente 2026</th>
                <th className="p-3 font-semibold text-right">Proy. 2027</th>
                <th className="p-3 font-semibold text-right">Proy. 2028</th>
                <th className="p-3 font-semibold text-right">Proy. 2029</th>
                <th className="p-3 font-semibold text-right">Proy. 2030+</th>
                <th className="p-3 font-semibold text-right">Total Consolidado</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--nav-border)' }}>
              {plurianualData.map((p) => {
                // Sum 2030+ years for table summary
                const sum2030Plus = (p.proyecciones?.['2030'] || 0) + 
                                    (p.proyecciones?.['2031'] || 0) + 
                                    (p.proyecciones?.['2032'] || 0) + 
                                    (p.proyecciones?.['2033'] || 0) + 
                                    (p.proyecciones?.['mayores_2034'] || 0);
                return (
                  <tr key={p._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold">{p.departamento}</td>
                    <td className="p-3">{p.origen_recursos}</td>
                    <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">{fmtBsMillions(p.vigente_2026_bs)}</td>
                    <td className="p-3 text-right">{fmtBsMillions(p.proyecciones?.['2027'])}</td>
                    <td className="p-3 text-right">{fmtBsMillions(p.proyecciones?.['2028'])}</td>
                    <td className="p-3 text-right">{fmtBsMillions(p.proyecciones?.['2029'])}</td>
                    <td className="p-3 text-right">{fmtBsMillions(sum2030Plus)}</td>
                    <td className="p-3 text-right font-bold" style={{ color: 'var(--gold)' }}>{fmtBsMillions(p.total_consolidado_bs)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InversionPlurianualDashboard;
