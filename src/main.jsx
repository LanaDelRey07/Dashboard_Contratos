import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <ErrorBoundary onReset={() => { window.location.href = window.location.pathname; }}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);