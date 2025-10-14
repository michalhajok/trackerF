// src/components/ErrorBoundary.jsx - MISSING
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary:", error, errorInfo);
    // Log to external service in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center border border-error-200 bg-error-50 rounded-lg">
          <h2 className="text-xl font-bold text-error-700 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-error-600 mb-4">
            {this.props.fallbackMessage ||
              "Please refresh the page or try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-error-500 text-white px-4 py-2 rounded hover:bg-error-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
