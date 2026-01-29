import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Phone, ExternalLink, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';

// Types
interface Location {
  lat: number;
  lng: number;
}

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: any;
  };
  rating?: number;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: any[];
  formatted_phone_number?: string;
  website?: string;
}

interface PlaceWithDistance extends PlaceResult {
  distance: string;
  duration: string;
  distanceValue: number;
  durationValue: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const PharmacyFinder: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [pharmacies, setPharmacies] = useState<PlaceWithDistance[]>([]);
  const [clinics, setClinics] = useState<PlaceWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'clinics'>('pharmacies');
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize simple map display
  useEffect(() => {
    if (userLocation && mapRef.current) {
      setMapLoaded(true);
    }
  }, [userLocation]);

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        console.log('User location:', location);
      },
      (error) => {
        setError('Location access required. Please enable location services.');
        setLoading(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Mock search function
  const searchNearbyPlaces = async (type: 'pharmacy' | 'hospital') => {
    // Return empty array as mock data is loaded separately
    return [];
  };

  // Mock distance calculation
  const calculateDistances = async (places: PlaceResult[]): Promise<PlaceWithDistance[]> => {
    return [];
  };

  // Mock marker function
  const addMarkersToMap = (places: PlaceWithDistance[], type: 'pharmacy' | 'clinic') => {
    // No-op for mock version
  };

  // Mock search function
  const searchPlaces = async () => {
    if (!userLocation) {
      getCurrentLocation();
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Load mock data
      loadMockData();
    } catch (err) {
      setError('Failed to load nearby places.');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'pharmacies' | 'clinics') => {
    setActiveTab(tab);
    if (tab === 'pharmacies' && pharmacies.length > 0) {
      addMarkersToMap(pharmacies, 'pharmacy');
    } else if (tab === 'clinics' && clinics.length > 0) {
      addMarkersToMap(clinics, 'clinic');
    }
  };

  // Load mock data instead of Google Maps
  useEffect(() => {
    if (userLocation) {
      loadMockData();
    }
  }, [userLocation]);

  const loadMockData = () => {
    const mockPharmacies: PlaceWithDistance[] = [
      {
        place_id: '1',
        name: 'HealthPlus Pharmacy',
        vicinity: '123 Main Street, City Center',
        geometry: { location: { lat: () => userLocation!.lat + 0.005, lng: () => userLocation!.lng + 0.005 } },
        rating: 4.5,
        opening_hours: { open_now: true },
        distance: '0.8 km',
        duration: '3 mins',
        distanceValue: 800,
        durationValue: 180,
        formatted_phone_number: '+91 98765 43210'
      },
      {
        place_id: '2',
        name: 'MediCare Drugstore',
        vicinity: '456 Health Avenue, Medical District',
        geometry: { location: { lat: () => userLocation!.lat - 0.008, lng: () => userLocation!.lng + 0.003 } },
        rating: 4.2,
        opening_hours: { open_now: true },
        distance: '1.2 km',
        duration: '5 mins',
        distanceValue: 1200,
        durationValue: 300,
        formatted_phone_number: '+91 87654 32109'
      }
    ];

    const mockClinics: PlaceWithDistance[] = [
      {
        place_id: '3',
        name: 'City General Hospital',
        vicinity: '789 Hospital Road, Medical Complex',
        geometry: { location: { lat: () => userLocation!.lat + 0.012, lng: () => userLocation!.lng - 0.007 } },
        rating: 4.7,
        opening_hours: { open_now: true },
        distance: '2.1 km',
        duration: '8 mins',
        distanceValue: 2100,
        durationValue: 480,
        formatted_phone_number: '+91 76543 21098'
      },
      {
        place_id: '4',
        name: 'Family Clinic',
        vicinity: '321 Wellness Street, Health Zone',
        geometry: { location: { lat: () => userLocation!.lat - 0.006, lng: () => userLocation!.lng - 0.009 } },
        rating: 4.3,
        opening_hours: { open_now: false },
        distance: '1.5 km',
        duration: '6 mins',
        distanceValue: 1500,
        durationValue: 360,
        formatted_phone_number: '+91 65432 10987'
      }
    ];

    setPharmacies(mockPharmacies);
    setClinics(mockClinics);
    setMapLoaded(true);
  };

  // Auto-search when location is available
  useEffect(() => {
    if (userLocation && mapLoaded) {
      searchPlaces();
    }
  }, [userLocation, mapLoaded]);

  const BuyMedicineButton: React.FC = () => (
    <Button
      size="sm"
      variant="outline"
      className="w-full border-green-600 text-green-600 hover:bg-green-50"
      onClick={() => window.location.hash = '#/buy-medicine'}
    >
      <ShoppingCart className="h-4 w-4 mr-1" />
      Buy Medicine
    </Button>
  );

  const PlaceCard: React.FC<{ place: PlaceWithDistance; type: 'pharmacy' | 'clinic' }> = ({ place, type }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{place.name}</CardTitle>
          <Badge variant={place.opening_hours?.open_now ? 'default' : 'secondary'}>
            {place.opening_hours?.open_now ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{place.vicinity}</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{place.distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium">{place.duration}</span>
            </div>
          </div>

          {place.rating && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{place.rating}</span>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1 bg-amazon-600 hover:bg-amazon-700"
              onClick={() => {
                const origin = userLocation
                  ? `${userLocation.lat},${userLocation.lng}`
                  : 'Current+Location';
                const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${place.geometry.location.lat()},${place.geometry.location.lng()}&travelmode=driving`;
                window.open(url, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Directions
            </Button>

            {place.formatted_phone_number && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${place.formatted_phone_number}`, '_self')}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            )}
          </div>

          {type === 'pharmacy' && (
            <div className="mt-2">
              <BuyMedicineButton />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Nearby Medical Shops, Clinics & Hospitals</h1>
            <p className="text-gray-600 mt-1">Find healthcare facilities within 7km of your location</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Location Status */}
          <div className="mb-6">
            {!userLocation ? (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Location Required</p>
                        <p className="text-sm text-blue-700">Enable location access to find nearby facilities</p>
                      </div>
                    </div>
                    <Button onClick={getCurrentLocation} disabled={loading} className="bg-amazon-600 hover:bg-amazon-700">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                      Get Location
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Location Found</p>
                      <p className="text-sm text-green-700">
                        Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Card className="mb-6 bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Nearby Facilities</h2>
                <Button onClick={searchPlaces} disabled={loading || !userLocation} size="sm" className="bg-amazon-600 hover:bg-amazon-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Refresh
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'pharmacies' | 'clinics')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pharmacies" className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Pharmacies ({pharmacies.length})
                  </TabsTrigger>
                  <TabsTrigger value="clinics" className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    Clinics ({clinics.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pharmacies" className="mt-4">
                  <div className="max-h-[600px] overflow-y-auto">
                    {pharmacies.length > 0 ? (
                      pharmacies.map((pharmacy) => (
                        <PlaceCard key={pharmacy.place_id} place={pharmacy} type="pharmacy" />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-gray-500">No pharmacies found nearby</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="clinics" className="mt-4">
                  <div className="max-h-[600px] overflow-y-auto">
                    {clinics.length > 0 ? (
                      clinics.map((clinic) => (
                        <PlaceCard key={clinic.place_id} place={clinic} type="clinic" />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-gray-500">No clinics found nearby</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Map */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Map View</h2>
              <Card>
                <CardContent className="p-0">
                  <div
                    ref={mapRef}
                    className="w-full h-[600px] rounded-lg bg-gray-100 flex items-center justify-center"
                    style={{ minHeight: '400px' }}
                  >
                    {userLocation ? (
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-amazon-600 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium mb-2">Interactive Map</p>
                        <p className="text-sm text-gray-600 mb-4">
                          Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                          {activeTab === 'pharmacies' ? (
                            pharmacies.map((place, index) => (
                              <div key={place.place_id} className="bg-white p-3 rounded-lg shadow-sm border">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-xs font-medium">{place.name}</span>
                                </div>
                                <p className="text-xs text-gray-600">{place.distance}</p>
                              </div>
                            ))
                          ) : (
                            clinics.map((place, index) => (
                              <div key={place.place_id} className="bg-white p-3 rounded-lg shadow-sm border">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-xs font-medium">{place.name}</span>
                                </div>
                                <p className="text-xs text-gray-600">{place.distance}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Enable location to view map</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacyFinder;
