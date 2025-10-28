/**
 * SearchInterface - Handles user input for location searches and validation
 * Manages search input field, validation, and user interactions
 */
class SearchInterface {
    constructor(onSearch) {
        this.onSearch = onSearch; // Callback function for search events
        this.searchInput = null;
        this.searchButton = null;
        this.errorContainer = null;
        this.isLoading = false;
    }

    /**
     * Initializes the search interface elements
     * @param {string} containerId - ID of the container element
     */
    initialize(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }

        // Create search interface HTML structure
        container.innerHTML = `
            <div class="search-container">
                <div class="search-input-group">
                    <input 
                        type="text" 
                        id="cityInput" 
                        class="search-input" 
                        placeholder="Enter city name..." 
                        autocomplete="off"
                    />
                    <button id="searchButton" class="search-button" type="button">
                        <span class="search-text">Search</span>
                        <span class="search-spinner" style="display: none;">⟳</span>
                    </button>
                </div>
                <div id="searchError" class="search-error" style="display: none;"></div>
            </div>
        `;

        // Get references to elements
        this.searchInput = document.getElementById('cityInput');
        this.searchButton = document.getElementById('searchButton');
        this.errorContainer = document.getElementById('searchError');

        // Set up event listeners
        this.setupEventListeners();

        // Auto-focus on the input field
        this.searchInput.focus();
    }

    /**
     * Validates user input for city name
     * @param {string} cityName - The city name to validate
     * @returns {Object} Validation result
     */
    validateInput(cityName) {
        // Use LocationService for validation if available, otherwise basic validation
        if (typeof LocationService !== 'undefined') {
            const locationService = new LocationService();
            return locationService.validateLocationInput(cityName);
        }

        // Fallback validation if LocationService is not available
        if (!cityName || typeof cityName !== 'string') {
            return {
                isValid: false,
                message: 'Please enter a city name'
            };
        }

        const trimmedInput = cityName.trim();
        if (trimmedInput.length === 0) {
            return {
                isValid: false,
                message: 'Please enter a city name'
            };
        }

        if (trimmedInput.length < 2) {
            return {
                isValid: false,
                message: 'City name must be at least 2 characters long'
            };
        }

        return {
            isValid: true,
            message: 'Valid city name'
        };
    }

    /**
     * Displays search-related error messages
     * @param {string} message - Error message to display
     */
    displaySearchError(message) {
        if (this.errorContainer && message) {
            this.errorContainer.textContent = message;
            this.errorContainer.style.display = 'block';
            
            // Add error styling to input
            if (this.searchInput) {
                this.searchInput.classList.add('error');
            }
        }
    }

    /**
     * Shows loading state during search
     */
    showLoadingState() {
        this.isLoading = true;
        
        if (this.searchButton) {
            this.searchButton.disabled = true;
            this.searchButton.classList.add('loading');
            
            const searchText = this.searchButton.querySelector('.search-text');
            const searchSpinner = this.searchButton.querySelector('.search-spinner');
            
            if (searchText) searchText.style.display = 'none';
            if (searchSpinner) searchSpinner.style.display = 'inline';
        }

        if (this.searchInput) {
            this.searchInput.disabled = true;
        }

        // Clear any existing errors
        this.clearError();
    }

    /**
     * Hides loading state after search completion
     */
    hideLoadingState() {
        this.isLoading = false;
        
        if (this.searchButton) {
            this.searchButton.disabled = false;
            this.searchButton.classList.remove('loading');
            
            const searchText = this.searchButton.querySelector('.search-text');
            const searchSpinner = this.searchButton.querySelector('.search-spinner');
            
            if (searchText) searchText.style.display = 'inline';
            if (searchSpinner) searchSpinner.style.display = 'none';
        }

        if (this.searchInput) {
            this.searchInput.disabled = false;
            this.searchInput.focus(); // Re-focus for better UX
        }
    }

    /**
     * Clears any displayed errors
     */
    clearError() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.textContent = '';
        }

        if (this.searchInput) {
            this.searchInput.classList.remove('error');
        }
    }

    /**
     * Sets up event listeners for search functionality
     * @private
     */
    setupEventListeners() {
        // Handle search button click
        if (this.searchButton) {
            this.searchButton.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        // Handle enter key press in input field
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.handleSearch();
                }
            });

            // Clear errors when user starts typing
            this.searchInput.addEventListener('input', () => {
                this.clearError();
            });
        }
    }

    /**
     * Handles the search action
     * @private
     */
    handleSearch() {
        if (this.isLoading) {
            return; // Prevent multiple simultaneous searches
        }

        const cityName = this.searchInput ? this.searchInput.value : '';
        
        // Validate input
        const validation = this.validateInput(cityName);
        
        if (!validation.isValid) {
            this.displaySearchError(validation.message);
            return;
        }

        // Clear any existing errors
        this.clearError();

        // Format the city name if LocationService is available
        let formattedCityName = cityName.trim();
        if (typeof LocationService !== 'undefined') {
            const locationService = new LocationService();
            formattedCityName = locationService.formatLocationName(cityName);
        }

        // Call the search callback if provided
        if (this.onSearch && typeof this.onSearch === 'function') {
            this.onSearch(formattedCityName);
        }
    }

    /**
     * Gets the current input value
     * @returns {string} Current input value
     */
    getCurrentInput() {
        return this.searchInput ? this.searchInput.value : '';
    }

    /**
     * Sets the input value
     * @param {string} value - Value to set
     */
    setInputValue(value) {
        if (this.searchInput) {
            this.searchInput.value = value || '';
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchInterface;
}