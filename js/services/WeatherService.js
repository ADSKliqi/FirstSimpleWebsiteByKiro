/**
 * WeatherService - Handles weather API integration and data transformation
 * Manages API calls to weather service and transforms responses to application format
 */
class WeatherService {
    constructor() {
        this.apiKey = null; // To be configured
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.timeout = 5000; // 5 seconds as per requirements
    }

    /**
     * Retrieves current weather data for a given city
     * @param {string} cityName - Name of the city to get weather for
     * @returns {Promise<Object>} Current weather data
     */
    async getCurrentWeather(cityName) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
            throw new Error('Valid city name is required');
        }

        const url = `${this.baseUrl}/weather?q=${encodeURIComponent(cityName.trim())}&appid=${this.apiKey}&units=metric`;
        
        try {
            const response = await this.makeApiRequest(url);
            return this.transformCurrentWeatherData(response);
        } catch (error) {
            throw this.handleApiError(error);
        }
    }

    /**
     * Retrieves 5-day weather forecast for a given city
     * @param {string} cityName - Name of the city to get forecast for
     * @returns {Promise<Object>} Forecast data
     */
    async getForecast(cityName) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
            throw new Error('Valid city name is required');
        }

        const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(cityName.trim())}&appid=${this.apiKey}&units=metric`;
        
        try {
            const response = await this.makeApiRequest(url);
            return this.transformForecastData(response);
        } catch (error) {
            throw this.handleApiError(error);
        }
    }

    /**
     * Handles API errors and transforms them to user-friendly messages
     * @param {Error} error - The error object from API call
     * @returns {Error} Formatted error with user-friendly message
     */
    handleApiError(error) {
        let userMessage = 'An unexpected error occurred. Please try again.';
        let errorType = 'unknown';

        if (error.type === 'timeout') {
            userMessage = 'Request timed out. Please try again.';
            errorType = 'timeout';
        } else if (error.status) {
            switch (error.status) {
                case 401:
                    userMessage = 'Weather service authentication failed. Please check configuration.';
                    errorType = 'auth';
                    break;
                case 404:
                    userMessage = 'Location not found. Please check the spelling and try again.';
                    errorType = 'not_found';
                    break;
                case 429:
                    userMessage = 'Too many requests. Please wait a moment and try again.';
                    errorType = 'rate_limit';
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    userMessage = 'Weather service is currently unavailable. Please try again later.';
                    errorType = 'service_unavailable';
                    break;
                default:
                    userMessage = 'Weather service error. Please try again.';
                    errorType = 'api_error';
            }
        } else if (error.message && error.message.includes('Failed to fetch')) {
            userMessage = 'Connection error. Please check your internet connection and try again.';
            errorType = 'network';
        }

        const formattedError = new Error(userMessage);
        formattedError.type = errorType;
        formattedError.originalError = error;
        
        return formattedError;
    }

    /**
     * Sets the API key for weather service
     * @param {string} apiKey - The API key for weather service
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Makes an API request with timeout handling
     * @param {string} url - The API endpoint URL
     * @returns {Promise<Object>} API response data
     * @private
     */
    async makeApiRequest(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(`API request failed: ${response.status}`);
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                const timeoutError = new Error('Request timed out');
                timeoutError.type = 'timeout';
                throw timeoutError;
            }
            
            throw error;
        }
    }

    /**
     * Transforms OpenWeatherMap current weather API response to application data model
     * @param {Object} apiResponse - Raw API response from OpenWeatherMap
     * @returns {Object} Transformed weather data
     * @private
     */
    transformCurrentWeatherData(apiResponse) {
        return {
            location: {
                name: apiResponse.name,
                country: apiResponse.sys.country
            },
            current: {
                temperature: Math.round(apiResponse.main.temp),
                condition: apiResponse.weather[0].main,
                description: apiResponse.weather[0].description,
                icon: apiResponse.weather[0].icon,
                humidity: apiResponse.main.humidity,
                windSpeed: Math.round(apiResponse.wind?.speed * 3.6) || 0 // Convert m/s to km/h
            }
        };
    }

    /**
     * Transforms OpenWeatherMap forecast API response to application data model
     * @param {Object} apiResponse - Raw API response from OpenWeatherMap
     * @returns {Object} Transformed forecast data
     * @private
     */
    transformForecastData(apiResponse) {
        // Group forecast data by day (OpenWeatherMap returns 3-hour intervals)
        const dailyForecasts = {};
        
        apiResponse.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    date: dateKey,
                    temps: [],
                    conditions: [],
                    icons: []
                };
            }
            
            dailyForecasts[dateKey].temps.push(item.main.temp);
            dailyForecasts[dateKey].conditions.push(item.weather[0].main);
            dailyForecasts[dateKey].icons.push(item.weather[0].icon);
        });

        // Convert to array and take first 5 days
        const forecast = Object.values(dailyForecasts)
            .slice(0, 5)
            .map(day => ({
                date: day.date,
                highTemp: Math.round(Math.max(...day.temps)),
                lowTemp: Math.round(Math.min(...day.temps)),
                condition: this.getMostFrequentCondition(day.conditions),
                icon: this.getMostFrequentIcon(day.icons)
            }));

        return {
            location: {
                name: apiResponse.city.name,
                country: apiResponse.city.country
            },
            forecast: forecast
        };
    }

    /**
     * Gets the most frequent weather condition from an array
     * @param {Array} conditions - Array of weather conditions
     * @returns {string} Most frequent condition
     * @private
     */
    getMostFrequentCondition(conditions) {
        const frequency = {};
        conditions.forEach(condition => {
            frequency[condition] = (frequency[condition] || 0) + 1;
        });
        
        return Object.keys(frequency).reduce((a, b) => 
            frequency[a] > frequency[b] ? a : b
        );
    }

    /**
     * Gets the most frequent weather icon from an array
     * @param {Array} icons - Array of weather icons
     * @returns {string} Most frequent icon
     * @private
     */
    getMostFrequentIcon(icons) {
        const frequency = {};
        icons.forEach(icon => {
            frequency[icon] = (frequency[icon] || 0) + 1;
        });
        
        return Object.keys(frequency).reduce((a, b) => 
            frequency[a] > frequency[b] ? a : b
        );
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherService;
}