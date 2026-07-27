import React from 'react';

interface State {
  hasError: boolean;
  error: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, error: err.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('[ZTA ErrorBoundary]', err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="text-red-400 text-4xl mb-4">⚠</div>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Render Error</h2>
            <p className="text-sm text-slate-500 font-mono max-w-lg break-all">{this.state.error}</p>
            <button
              className="mt-6 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
              onClick={() => this.setState({ hasError: false, error: '' })}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
