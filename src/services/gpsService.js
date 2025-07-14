class GPSService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.listeners = [];
    this.isTracking = false;
  }

  // Get current GPS position
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(this.currentPosition);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Start continuous GPS tracking
  startTracking(onPositionUpdate) {
    if (this.isTracking) {
      return;
    }

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    this.isTracking = true;
    this.listeners.push(onPositionUpdate);

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        // Notify all listeners
        this.listeners.forEach(listener => {
          if (typeof listener === 'function') {
            listener(this.currentPosition);
          }
        });
      },
      (error) => {
        console.error('GPS tracking error:', error);
        this.isTracking = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  // Stop GPS tracking
  stopTracking() {
    if (this.watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.listeners = [];
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || 'Unknown location';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Unknown location';
    }
  }

  // Get coordinates from address (geocoding)
  async getCoordinatesFromAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  // Check if GPS permission is granted
  async checkGPSPermission() {
    try {
      await this.getCurrentPosition();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Request GPS permission
  async requestGPSPermission() {
    try {
      await this.getCurrentPosition();
      return true;
    } catch (error) {
      console.error('GPS permission denied:', error);
      return false;
    }
  }
}

export default new GPSService(); 