import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, Star, Clock } from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating: number;
  distance: number;
  isOpen: boolean;
  coordinates: { lat: number; lng: number };
}

interface NearbyMedicinalMapProps {
  pharmacies: Pharmacy[];
  userLocation: { lat: number; lng: number } | null;
  onPharmacySelect: (pharmacy: Pharmacy) => void;
  selectedPharmacy?: Pharmacy | null;
}

export default function NearbyMedicinalMap({ 
  pharmacies, 
  userLocation, 
  onPharmacySelect, 
  selectedPharmacy 
}: NearbyMedicinalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    if (mapRef.current && userLocation && window.google) {
      initializeMap();
    }
  }, [userLocation]);

  useEffect(() => {
    if (map && pharmacies.length > 0) {
      updateMarkers();
    }
  }, [map, pharmacies, selectedPharmacy]);

  const initializeMap = () => {
    if (!userLocation || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 14,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Add user location marker
    new window.google.maps.Marker({
      position: userLocation,
      map: mapInstance,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    });

    setMap(mapInstance);
  };

  const updateMarkers = () => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Add pharmacy markers
    const newMarkers = pharmacies.map(pharmacy => {
      const marker = new window.google.maps.Marker({
        position: pharmacy.coordinates,
        map: map,
        title: pharmacy.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="${selectedPharmacy?.id === pharmacy.id ? '#DC2626' : '#059669'}" stroke="#FFFFFF" stroke-width="1"/>
              <circle cx="12" cy="12" r="2" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        onPharmacySelect(pharmacy);
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${pharmacy.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${pharmacy.address}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
              <span style="display: flex; align-items: center; gap: 2px; font-size: 12px;">
                ⭐ ${pharmacy.rating}
              </span>
              <span style="font-size: 12px; color: ${pharmacy.isOpen ? '#059669' : '#DC2626'};">
                ${pharmacy.isOpen ? 'Open' : 'Closed'}
              </span>
              <span style="font-size: 12px; color: #666;">
                ${pharmacy.distance.toFixed(1)} km
              </span>
            </div>
            ${pharmacy.phone ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">📞 ${pharmacy.phone}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (pharmacies.length > 0 && userLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userLocation);
      pharmacies.forEach(pharmacy => {
        bounds.extend(pharmacy.coordinates);
      });
      map.fitBounds(bounds);
    }
  };

  const getDirections = (pharmacy: Pharmacy) => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${pharmacy.coordinates.lat},${pharmacy.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-96 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {!window.google && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Pharmacy List */}
      <div className="p-4 max-h-64 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-3">Nearby Pharmacies</h3>
        <div className="space-y-3">
          {pharmacies.map(pharmacy => (
            <div
              key={pharmacy.id}
              onClick={() => onPharmacySelect(pharmacy)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedPharmacy?.id === pharmacy.id
                  ? 'border-amazon-500 bg-amazon-50'
                  : 'border-gray-200 hover:border-amazon-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{pharmacy.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  pharmacy.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pharmacy.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{pharmacy.address}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{pharmacy.distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{pharmacy.rating}</span>
                  </div>
                  {pharmacy.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{pharmacy.phone}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    getDirections(pharmacy);
                  }}
                  className="flex items-center gap-1 text-amazon-600 hover:text-amazon-700 text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}