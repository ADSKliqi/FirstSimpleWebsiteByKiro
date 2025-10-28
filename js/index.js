/**
 * Main application entry point
 * Initializes and starts the Weather Forecast App
 */

// Global app instance
let weatherApp = null;

/**
 * Initializes the weather application
 */
async function initializeApp() {
    try {
        // Create new WeatherApp instance
        weatherApp = new WeatherApp();

        // OpenWeatherMap API key
        const apiKey = '9cbad288f9fa031c944f23611bd570bc';

        // Initialize the app
        await weatherApp.initialize(apiKey);

        console.log('Weather Forecast App initialized successfully');

        // API key is configured, no need to show message

    } catch (error) {
        console.error('Failed to initialize Weather Forecast App:', error);
        showInitializationError(error);
    }
}

/**
 * Shows a message about API key configuration
 */
function showApiKeyMessage() {
    const errorContainer = document.querySelector('.error-container');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-message api-key-message" role="alert">
                <div class="error-icon">ℹ️</div>
                <div class="error-text">
                    <strong>API Key Required</strong><br>
                    To use this weather app, you need to:
                    <ol>
                        <li>Get a free API key from <a href="https://openweathermap.org/api" target="_blank">OpenWeatherMap</a></li>
                        <li>Replace the placeholder in js/index.js with your actual API key</li>
                        <li>Refresh the page</li>
                    </ol>
                </div>
            </div>
        `;
        errorContainer.style.display = 'block';
    }
}

/**
 * Shows initialization error message
 */
function showInitializationError(error) {
    const errorContainer = document.querySelector('.error-container');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-message" role="alert">
                <div class="error-icon">⚠️</div>
                <div class="error-text">
                    <strong>Initialization Error</strong><br>
                    Failed to start the weather app: ${error.message}
                </div>
                <button type="button" class="retry-btn" onclick="initializeApp()">Try Again</button>
            </div>
        `;
        errorContainer.style.display = 'block';
    }
}

/**
 * Module registry for browser environments
 * Provides access to all modules when loaded via script tags
 */
const WeatherAppModules = {
    // Services
    WeatherService: typeof WeatherService !== 'undefined' ? WeatherService : null,
    LocationService: typeof LocationService !== 'undefined' ? LocationService : null,

    // Components
    SearchInterface: typeof SearchInterface !== 'undefined' ? SearchInterface : null,
    CurrentWeatherDisplay: typeof CurrentWeatherDisplay !== 'undefined' ? CurrentWeatherDisplay : null,
    ForecastDisplay: typeof ForecastDisplay !== 'undefined' ? ForecastDisplay : null,

    // Utils
    ErrorHandler: typeof ErrorHandler !== 'undefined' ? ErrorHandler : null,

    // Models
    WeatherDataModel: typeof WeatherDataModel !== 'undefined' ? WeatherDataModel : null,

    // Main App
    WeatherApp: typeof WeatherApp !== 'undefined' ? WeatherApp : null,

    // Initialization function
    initialize: initializeApp
};

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherAppModules;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.WeatherAppModules = WeatherAppModules;
    window.weatherApp = weatherApp;
}