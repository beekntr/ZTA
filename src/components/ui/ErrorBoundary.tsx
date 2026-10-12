import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
          <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-12 text-center">
            <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-critical-soft text-critical">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h2 className="mb-1 text-base font-semibold text-fg">Something went wrong</h2>
            <p className="max-w-lg break-all font-mono text-xs text-muted">{this.state.error}</p>
            <button
              className="mt-6 h-9 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-fg hover:bg-surface-2"
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
