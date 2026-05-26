import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '420px',
          }}>
            <h2 style={{ color: '#92400e', marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
              No se encontraron resultados
            </h2>
            <p style={{ color: '#78350f', marginBottom: '1rem', fontSize: '0.875rem' }}>
              La búsqueda no arrojó resultados o produjo un error. Intente con otros términos o reinicie los filtros.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
                else window.location.reload();
              }}
              style={{
                backgroundColor: '#b8952c',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reiniciar búsqueda
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;