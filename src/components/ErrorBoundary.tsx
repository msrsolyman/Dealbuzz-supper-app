import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    const isChunkLoadFailed =
      error.message &&
      (error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed'));

    if (isChunkLoadFailed) {
      if (!sessionStorage.getItem('chunk_reload')) {
        sessionStorage.setItem('chunk_reload', 'true');
        window.location.reload();
      }
    } else {
      sessionStorage.removeItem('chunk_reload');
    }
    
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Ideally, we could log the error to an external service here
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 m-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            An unexpected error occurred. We've logged the issue and our team is looking into it.
          </p>
          {this.state.error && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg w-full max-w-lg mb-6 overflow-auto text-left text-sm font-mono text-slate-700">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={() => {
              sessionStorage.removeItem('chunk_reload');
              window.location.reload();
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
