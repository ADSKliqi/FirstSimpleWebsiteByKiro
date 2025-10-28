/**
 * WeatherApp - Main application class that coordinates all components
 * Manages the overall application flow and component interactions
 */
class WeatherApp {
    constructor() {
        this.weatherService = null;
        this.locationService = null;
        this.searchInterface = null;
        this.currentWeatherDisplay = null;
        this.forecastDisplay = null;
        this.errorHandler = null;
        this.isInitialized = false;
        this.apiKey = null;
        
        // Performance optimization properties
        this.weatherCache = new Map(); // Cache for weather data
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes in milliseconds
        this.pendingRequests = new Map(); // Request deduplication
        this.lastSearchedLocation = null;
    }

    /**
     * Initializes the weather application
     * Sets up all components and their interactions
     */
    async initialize(apiKey) {
        try {
            this.apiKey = apiKey;
            
            // Initialize all components
            this.initializeComponents();
            
            // Set up event listeners and component communication
            this.setupEventListeners();
            
            // Initialize UI components
            this.searchInterface.initialize('search-container');
            this.currentWeatherDisplay.initialize('current-weather-container');
            this.forecastDisplay.initialize('forecast-container');
            
            // Load last searched location from localStorage
            this.loadLastSearchedLocation();
            
            this.isInitialized = true;
            console.log('Weather app initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize weather app:', error);
            this.handleError(error, 'initialization');
        }
    }

    /**
     * Handles search requests from the search interface
     * @param {string} cityName - Name of city to search for
     */
    async handleSearch(cityName) {
        if (!this.isInitialized) {
            console.error('App not initialized');
            return;
        }

        const normalizedCityName = cityName.toLowerCase().trim();
        
        try {
            // Check cache first
            const cachedData = this.getCachedWeatherData(normalizedCityName);
            if (cachedData) {
                console.log('Using cached weather data for:', cityName);
                this.displayWeatherData(cachedData);
                this.saveLastSearchedLocation(cityName);
                return;
            }

            // Check for pending request to avoid duplicate API calls
            if (this.pendingRequests.has(normalizedCityName)) {
                console.log('Request already pending for:', cityName);
                return await this.pendingRequests.get(normalizedCityName);
            }

            // Show loading states
            this.searchInterface.showLoadingState();
            this.currentWeatherDisplay.showLoading();
            this.forecastDisplay.showLoading();

            // Clear any previous errors
            ErrorHandler.clearError();

            // Create and store the pending request promise
            const requestPromise = this.fetchWeatherData(cityName);
            this.pendingRequests.set(normalizedCityName, requestPromise);

            try {
                const weatherData = await requestPromise;
                
                // Debug: Log the weather data structure
                console.log('Weather data received:', weatherData);
                console.log('Forecast data:', weatherData.forecast);
                
                // Cache the successful result
                this.cacheWeatherData(normalizedCityName, weatherData);
                
                // Save as last searched location
                this.saveLastSearchedLocation(cityName);
                
                // Display the weather data
                this.displayWeatherData(weatherData);

            } finally {
                // Remove from pending requests
                this.pendingRequests.delete(normalizedCityName);
            }

        } catch (error) {
            console.error('Search failed:', error);
            this.handleError(error, 'search');
        } finally {
            // Hide loading states
            this.searchInterface.hideLoadingState();
            this.currentWeatherDisplay.hideLoading();
            this.forecastDisplay.hideLoading();
        }
    }

    /**
     * Displays weather data in the UI components
     * @param {Object} weatherData - Complete weather data object
     */
    displayWeatherData(weatherData) {
        try {
            // Display current weather
            this.currentWeatherDisplay.render(weatherData);
            
            // Display forecast - pass only the forecast array
            this.forecastDisplay.render(weatherData.forecast);
            
            console.log('Weather data displayed successfully');
            
        } catch (error) {
            console.error('Failed to display weather data:', error);
            this.handleError(error, 'display');
        }
    }

    /**
     * Handles errors during weather data retrieval
     * @param {Error} error - Error that occurred
     * @param {string} context - Context where error occurred
     */
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        
        // Use ErrorHandler to process and display user-friendly error messages
        const errorResult = ErrorHandler.handleWeatherError(error);
        
        // Display the error with appropriate retry option
        ErrorHandler.displayError(errorResult.message, errorResult.showRetry);
    }

    /**
     * Sets up event listeners and component communication
     */
    setupEventListeners() {
        // The search interface will call handleSearch when user searches
        // This is already set up in the SearchInterface constructor callback
        
        // Set up any additional global event listeners if needed
        document.addEventListener('keydown', (event) => {
            // Allow Escape key to clear errors
            if (event.key === 'Escape') {
                ErrorHandler.clearError();
            }
        });

        // Listen for retry events from ErrorHandler
        document.addEventListener('weatherRetry', () => {
            // Get the last searched city and retry
            const lastInput = this.searchInterface.getCurrentInput();
            if (lastInput && lastInput.trim()) {
                this.handleSearch(lastInput.trim());
            }
        });
    }

    /**
     * Initializes all service and component instances
     */
    initializeComponents() {
        // Initialize services
        this.weatherService = new WeatherService();
        this.weatherService.setApiKey(this.apiKey);
        
        this.locationService = new LocationService();
        
        // ErrorHandler is used as static class, no need to instantiate
        
        // Initialize UI components with callback for search
        this.searchInterface = new SearchInterface((cityName) => {
            this.handleSearch(cityName);
        });
        
        this.currentWeatherDisplay = new CurrentWeatherDisplay();
        this.forecastDisplay = new ForecastDisplay();
    }

    /**
     * Sets or updates the API key
     * @param {string} apiKey - The weather service API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        if (this.weatherService) {
            this.weatherService.setApiKey(apiKey);
        }
    }

    /**
     * Gets the current initialization status
     * @returns {boolean} True if app is initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Fetches weather data from the API
     * @param {string} cityName - Name of city to get weather for
     * @returns {Promise<Object>} Combined weather data
     * @private
     */
    async fetchWeatherData(cityName) {
        // Get current weather and forecast data
        const [currentWeather, forecastData] = await Promise.all([
            this.weatherService.getCurrentWeather(cityName),
            this.weatherService.getForecast(cityName)
        ]);

        // Combine the data
        return {
            location: currentWeather.location,
            current: currentWeather.current,
            forecast: forecastData.forecast
        };
    }

    /**
     * Caches weather data with timestamp
     * @param {string} cityName - Normalized city name (lowercase)
     * @param {Object} weatherData - Weather data to cache
     * @private
     */
    cacheWeatherData(cityName, weatherData) {
        const cacheEntry = {
            data: weatherData,
            timestamp: Date.now()
        };
        
        this.weatherCache.set(cityName, cacheEntry);
        
        // Clean up old cache entries to prevent memory leaks
        this.cleanupCache();
    }

    /**
     * Retrieves cached weather data if still valid
     * @param {string} cityName - Normalized city name (lowercase)
     * @returns {Object|null} Cached weather data or null if not found/expired
     * @private
     */
    getCachedWeatherData(cityName) {
        const cacheEntry = this.weatherCache.get(cityName);
        
        if (!cacheEntry) {
            return null;
        }
        
        // Check if cache entry is still valid (within 10 minutes)
        const isValid = (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
        
        if (!isValid) {
            this.weatherCache.delete(cityName);
            return null;
        }
        
        return cacheEntry.data;
    }

    /**
     * Cleans up expired cache entries
     * @private
     */
    cleanupCache() {
        const now = Date.now();
        
        for (const [cityName, cacheEntry] of this.weatherCache.entries()) {
            if ((now - cacheEntry.timestamp) >= this.cacheTimeout) {
                this.weatherCache.delete(cityName);
            }
        }
    }

    /**
     * Saves the last searched location to localStorage
     * @param {string} cityName - City name to save
     * @private
     */
    saveLastSearchedLocation(cityName) {
        try {
            this.lastSearchedLocation = cityName;
            localStorage.setItem('weatherApp_lastLocation', cityName);
        } catch (error) {
            console.warn('Could not save last searched location:', error);
        }
    }

    /**
     * Loads the last searched location from localStorage
     * @private
     */
    loadLastSearchedLocation() {
        try {
            const lastLocation = localStorage.getItem('weatherApp_lastLocation');
            if (lastLocation) {
                this.lastSearchedLocation = lastLocation;
                
                // Optionally pre-populate the search field
                if (this.searchInterface) {
                    this.searchInterface.setInputValue(lastLocation);
                }
                
                console.log('Loaded last searched location:', lastLocation);
            }
        } catch (error) {
            console.warn('Could not load last searched location:', error);
        }
    }

    /**
     * Gets the last searched location
     * @returns {string|null} Last searched location or null
     */
    getLastSearchedLocation() {
        return this.lastSearchedLocation;
    }

    /**
     * Clears the weather data cache
     */
    clearCache() {
        this.weatherCache.clear();
        console.log('Weather data cache cleared');
    }

    /**
     * Gets cache statistics for debugging
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        
        for (const [cityName, cacheEntry] of this.weatherCache.entries()) {
            if ((now - cacheEntry.timestamp) < this.cacheTimeout) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }
        
        return {
            totalEntries: this.weatherCache.size,
            validEntries,
            expiredEntries,
            cacheTimeout: this.cacheTimeout
        };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherApp;
}