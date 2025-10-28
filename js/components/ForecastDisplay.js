/**
 * ForecastDisplay - Renders 5-day weather forecast
 * Displays daily forecast cards with temperatures, icons, and dates
 */
class ForecastDisplay {
    constructor() {
        this.container = null;
        this.forecastCards = [];
    }

    /**
     * Initializes the forecast display elements
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
     * Creates the DOM elements for forecast display
     */
    createElements() {
        this.container.innerHTML = `
            <div class="forecast-display">
                <div class="forecast-header">
                    <h2>5-Day Forecast</h2>
                    <div class="loading-spinner" style="display: none;">Loading...</div>
                </div>
                <div class="forecast-grid">
                    <!-- Forecast cards will be dynamically added here -->
                </div>
            </div>
        `;
        
        // Cache element references
        this.forecastGrid = this.container.querySelector('.forecast-grid');
        this.loadingElement = this.container.querySelector('.loading-spinner');
    }

    /**
     * Renders complete forecast data
     * @param {Array} forecastData - Array of daily forecast objects
     */
    render(forecastData) {
        if (!Array.isArray(forecastData)) {
            throw new Error('Forecast data must be an array');
        }
        
        this.clearForecast();
        
        // Limit to 5 days as per requirements
        const limitedForecast = forecastData.slice(0, 5);
        
        limitedForecast.forEach(dayData => {
            const dayCard = this.createDayCard(dayData);
            this.forecastGrid.appendChild(dayCard);
            this.forecastCards.push(dayCard);
        });
        
        // Show the forecast section
        const section = this.container.closest('.forecast-section');
        if (section) {
            section.classList.add('show');
        }
    }

    /**
     * Creates a single day forecast card
     * @param {Object} dayData - Single day forecast data
     * @returns {HTMLElement} Created forecast card element
     */
    createDayCard(dayData) {
        if (!dayData) {
            throw new Error('Day data is required');
        }
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        const formattedDate = this.formatDate(dayData.date);
        const highTemp = Math.round(dayData.highTemp || 0);
        const lowTemp = Math.round(dayData.lowTemp || 0);
        const condition = dayData.condition || 'Unknown';
        const icon = dayData.icon || '';
        
        card.innerHTML = `
            <div class="forecast-date">${formattedDate}</div>
            <div class="forecast-icon">
                ${icon ? `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${condition}" />` : ''}
            </div>
            <div class="forecast-condition">${condition}</div>
            <div class="forecast-temps">
                <span class="high-temp">${highTemp}°</span>
                <span class="temp-separator">/</span>
                <span class="low-temp">${lowTemp}°</span>
            </div>
        `;
        
        return card;
    }

    /**
     * Formats date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) {
            return 'Unknown';
        }
        
        let dateObj;
        if (typeof date === 'string') {
            dateObj = new Date(date);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            return 'Invalid Date';
        }
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        // Format as "Today", "Tomorrow", or day name
        if (dateObj.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (dateObj.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            // Return day name (e.g., "Monday", "Tuesday")
            return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        }
    }

    /**
     * Shows loading state for forecast
     */
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        
        // Hide forecast grid during loading
        if (this.forecastGrid) {
            this.forecastGrid.style.opacity = '0.5';
        }
    }

    /**
     * Hides loading state
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        
        // Restore forecast grid visibility
        if (this.forecastGrid) {
            this.forecastGrid.style.opacity = '1';
        }
    }

    /**
     * Clears all forecast cards
     */
    clearForecast() {
        if (this.forecastGrid) {
            this.forecastGrid.innerHTML = '';
        }
        this.forecastCards = [];
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForecastDisplay;
}