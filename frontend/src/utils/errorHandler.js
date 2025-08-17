// Global error handler for frontend
class ErrorHandler {
    static logError(error, context = '') {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error(`[ErrorHandler] ${context}:`, errorInfo);
        
        // Send to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            this.sendToMonitoring(errorInfo);
        }
    }

    static sendToMonitoring(errorInfo) {
        // Implement monitoring service integration
        try {
            fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorInfo)
            }).catch(() => {}); // Silent fail for monitoring
        } catch (e) {
            // Silent fail
        }
    }

    static handleApiError(error, showAlert = true) {
        let message = 'An unexpected error occurred';
        
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            message = data?.message || `Server error (${status})`;
            
            if (status === 401) {
                message = 'Session expired. Please login again.';
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
        } else if (error.request) {
            // Network error
            message = 'Network error. Please check your connection.';
        }

        this.logError(error, 'API_ERROR');
        
        if (showAlert) {
            alert(message);
        }
        
        return message;
    }

    static handleAsyncError(asyncFn) {
        return async (...args) => {
            try {
                return await asyncFn(...args);
            } catch (error) {
                this.logError(error, 'ASYNC_ERROR');
                throw error;
            }
        };
    }
}

// Global error event listeners
window.addEventListener('error', (event) => {
    ErrorHandler.logError(event.error, 'GLOBAL_ERROR');
});

window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.logError(new Error(event.reason), 'UNHANDLED_PROMISE');
});

export default ErrorHandler;