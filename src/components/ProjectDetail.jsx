import { ArrowLeft, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatCurrencyFull, formatPercentage, getEstadoColor, DPTO_DISPLAY_NAMES } from '../utils/formatters';
import { getProjectsWithAlerts, getPipelineStatus } from '../utils/dataProcessing';
import { exportFichaPDF } from '../utils/pdfExport';
import PipelineBar from './PipelineBar';
import SituationBox from './SituationBox';

const ProjectDetail = ({ project, onBack }) => {
  if (!project) return null;

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