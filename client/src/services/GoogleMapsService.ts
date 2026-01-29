// GoogleMapsService.ts - Google Maps API integration
declare global {
  interface Window {
    google: any;
  }
}

export class GoogleMapsService {
  private static apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyBvOkBwgGlbUiuS-oKrPGJGV2C0aGiflTE';
  private static isLoaded = false;

  // Load Google Maps API
  static async loadGoogleMaps(): Promise<void> {
    if (this.isLoaded || window.google) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Get nearby pharmacies using Google Places API
  static async getNearbyPharmacies(lat: number, lng: number, radius: number = 5000) {
    try {
      await this.loadGoogleMaps();
      
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      return new Promise((resolve, reject) => {
        const request = {
          location: new window.google.maps.LatLng(lat, lng),
          radius: radius,
          type: 'pharmacy'
        };

        service.nearbySearch(request, (results: any[], status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const pharmacies = results.map(place => ({
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              rating: place.rating || 0,
              isOpen: place.opening_hours?.open_now || false,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              distance: this.calculateDistance(
                lat, lng,
                place.geometry.location.lat(),
                place.geometry.location.lng()
              )
            }));
            resolve(pharmacies);
          } else {
            reject(new Error('Failed to fetch nearby pharmacies'));
          }
        });
      });
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      return [];
    }
  }

  // Calculate distance between two coordinates
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get place details
  static async getPlaceDetails(placeId: string) {
    try {
      await this.loadGoogleMaps();
      
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      return new Promise((resolve, reject) => {
        const request = {
          placeId: placeId,
          fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'rating', 'reviews']
        };

        service.getDetails(request, (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve({
              name: place.name,
              address: place.formatted_address,
              phone: place.formatted_phone_number,
              rating: place.rating,
              openingHours: place.opening_hours?.weekday_text || [],
              isOpen: place.opening_hours?.open_now || false,
              reviews: place.reviews || []
            });
          } else {
            reject(new Error('Failed to fetch place details'));
          }
        });
      });
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  // Get directions
  static async getDirections(origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) {
    try {
      await this.loadGoogleMaps();
      
      const directionsService = new window.google.maps.DirectionsService();

      return new Promise((resolve, reject) => {
        directionsService.route({
          origin: new window.google.maps.LatLng(origin.lat, origin.lng),
          destination: new window.google.maps.LatLng(destination.lat, destination.lng),
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve(result);
          } else {
            reject(new Error('Failed to get directions'));
          }
        });
      });
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }
}