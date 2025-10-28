/**
 * LocationService - Handles location input validation and formatting
 * Validates location input and handles location-related operations
 */
class LocationService {
    constructor() {
        // Initialize any required properties
    }

    /**
     * Validates location input format
     * @param {string} input - The location input to validate
     * @returns {Object} Validation result with isValid boolean and message
     */
    validateLocationInput(input) {
        // Check if input is provided
        if (!input || typeof input !== 'string') {
            return {
                isValid: false,
                message: 'Please enter a city name'
            };
        }

        // Trim whitespace
        const trimmedInput = input.trim();

        // Check if empty after trimming
        if (trimmedInput.length === 0) {
            return {
                isValid: false,
                message: 'Please enter a city name'
            };
        }

        // Check minimum length (at least 2 characters)
        if (trimmedInput.length < 2) {
            return {
                isValid: false,
                message: 'City name must be at least 2 characters long'
            };
        }

        // Check maximum length (reasonable limit for city names)
        if (trimmedInput.length > 100) {
            return {
                isValid: false,
                message: 'City name is too long'
            };
        }

        // Check for valid characters (letters, spaces, hyphens, apostrophes, periods)
        const validCityNamePattern = /^[a-zA-Z\s\-'.]+$/;
        if (!validCityNamePattern.test(trimmedInput)) {
            return {
                isValid: false,
                message: 'City name can only contain letters, spaces, hyphens, apostrophes, and periods'
            };
        }

        // Check for consecutive spaces or special characters
        if (/\s{2,}/.test(trimmedInput) || /[-'.]{2,}/.test(trimmedInput)) {
            return {
                isValid: false,
                message: 'Invalid city name format'
            };
        }

        return {
            isValid: true,
            message: 'Valid city name'
        };
    }

    /**
     * Formats and standardizes location names
     * @param {string} name - The location name to format
     * @returns {string} Formatted location name
     */
    formatLocationName(name) {
        if (!name || typeof name !== 'string') {
            return '';
        }

        // Trim whitespace
        let formatted = name.trim();

        // Replace multiple spaces with single space
        formatted = formatted.replace(/\s+/g, ' ');

        // Replace multiple consecutive special characters with single ones
        formatted = formatted.replace(/[-'\.]+/g, (match) => match[0]);

        // Capitalize first letter of each word
        formatted = formatted.replace(/\b\w/g, (char) => char.toUpperCase());

        // Handle special cases for common abbreviations and prefixes
        formatted = formatted.replace(/\bSt\b/g, 'St.');
        formatted = formatted.replace(/\bMt\b/g, 'Mt.');
        formatted = formatted.replace(/\bFt\b/g, 'Ft.');

        return formatted;
    }

    /**
     * Validates that input contains only valid characters for city names
     * @param {string} cityName - The city name to validate
     * @returns {boolean} True if valid format
     */
    validateCityNameFormat(cityName) {
        if (!cityName || typeof cityName !== 'string') {
            return false;
        }

        const trimmedName = cityName.trim();
        
        // Use the same validation logic as validateLocationInput but return boolean
        const validCityNamePattern = /^[a-zA-Z\s\-'.]+$/;
        return validCityNamePattern.test(trimmedName) && 
               trimmedName.length >= 2 && 
               trimmedName.length <= 100 &&
               !/\s{2,}/.test(trimmedName) && 
               !/[-'.]{2,}/.test(trimmedName);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationService;
}