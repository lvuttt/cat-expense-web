/**
 * ErrorBoundary — catches render errors and displays a friendly fallback UI.
 *
 * Class component because React error boundaries require getDerivedStateFromError
 * and componentDidCatch, which are not available in function components.
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '32px',
            textAlign: 'center',
            color: 'var(--color-text-primary)',
          }}
        >
          <span style={{ fontSize: '4rem', marginBottom: '16px' }}>😿</span>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            Something went wrong
          </h1>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              marginBottom: '24px',
              maxWidth: '400px',
            }}
          >
            The cat knocked something over. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-accent-gradient)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
