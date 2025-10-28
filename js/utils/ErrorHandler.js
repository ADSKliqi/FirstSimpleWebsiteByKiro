/**
 * ErrorHandler - Centralized error handling for the weather app
 * Handles different types of errors and provides user-friendly messages
 */
class ErrorHandler {
    static currentError = null;
    constructor() {
        this.errorContainer = null;
        this.currentError = null;
    }

    /**
     * Initializes error handler with display container
     * @param {string} containerId - ID of the error display container
     */
    initialize(containerId) {
        this.errorContainer = document.getElementById(containerId);
        if (!this.errorContainer) {
            console.warn(`Error container with ID '${containerId}' not found`);
        }
    }

    /**
     * Handles weather-related errors and determines appropriate response
     * @param {Error} error - The error object to handle
     * @returns {Object} Error handling result with message and retry option
     */
    static handleWeatherError(error) {
        let errorType = 'unknown';
        let message = '';
        let showRetry = true;

        // Determine error type based on error properties
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            errorType = 'network';
            message = 'Connection error. Please check your internet connection and try again.';
        } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
            errorType = 'timeout';
            message = 'Request timed out. Please try again.';
        } else if (error.status === 404 || error.message.includes('not found')) {
            errorType = 'notfound';
            message = 'Location not found. Please check the spelling and try again.';
        } else if (error.status >= 500 || error.message.includes('service unavailable')) {
            errorType = 'service';
            message = 'Weather service is currently unavailable. Please try again later.';
        } else if (error.status === 401 || error.message.includes('unauthorized')) {
            errorType = 'auth';
            message = 'Authentication error. Please check API configuration.';
            showRetry = false;
        } else {
            errorType = 'unknown';
            message = 'An unexpected error occurred. Please try again.';
        }

        // Log the error for debugging
        this.logError(error, `Weather API Error - Type: ${errorType}`);

        return {
            type: errorType,
            message: message,
            showRetry: showRetry,
            originalError: error
        };
    }

    /**
     * Displays error message to user
     * @param {string} message - Error message to display
     * @param {boolean} showRetry - Whether to show retry button
     */
    static displayError(message, showRetry = true) {
        // Find or create error container
        let errorContainer = document.getElementById('error-container');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'error-container';
            errorContainer.className = 'error-container';
            
            // Insert at the top of the main content area
            const mainContent = document.querySelector('main') || document.body;
            mainContent.insertBefore(errorContainer, mainContent.firstChild);
        }

        // Clear any existing error
        this.clearError();

        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
                ${showRetry ? '<button class="retry-button" onclick="ErrorHandler.handleRetry()">Try Again</button>' : ''}
                <button class="close-error" onclick="ErrorHandler.clearError()">×</button>
            </div>
        `;

        errorContainer.appendChild(errorElement);
        errorContainer.style.display = 'block';

        // Store current error for retry functionality
        ErrorHandler.currentError = { message, showRetry };

        // Auto-hide error after 10 seconds if no retry button
        if (!showRetry) {
            setTimeout(() => {
                this.clearError();
            }, 10000);
        }
    }

    /**
     * Handles retry functionality for failed requests
     */
    static handleRetry() {
        // Clear the current error
        this.clearError();
        
        // Trigger a custom event that components can listen to for retry logic
        const retryEvent = new CustomEvent('weatherRetry', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(retryEvent);
    }

    /**
     * Logs error details for debugging purposes
     * @param {Error} error - Error object to log
     * @param {string} context - Context where error occurred
     */
    static logError(error, context) {
        const timestamp = new Date().toISOString();
        const errorDetails = {
            timestamp: timestamp,
            context: context || 'Unknown context',
            message: error.message || 'No error message',
            name: error.name || 'Unknown error type',
            stack: error.stack || 'No stack trace available',
            status: error.status || null,
            url: error.url || null,
            userAgent: navigator.userAgent,
            debugMode: this.isDebugMode()
        };

        // Enhanced logging for debug mode
        if (this.isDebugMode()) {
            console.group(`🐛 [DEBUG] Weather App Error - ${timestamp}`);
            console.error('Context:', context);
            console.error('Error Details:', errorDetails);
            console.error('Original Error:', error);
            if (error.stack) {
                console.error('Stack Trace:', error.stack);
            }
            console.groupEnd();
        } else {
            // Standard logging for production
            console.error(`[${timestamp}] ${context}:`, errorDetails);
        }

        // Store in sessionStorage for debugging (limit to last 20 errors in debug mode, 10 in normal mode)
        try {
            const errorLog = JSON.parse(sessionStorage.getItem('weatherAppErrors') || '[]');
            errorLog.unshift(errorDetails);
            
            // Keep more errors in debug mode
            const maxErrors = this.isDebugMode() ? 20 : 10;
            if (errorLog.length > maxErrors) {
                errorLog.splice(maxErrors);
            }
            
            sessionStorage.setItem('weatherAppErrors', JSON.stringify(errorLog));
        } catch (storageError) {
            console.warn('Could not store error in sessionStorage:', storageError);
        }
    }

    /**
     * Clears currently displayed error
     */
    static clearError() {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = '';
            errorContainer.style.display = 'none';
        }
        
        // Clear stored error state
        ErrorHandler.currentError = null;
    }

    /**
     * Gets user-friendly error message based on error type
     * @param {string} errorType - Type of error (network, timeout, notfound, etc.)
     * @returns {string} User-friendly error message
     */
    static getErrorMessage(errorType) {
        const errorMessages = {
            network: 'Connection error. Please check your internet connection and try again.',
            timeout: 'Request timed out. Please try again.',
            notfound: 'Location not found. Please check the spelling and try again.',
            service: 'Weather service is currently unavailable. Please try again later.',
            auth: 'Authentication error. Please check API configuration.',
            unknown: 'An unexpected error occurred. Please try again.'
        };

        return errorMessages[errorType] || errorMessages.unknown;
    }

    /**
     * Gets all logged errors for debugging purposes
     * @returns {Array} Array of logged error objects
     */
    static getErrorLog() {
        try {
            return JSON.parse(sessionStorage.getItem('weatherAppErrors') || '[]');
        } catch (error) {
            console.warn('Could not retrieve error log:', error);
            return [];
        }
    }

    /**
     * Clears the error log
     */
    static clearErrorLog() {
        try {
            sessionStorage.removeItem('weatherAppErrors');
            console.log('Error log cleared');
        } catch (error) {
            console.warn('Could not clear error log:', error);
        }
    }

    /**
     * Exports error log as downloadable JSON file for debugging
     */
    static exportErrorLog() {
        try {
            const errorLog = this.getErrorLog();
            const dataStr = JSON.stringify(errorLog, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `weather-app-errors-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Error log exported successfully');
        } catch (error) {
            console.error('Could not export error log:', error);
        }
    }

    /**
     * Enables debug mode for enhanced error logging
     * @param {boolean} enabled - Whether to enable debug mode
     */
    static setDebugMode(enabled) {
        if (enabled) {
            sessionStorage.setItem('weatherAppDebug', 'true');
            console.log('Debug mode enabled for Weather App');
        } else {
            sessionStorage.removeItem('weatherAppDebug');
            console.log('Debug mode disabled for Weather App');
        }
    }

    /**
     * Checks if debug mode is enabled
     * @returns {boolean} True if debug mode is enabled
     */
    static isDebugMode() {
        return sessionStorage.getItem('weatherAppDebug') === 'true';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}