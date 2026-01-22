import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary to catch crash errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-2xl max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Algo correu mal 😟</h1>
            <p className="text-slate-300 mb-4">A aplicação encontrou um erro inesperado.</p>
            <div className="bg-slate-900 p-4 rounded-lg overflow-auto text-xs font-mono text-red-300 mb-6">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => {
                localStorage.clear(); 
                window.location.reload();
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              Limpar Dados e Recarregar
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              Isto irá limpar o armazenamento local para tentar resolver conflitos.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);