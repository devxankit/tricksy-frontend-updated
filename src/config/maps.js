// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Use Vite's import.meta.env for environment variables
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
  
  // Default map settings
  DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 }, // New York
  DEFAULT_ZOOM: 14,
  
  // Map styles for better visualization
  MAP_STYLES: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ],
  
  // Marker colors
  MARKER_COLORS: {
    BUS: '#5C2D91',
    PICKUP: '#10B981',
    DROP: '#3B82F6',
    USER: '#F59E0B'
  }
};

// Instructions for setting up Google Maps API
export const GOOGLE_MAPS_SETUP_INSTRUCTIONS = `
To enable Google Maps integration:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
4. Create credentials (API Key)
5. Add the API key to your .env file:
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
6. Restrict the API key to your domain for security

Note: Google Maps API has usage limits and may require billing setup for production use.
`; 