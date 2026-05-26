import { getPipelineStatus } from '../utils/dataProcessing';

const PipelineBar = ({ project }) => {
  const steps = getPipelineStatus(project);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step) => (
          <div
            key={step.pct}
            className="flex flex-col items-center"
            style={{ width: '20%' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
              style={{
                backgroundColor: step.completed ? 'var(--gold)' : 'var(--gray)',
                borderColor: step.completed ? 'var(--gold)' : 'var(--nav-border)',
                color: step.completed ? '#fff' : 'var(--text)',
              }}
            >
              {step.completed ? '✓' : step.pct}
            </div>
            <span className="text-xs mt-1 text-center leading-tight opacity-70">
              {step.pct}%
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-2 rounded-full mx-4" style={{ backgroundColor: 'var(--gray)' }}>
        <div
          className="absolute top-0 left-0 h-2 rounded-full transition-all duration-500"
          style={{
            backgroundColor: 'var(--gold)',
            width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default PipelineBar;