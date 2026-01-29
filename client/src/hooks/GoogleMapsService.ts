// Google Maps Integration Service
// Implements: Map Script, User Location, Initialize Map, Places API, Distance Matrix API

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export class GoogleMapsService {
  private apiKey: string;
  private map: any = null;
  private placesService: any = null;
  private distanceService: any = null;
  private userLocation: { lat: number; lng: number } | null = null;

  constructor() {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.error("Google Maps API key not found in environment variables (VITE_GOOGLE_MAPS_API_KEY)");
    }
    this.apiKey = key || "";
  }

  // PART A - STEP 1: Add Map Script
  async loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });
  }

  // PART A - STEP 2: Get User Location
  async getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.userLocation = location;
          resolve(location);
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // PART A - STEP 3: Initialize Map
  async initializeMap(mapElement: HTMLElement, center?: { lat: number; lng: number }): Promise<any> {
    await this.loadGoogleMapsScript();

    if (!center) {
      center = await this.getUserLocation();
    }

    this.map = new window.google.maps.Map(mapElement, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'on' }]
        },
        {
          featureType: 'poi.medical',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    // Initialize Places and Distance services
    this.placesService = new window.google.maps.places.PlacesService(this.map);
    this.distanceService = new window.google.maps.DistanceMatrixService();

    // Add user location marker
    new window.google.maps.Marker({
      position: center,
      map: this.map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    });

    return this.map;
  }

  // PART C - STEP 1: Search Nearby Places (Pharmacies & Clinics)
  async findNearbyPharmacies(location: { lat: number; lng: number }, radius: number = 7000): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places service not initialized'));
        return;
      }

      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius,
        type: 'pharmacy'
      };

      this.placesService.nearbySearch(request, (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK || status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve(results || []);
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      });
    });
  }

  async findNearbyHealthcare(location: { lat: number; lng: number }, radius: number = 7000): Promise<any[]> {
    const types = ['pharmacy', 'hospital', 'doctor'];
    const results = await Promise.all(
      types.map(type =>
        new Promise<any[]>((resolve) => {
          const request = {
            location: new window.google.maps.LatLng(location.lat, location.lng),
            radius,
            type
          };
          this.placesService.nearbySearch(request, (res: any, status: any) => {
            resolve(status === 'OK' ? res : []);
          });
        })
      )
    );

    // Flatten and remove duplicates by place_id
    const combined = results.flat();
    const unique = Array.from(new Map(combined.map(p => [p.place_id, p])).values());
    return unique;
  }

  async findNearbyClinics(location: { lat: number; lng: number }, radius: number = 7000): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places service not initialized'));
        return;
      }

      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius,
        type: 'hospital'
      };

      this.placesService.nearbySearch(request, (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK || status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve(results || []);
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      });
    });
  }

  // PART D: Distance & ETA (Distance Matrix API)
  async getDistanceAndDuration(
    origins: { lat: number; lng: number }[],
    destinations: { lat: number; lng: number }[]
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.distanceService) {
        reject(new Error('Distance service not initialized'));
        return;
      }

      this.distanceService.getDistanceMatrix({
        origins: origins.map(o => new window.google.maps.LatLng(o.lat, o.lng)),
        destinations: destinations.map(d => new window.google.maps.LatLng(d.lat, d.lng)),
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response: any, status: any) => {
        if (status === window.google.maps.DistanceMatrixStatus.OK) {
          resolve(response);
        } else {
          reject(new Error(`Distance Matrix API error: ${status}`));
        }
      });
    });
  }

  // Enhanced method combining all APIs
  async getEnhancedPharmacyData(userLocation: { lat: number; lng: number }): Promise<any[]> {
    try {
      // Step 1: Find nearby healthcare facilities within 7km
      const facilities = await this.findNearbyHealthcare(userLocation, 7000);

      if (facilities.length === 0) {
        return [];
      }

      // Step 2: Get distances and durations
      const destinations = facilities.map((p: any) => ({
        lat: p.geometry.location.lat(),
        lng: p.geometry.location.lng()
      }));

      const distanceMatrix = await this.getDistanceAndDuration([userLocation], destinations);

      // Step 3: Combine data
      const enhancedPharmacies = facilities.map((pharmacy: any, index: number) => {
        const element = distanceMatrix.rows[0].elements[index];

        return {
          id: pharmacy.place_id,
          name: pharmacy.name,
          address: pharmacy.vicinity,
          distance: element.distance ? element.distance.text : 'N/A',
          duration: element.duration ? element.duration.text : 'N/A',
          rating: pharmacy.rating || 4.0,
          isOpen: pharmacy.opening_hours?.open_now ?? true,
          phone: pharmacy.formatted_phone_number,
          location: {
            lat: pharmacy.geometry.location.lat(),
            lng: pharmacy.geometry.location.lng()
          },
          priceLevel: pharmacy.price_level,
          photos: pharmacy.photos?.map((photo: any) => photo.getUrl({ maxWidth: 400 })) || [],
          types: pharmacy.types
        };
      });

      // Step 4: Add markers to map
      this.addPharmacyMarkers(enhancedPharmacies);

      return enhancedPharmacies;
    } catch (error) {
      console.error('Enhanced pharmacy data error:', error);
      throw error;
    }
  }

  // Add markers to map
  private addPharmacyMarkers(pharmacies: any[]): void {
    if (!this.map) return;

    // Clear existing markers if any (optional, but good practice if markers are tracked)

    pharmacies.forEach((pharmacy, index) => {
      const isPharmacy = pharmacy.types?.includes('pharmacy');
      const isHospital = pharmacy.types?.includes('hospital');

      const pinColor = isPharmacy ? "#34D399" : (isHospital ? "#EF4444" : "#3B82F6");
      const iconPath = isPharmacy ? "M16 8v16M8 16h16" : (isHospital ? "M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z" : "M12 2L2 7v11l10 5 10-5V7L12 2z");

      const marker = new window.google.maps.Marker({
        position: pharmacy.location,
        map: this.map,
        title: pharmacy.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="${pinColor}" stroke="white" stroke-width="2"/>
              <path d="M16 8v16M8 16h16" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${pharmacy.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${pharmacy.address}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Distance:</strong> ${pharmacy.distance}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Duration:</strong> ${pharmacy.duration}</p>
            ${pharmacy.isOpen ? '<span style="color: green;">Open</span>' : '<span style="color: red;">Closed</span>'}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
    });
  }

  // Get place details
  async getPlaceDetails(placeId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places service not initialized'));
        return;
      }

      const request = {
        placeId,
        fields: [
          'name', 'formatted_address', 'formatted_phone_number',
          'opening_hours', 'rating', 'reviews', 'website', 'photos'
        ]
      };

      this.placesService.getDetails(request, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place details error: ${status}`));
        }
      });
    });
  }

  // Calculate route
  async calculateRoute(destination: { lat: number; lng: number }, origin?: { lat: number; lng: number }): Promise<any> {
    const startLocation = origin || this.userLocation;

    if (!startLocation) {
      throw new Error('User location not available');
    }

    const directionsService = new window.google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
      directionsService.route({
        origin: startLocation,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          reject(new Error(`Directions error: ${status}`));
        }
      });
    });
  }
  // Render directions on map
  renderDirections(map: any, directionsResult: any): void {
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsRenderer.setDirections(directionsResult);
  }

  // Add markers to map
  addMarkers(map: any, items: { lat: number; lng: number; title: string; id: string }[], onMarkerClick?: (id: string) => void): any[] {
    const markers: any[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    // Add user location marker if available
    if (this.userLocation) {
      new window.google.maps.Marker({
        position: this.userLocation,
        map: map,
        title: "My Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        }
      });
      bounds.extend(this.userLocation);
    }

    items.forEach(item => {
      const marker = new window.google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map: map,
        title: item.title,
        animation: window.google.maps.Animation.DROP
      });

      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(item.id));
      }

      markers.push(marker);
      bounds.extend({ lat: item.lat, lng: item.lng });
    });

    if (items.length > 0 || this.userLocation) {
      map.fitBounds(bounds);
    }

    return markers;
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();