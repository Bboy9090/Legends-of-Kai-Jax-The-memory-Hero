import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorFallback extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-white"
          style={{ background: "linear-gradient(to bottom, #0a0a1a, #1a0a2e)" }}
        >
          <h1 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm font-mono max-w-lg mb-4">
            {this.state.error.message}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-500"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-slate-600 text-white font-medium hover:bg-slate-500"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
