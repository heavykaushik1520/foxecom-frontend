import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm border-danger">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-danger"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h2 className="card-title mb-3">Oops! Something went wrong</h2>
                  <p className="text-muted mb-4">
                    We're sorry, but something unexpected happened. Please try again.
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-start mb-4">
                      <summary className="text-danger cursor-pointer mb-2">
                        Error Details (Development Only)
                      </summary>
                      <pre className="bg-light p-3 rounded small overflow-auto">
                        {this.state.error.toString()}
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </details>
                  )}
                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    <button
                      className="btn btn-primary"
                      onClick={this.handleReset}
                    >
                      Try Again
                    </button>
                    <Link to="/" className="btn btn-outline-secondary">
                      Go Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
