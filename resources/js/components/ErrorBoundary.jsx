import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    resetError = () => {
        this.setState({ 
            hasError: false,
            error: null,
            errorInfo: null
        });
        
        // Call the onReset prop if provided
        if (this.props.onReset) {
            this.props.onReset();
        }
    }

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            return (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-medium">Something went wrong</h3>
                    </div>
                    
                    <p className="mt-2">
                        {this.state.error && this.state.error.toString()}
                    </p>
                    
                    <div className="mt-4">
                        <button
                            onClick={this.resetError}
                            className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Try Again
                        </button>
                    </div>
                    
                    {this.props.showDetails && this.state.errorInfo && (
                        <details className="mt-4 rounded-md border border-red-200 p-2 dark:border-red-800">
                            <summary className="cursor-pointer text-xs font-medium">Error Details</summary>
                            <pre className="mt-2 max-h-40 overflow-auto text-xs">
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        // If no error, render children normally
        return this.props.children;
    }
}

export default ErrorBoundary;
