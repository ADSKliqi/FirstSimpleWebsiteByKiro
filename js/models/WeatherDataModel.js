/**
 * WeatherDataModel - Defines the structure of weather data used throughout the application
 * Provides consistent data models for weather information
 */

/**
 * Weather Data Model Structure
 * Normalized structure that separates current conditions from forecast data
 */
const WeatherDataModel = {
    /**
     * Complete weather data structure
     */
    WeatherData: {
        location: {
            name: '', // string - City name
            country: '' // string - Country code or name
        },
        current: {
            temperature: 0, // number - Temperature in Celsius
            condition: '', // string - Weather condition (sunny, cloudy, etc.)
            description: '', // string - Detailed weather description
            icon: '', // string - Weather icon identifier
            humidity: 0, // number - Humidity percentage
            windSpeed: 0 // number - Wind speed
        },
        forecast: [
            // Array of daily forecast objects
            {
                date: '', // string - Date in ISO format or formatted string
                highTemp: 0, // number - High temperature in Celsius
                lowTemp: 0, // number - Low temperature in Celsius
                condition: '', // string - Weather condition
                icon: '' // string - Weather icon identifier
            }
        ]
    },

    /**
     * Creates an empty weather data object with proper structure
     * @returns {Object} Empty weather data object
     */
    createEmpty() {
        return {
            location: {
                name: '',
                country: ''
            },
            current: {
                temperature: 0,
                condition: '',
                description: '',
                icon: '',
                humidity: 0,
                windSpeed: 0
            },
            forecast: []
        };
    },

    /**
     * Validates weather data structure
     * @param {Object} weatherData - Weather data to validate
     * @returns {boolean} True if valid structure
     */
    validate(weatherData) {
        // Implementation will be added in later tasks
        throw new Error('Method not implemented yet');
    },

    /**
     * Creates a forecast day object
     * @param {string} date - Date string
     * @param {number} highTemp - High temperature
     * @param {number} lowTemp - Low temperature
     * @param {string} condition - Weather condition
     * @param {string} icon - Weather icon
     * @returns {Object} Forecast day object
     */
    createForecastDay(date, highTemp, lowTemp, condition, icon) {
        return {
            date,
            highTemp,
            lowTemp,
            condition,
            icon
        };
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherDataModel;
}