import { AlertTriangle, Info } from 'lucide-react';

const SituationBox = ({ title, content, type = 'situacion' }) => {
  if (!content || content.trim() === '' || content === 'n.a.' || content === '-') return null;

  const isAlert = type === 'alert';
  const styles = isAlert
    ? { backgroundColor: 'rgba(234, 88, 12, 0.08)', borderColor: '#ea580c', color: '#ea580c' }
    : { backgroundColor: 'rgba(184, 149, 44, 0.08)', borderColor: 'var(--gold)', color: 'var(--text)' };

  const Icon = isAlert ? AlertTriangle : Info;

  const lines = content.split('\n').filter(l => l.trim());

  return (
    <div
      className="rounded-lg border-l-4 p-4"
      style={{
        borderLeftColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: styles.borderColor }} />
        <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: styles.borderColor }}>
          {title}
        </h4>
      </div>
      <div className="text-sm leading-relaxed space-y-1" style={{ color: 'var(--text)' }}>
        {lines.map((line, i) => (
          <p key={i} className="pl-2 border-l-2" style={{ borderColor: 'var(--nav-border)' }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default SituationBox;