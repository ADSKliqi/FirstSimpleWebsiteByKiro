/**
 * CurrentWeatherDisplay - Renders current weather conditions
 * Displays temperature, weather conditions, icons, and additional metrics
 */
class CurrentWeatherDisplay {
    constructor() {
        this.container = null;
        this.temperatureElement = null;
        this.conditionElement = null;
        this.iconElement = null;
        this.humidityElement = null;
        this.windSpeedElement = null;
    }

    /**
     * Initializes the current weather display elements
     * @param {string} containerId - ID of the container element
     */
    initialize(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }
        
        this.createElements();
    }

    /**
     * Creates the DOM elements for current weather display
     */
    createElements() {
        this.container.innerHTML = `
            <div class="current-weather">
                <div class="weather-header">
                    <h2>Current Weather</h2>
                    <div class="loading-spinner" style="display: none;">Loading...</div>
                </div>
                <div class="weather-main">
                    <div class="temperature-section">
                        <span class="temperature">--°C</span>
                        <img class="weather-icon" src="" alt="Weather icon" style="display: none;">
                    </div>
                    <div class="condition-section">
                        <div class="condition">--</div>
                        <div class="description">--</div>
                    </div>
                </div>
                <div class="weather-metrics">
                    <div class="metric">
                        <span class="metric-label">Humidity:</span>
                        <span class="humidity">--%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Wind Speed:</span>
                        <span class="wind-speed">-- km/h</span>
                    </div>
                </div>
            </div>
        `;
        
        // Cache element references
        this.temperatureElement = this.container.querySelector('.temperature');
        this.conditionElement = this.container.querySelector('.condition');
        this.iconElement = this.container.querySelector('.weather-icon');
        this.humidityElement = this.container.querySelector('.humidity');
        this.windSpeedElement = this.container.querySelector('.wind-speed');
        this.loadingElement = this.container.querySelector('.loading-spinner');
        this.descriptionElement = this.container.querySelector('.description');
    }

    /**
     * Renders complete weather data
     * @param {Object} weatherData - Current weather data object
     */
    render(weatherData) {
        if (!weatherData || !weatherData.current) {
            throw new Error('Invalid weather data provided');
        }
        
        const { current, location } = weatherData;
        
        this.updateTemperature(current.temperature);
        this.updateCondition(current.condition, current.icon, current.description);
        this.updateMetrics(current.humidity, current.windSpeed);
        
        // Update location if provided
        if (location) {
            const headerElement = this.container.querySelector('.weather-header h2');
            headerElement.textContent = `Current Weather - ${location.name}, ${location.country}`;
        }
        
        // Show the current weather section
        const section = this.container.closest('.current-weather-section');
        if (section) {
            section.classList.add('show');
        }
    }

    /**
     * Updates temperature display
     * @param {number} temp - Temperature in Celsius
     */
    updateTemperature(temp) {
        if (this.temperatureElement && typeof temp === 'number') {
            this.temperatureElement.textContent = `${Math.round(temp)}°C`;
        }
    }

    /**
     * Updates weather condition and icon
     * @param {string} condition - Weather condition description
     * @param {string} icon - Weather icon identifier
     * @param {string} description - Detailed weather description
     */
    updateCondition(condition, icon, description) {
        if (this.conditionElement && condition) {
            this.conditionElement.textContent = condition;
        }
        
        if (this.descriptionElement && description) {
            this.descriptionElement.textContent = description;
        }
        
        if (this.iconElement && icon) {
            // OpenWeatherMap icon URL format
            this.iconElement.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            this.iconElement.alt = condition || 'Weather icon';
            this.iconElement.style.display = 'block';
        }
    }

    /**
     * Updates additional weather metrics
     * @param {number} humidity - Humidity percentage
     * @param {number} windSpeed - Wind speed in km/h
     */
    updateMetrics(humidity, windSpeed) {
        if (this.humidityElement && typeof humidity === 'number') {
            this.humidityElement.textContent = `${humidity}%`;
        }
        
        if (this.windSpeedElement && typeof windSpeed === 'number') {
            this.windSpeedElement.textContent = `${Math.round(windSpeed)} km/h`;
        }
    }

    /**
     * Shows loading state for current weather
     */
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        
        // Hide weather data during loading
        const weatherMain = this.container.querySelector('.weather-main');
        const weatherMetrics = this.container.querySelector('.weather-metrics');
        if (weatherMain) weatherMain.style.opacity = '0.5';
        if (weatherMetrics) weatherMetrics.style.opacity = '0.5';
    }

    /**
     * Hides loading state
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        
        // Restore weather data visibility
        const weatherMain = this.container.querySelector('.weather-main');
        const weatherMetrics = this.container.querySelector('.weather-metrics');
        if (weatherMain) weatherMain.style.opacity = '1';
        if (weatherMetrics) weatherMetrics.style.opacity = '1';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrentWeatherDisplay;
}