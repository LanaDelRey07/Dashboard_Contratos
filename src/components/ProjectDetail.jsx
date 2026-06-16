import { useState } from 'react';
import { ArrowLeft, Download, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrencyFull, formatPercentage, getEstadoColor, DPTO_DISPLAY_NAMES, formatCurrencyBs, formatSubprojectPercent } from '../utils/formatters';
import { getProjectsWithAlerts } from '../utils/dataProcessing';
import { exportFichaPDF } from '../utils/pdfExport';
import PipelineBar from './PipelineBar';
import SituationBox from './SituationBox';
import subproyectosData from '../data/subproyectos_estructurados.json';

const ProjectDetail = ({ project, onBack }) => {
  const [openSubIndex, setOpenSubIndex] = useState(null);
  const [lastSisfin, setLastSisfin] = useState(project ? project.SISFIN : null);

  if (!project) return null;

  if (project.SISFIN !== lastSisfin) {
    setLastSisfin(project.SISFIN);
    setOpenSubIndex(null);
  }


  const estadoColors = getEstadoColor(project['Estado del Crédito']);
  const hasAlert = getProjectsWithAlerts([project]).length > 0;

  const formatField = (val) => {
    if (!val || val === '' || val === 'n.a.' || val === '-') return 'No aplica';
    return val;
  };

  const splittedDepto = project['Nacional'] && project['Nacional'].trim() !== ''
    ? `Nacional (${project['Nacional']})`
    : DPTO_DISPLAY_NAMES[project.Departamento] || project.Departamento;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors hover:opacity-80"
          style={{
            borderColor: 'var(--nav-border)',
            color: 'var(--text)',
            backgroundColor: 'var(--gray)',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al resumen
        </button>
        <button
          onClick={() => exportFichaPDF(project)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
        >
          <Download className="w-4 h-4" />
          Exportar Ficha Técnica a PDF
        </button>
      </div>

      <div
        className="rounded-xl p-6 border mb-6"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          {hasAlert && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-1" />}
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
              {project['Nombre del Proyecto']}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColors.bg} ${estadoColors.text} border ${estadoColors.border}`}>
                {project['Estado del Crédito']}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--gray)', color: 'var(--text)' }}>
                {project._sector}
              </span>
              {project.SISFIN && project.SISFIN !== '*' && (
                <span className="text-xs opacity-60">SISFIN: {project.SISFIN}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailField label="Organismo Financiador" value={formatField(project['Organismo Financiador'])} />
          <DetailField label="Departamento" value={splittedDepto} />
          <DetailField label="Entidad Ejecutora" value={formatField(project['Entidad Ejecutora'])} />
          <DetailField label="Repago" value={formatField(project['Repago'])} />
          <DetailField label="N° de Contrato" value={formatField(project['N° de contrato'])} />
          <DetailField label="N° de la Ley" value={formatField(project['N° de la Ley'])} />
          <DetailField label="Fecha de Suscripción" value={formatField(project['Fecha de Suscripción'])} />
          <DetailField label="Año Aprobación Ley" value={formatField(project['Año de la aprobación de la Ley'])} />
          <DetailField label="Fecha Último Desembolso" value={formatField(project['Fecha de último desembolso'])} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600 mb-1">Monto Contratado</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {formatCurrencyFull(project['Monto Contratado (USD)'])}
          </p>
        </div>
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'rgba(22, 163, 74, 0.05)', borderColor: 'rgba(22, 163, 74, 0.2)' }}>
          <p className="text-xs font-medium uppercase tracking-wider text-green-600 mb-1">Monto Desembolsado</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {formatCurrencyFull(project['Monto Desembolsado (USD)'])}
          </p>
        </div>
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'rgba(234, 88, 12, 0.05)', borderColor: 'rgba(234, 88, 12, 0.2)' }}>
          <p className="text-xs font-medium uppercase tracking-wider text-orange-600 mb-1">Monto por Desembolsar</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {formatCurrencyFull(project['Monto por Desembolsar (USD)'])}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-5 border mb-6"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
            Desembolso
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            {formatPercentage(project['Porcentaje de Desembolso'])}
          </p>
        </div>
        <div className="w-full h-3 rounded-full" style={{ backgroundColor: 'var(--gray)' }}>
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{
              backgroundColor: 'var(--gold)',
              width: `${Math.min(parseFloat(String(project['Porcentaje de Desembolso']).replace(',', '.')) * 100 || 0, 100)}%`,
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
          <div>
            <span className="opacity-60">Avance Físico: </span>
            <span className="font-medium">{formatPercentage(project['Porcentaje (%) de Avance Físico'])}</span>
          </div>
          <div>
            <span className="opacity-60">Avance Financiero: </span>
            <span className="font-medium">{formatPercentage(project['Porcentaje (%) de Avance Financiero'])}</span>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-5 border mb-6"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
          Gestión del Crédito - Pipeline
        </p>
        <PipelineBar project={project} />
        <div className="mt-3 text-xs text-center opacity-60">
          Avance referencial: {formatPercentage(project['Avance referencial de la Gestión del Crédito (%)'])}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {project['Descripción (Situación actual)'] && project['Descripción (Situación actual)'] !== 'n.a.' && (
          <SituationBox
            title="Descripción - Situación Actual"
            content={project['Descripción (Situación actual)']}
            type="info"
          />
        )}
        <SituationBox
          title="Estado de Situación"
          content={project['Estado de situación (descripción)']}
          type={hasAlert ? 'alert' : 'situacion'}
        />
      </div>

      {/* Accordion of Subprojects */}
      {(() => {
        const subprojects = subproyectosData[project.SISFIN] || [];
        if (subprojects.length === 0) return null;
        return (
          <div className="rounded-xl p-5 border mb-6" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--nav-border)' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--gold)' }}>
              Desglose de Subproyectos / Obras ({subprojects.length})
            </h3>
            <div className="space-y-3">
              {subprojects.map((sub, idx) => {
                const isExpanded = openSubIndex === idx;
                const budgetBs = formatCurrencyBs(sub.presupuesto_2026_bs);
                const fisPercent = formatSubprojectPercent(sub.avance_fisico);
                const finPercent = formatSubprojectPercent(sub.avance_financiero);
                const fisVal = (parseFloat(sub.avance_fisico) || 0) * 100;
                const finVal = (parseFloat(sub.avance_financiero) || 0) * 100;

                return (
                  <div key={idx} className="border rounded-lg overflow-hidden transition-all duration-300" style={{ borderColor: 'var(--nav-border)', backgroundColor: 'var(--gray)' }}>
                    {/* Header */}
                    <button
                      onClick={() => setOpenSubIndex(isExpanded ? null : idx)}
                      className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 text-left gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-snug text-[var(--text)]">
                          {sub.nombre_subproyecto}
                        </h4>
                        <p className="text-xs opacity-60 mt-1">
                          Presupuesto: <span className="font-medium text-[var(--text)]">{budgetBs}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200">
                            Físico: {fisPercent}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200">
                            Financiero: {finPercent}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 opacity-60" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
                      </div>
                    </button>

                    {/* Expanded Body */}
                    {isExpanded && (
                      <div className="p-4 border-t border-[var(--nav-border)] bg-black/[0.02] dark:bg-white/[0.01] space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs opacity-60 block mb-1">Código SISIN</span>
                            <span className="font-mono text-sm tracking-wide bg-white dark:bg-black/30 px-2 py-1 rounded border border-[var(--nav-border)] inline-block">
                              {sub.codigo_sisin || 'N/D'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs opacity-60 block mb-1">Presupuesto 2026</span>
                            <span className="text-sm font-semibold text-[var(--text)]">
                              {budgetBs}
                            </span>
                          </div>
                        </div>

                        {/* Progress bars */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="opacity-75 font-medium">Avance Físico</span>
                              <span className="font-semibold">{fisPercent}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(fisVal, 100)}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="opacity-75 font-medium">Avance Financiero</span>
                              <span className="font-semibold">{finPercent}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(finVal, 100)}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Situation box */}
                        {sub.situacion_actual && sub.situacion_actual !== 'n.a.' && (
                          <div className="p-3 rounded-lg border bg-blue-50/20 dark:bg-blue-950/10 border-blue-200/50 dark:border-blue-900/30">
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">Situación Actual</span>
                            <p className="text-xs leading-relaxed opacity-95 text-[var(--text)] whitespace-pre-line">
                              {sub.situacion_actual}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="flex justify-end">

        <button
          onClick={() => exportFichaPDF(project)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
        >
          <Download className="w-4 h-4" />
          Exportar Ficha Técnica a PDF
        </button>
      </div>
    </div>
  );
};

function DetailField({ label, value }) {
  return (
    <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--gray)' }}>
      <p className="text-xs opacity-60 mb-0.5">{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

export default ProjectDetail;