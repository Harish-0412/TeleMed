import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};
const defaultCenter = {
  lat: 40.712776,
  lng: -74.005974,
};

export default function NearbyMedicalMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAAzTBARCQlnxFQdOGRFJLMQi5PB20r2zk",
    libraries,
  });

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [error, setError] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);

  // 1. Get & Track User Location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Could not get your location. Please enable location services.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  // 2. Search Nearby Pharmacies (Real Data)
  useEffect(() => {
    if (isLoaded && map && userLocation) {
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        location: userLocation,
        rankBy: window.google.maps.places.RankBy.DISTANCE,
        type: ['pharmacy']
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Limit to top 20 nearest
          const nearest = results.slice(0, 20);
          setPharmacies(nearest);
          
          // Calculate Distances
          const distanceService = new window.google.maps.DistanceMatrixService();
          distanceService.getDistanceMatrix(
            {
              origins: [userLocation],
              destinations: nearest.map(p => p.geometry.location),
              travelMode: 'DRIVING'
            },
            (response, status) => {
              if (status === 'OK') {
                const enriched = nearest.map((p, i) => ({
                  ...p,
                  distanceText: response.rows[0].elements[i].distance?.text,
                  durationText: response.rows[0].elements[i].duration?.text
                }));
                setPharmacies(enriched);
              }
            }
          );
        } else {
          console.warn("Places search failed or returned no results:", status);
        }
      });
    }
  }, [isLoaded, map, userLocation]);

  // 3. Calculate Route
  const calculateRoute = useCallback((destination) => {
    if (!userLocation || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          // Extract precise distance/duration from route
          const route = result.routes[0].legs[0];
          setDistanceInfo({
            distance: route.distance.text,
            duration: route.duration.text
          });
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  }, [userLocation]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div style={{ position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={userLocation || defaultCenter}
        onLoad={onMapLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* User Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "white",
            }}
            title="You are here"
          />
        )}

        {/* Pharmacy Markers */}
        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.place_id}
            position={pharmacy.geometry.location}
            onClick={() => {
              setSelectedPharmacy(pharmacy);
              calculateRoute(pharmacy.geometry.location);
            }}
          />
        ))}

        {/* Directions Renderer */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: true, // We already have markers
              polylineOptions: {
                strokeColor: "#4285F4",
                strokeWeight: 5,
              }
            }}
          />
        )}

        {/* Info Window */}
        {selectedPharmacy && (
          <InfoWindow
            position={selectedPharmacy.geometry.location}
            onCloseClick={() => {
              setSelectedPharmacy(null);
              setDirectionsResponse(null);
              setDistanceInfo(null);
            }}
          >
            <div style={{ maxWidth: '200px' }}>
              <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>{selectedPharmacy.name}</h3>
              <p style={{ margin: '0 0 5px', fontSize: '13px' }}>{selectedPharmacy.vicinity}</p>
              
              {selectedPharmacy.rating && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ color: '#f4b400', marginRight: '4px' }}>★</span>
                  <span>{selectedPharmacy.rating}</span>
                </div>
              )}

              {distanceInfo ? (
                <div style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <strong>Distance:</strong> {distanceInfo.distance}<br/>
                  <strong>ETA:</strong> {distanceInfo.duration}
                </div>
              ) : (
                 selectedPharmacy.distanceText && (
                  <div style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Distance:</strong> {selectedPharmacy.distanceText}<br/>
                    <strong>ETA:</strong> {selectedPharmacy.durationText}
                  </div>
                 )
              )}
              
              <button
                 style={{
                   marginTop: '10px',
                   padding: '8px 12px',
                   backgroundColor: '#4285F4',
                   color: 'white',
                   border: 'none',
                   borderRadius: '4px',
                   cursor: 'pointer',
                   width: '100%'
                 }}
                 onClick={() => calculateRoute(selectedPharmacy.geometry.location)}
              >
                Show Route
              </button>
              <button
                 style={{
                   marginTop: '8px',
                   padding: '8px 12px',
                   backgroundColor: '#34A853',
                   color: 'white',
                   border: 'none',
                   borderRadius: '4px',
                   cursor: 'pointer',
                   width: '100%'
                 }}
                 onClick={() => {
                   const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : 'Current+Location';
                   const dest = `${selectedPharmacy.geometry.location.lat()},${selectedPharmacy.geometry.location.lng()}`;
                   const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
                   window.open(url, '_blank');
                 }}
              >
                Open in Google Maps
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          color: '#d93025',
          fontWeight: 'bold'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
