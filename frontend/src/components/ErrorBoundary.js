import React from 'react';
import ErrorHandler from '../utils/errorHandler';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        ErrorHandler.logError(error, `ERROR_BOUNDARY: ${errorInfo.componentStack}`);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    borderRadius: '15px',
                    margin: '20px',
                    border: '2px solid #fecaca'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '20px'
                    }}>
                        ⚠️
                    </div>
                    <h2 style={{
                        color: '#dc2626',
                        marginBottom: '15px'
                    }}>
                        Something went wrong
                    </h2>
                    <p style={{
                        color: '#7f1d1d',
                        marginBottom: '25px'
                    }}>
                        We're sorry, but something unexpected happened. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;