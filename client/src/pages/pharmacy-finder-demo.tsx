import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Phone, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface Location {
  lat: number;
  lng: number;
}

interface MockPlace {
  id: string;
  name: string;
  address: string;
  distance: string;
  duration: string;
  rating: number;
  isOpen: boolean;
  phone?: string;
  type: 'pharmacy' | 'clinic';
}

const PharmacyFinderDemo: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'clinics'>('pharmacies');
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

  // Mock data for demonstration
  const mockPharmacies: MockPlace[] = [
    {
      id: '1',
      name: 'HealthPlus Pharmacy',
      address: '123 Main Street, Downtown',
      distance: '0.8 km',
      duration: '3 mins',
      rating: 4.5,
      isOpen: true,
      phone: '+1-555-0123',
      type: 'pharmacy'
    },
    {
      id: '2',
      name: 'MediCare Drug Store',
      address: '456 Oak Avenue, City Center',
      distance: '1.2 km',
      duration: '5 mins',
      rating: 4.2,
      isOpen: true,
      phone: '+1-555-0456',
      type: 'pharmacy'
    },
    {
      id: '3',
      name: 'Community Pharmacy',
      address: '789 Pine Road, Suburb',
      distance: '2.1 km',
      duration: '8 mins',
      rating: 4.0,
      isOpen: false,
      phone: '+1-555-0789',
      type: 'pharmacy'
    },
    {
      id: '4',
      name: 'QuickMeds Pharmacy',
      address: '321 Elm Street, North District',
      distance: '2.8 km',
      duration: '12 mins',
      rating: 3.8,
      isOpen: true,
      type: 'pharmacy'
    }
  ];

  const mockClinics: MockPlace[] = [
    {
      id: '5',
      name: 'City General Hospital',
      address: '100 Hospital Drive, Medical District',
      distance: '1.5 km',
      duration: '6 mins',
      rating: 4.3,
      isOpen: true,
      phone: '+1-555-1000',
      type: 'clinic'
    },
    {
      id: '6',
      name: 'Family Health Clinic',
      address: '200 Wellness Way, Residential Area',
      distance: '2.0 km',
      duration: '9 mins',
      rating: 4.1,
      isOpen: true,
      phone: '+1-555-2000',
      type: 'clinic'
    },
    {
      id: '7',
      name: 'Emergency Care Center',
      address: '300 Emergency Lane, Central',
      distance: '2.5 km',
      duration: '11 mins',
      rating: 4.4,
      isOpen: true,
      phone: '+1-555-3000',
      type: 'clinic'
    },
    {
      id: '8',
      name: 'Pediatric Clinic',
      address: '400 Children Ave, Family District',
      distance: '3.2 km',
      duration: '15 mins',
      rating: 4.6,
      isOpen: false,
      phone: '+1-555-4000',
      type: 'clinic'
    }
  ];

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
        setMapCenter({ lat: location.lat, lng: location.lng });
        setLoading(false);
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

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const PlaceCard: React.FC<{ place: MockPlace }> = ({ place }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{place.name}</CardTitle>
          <Badge variant={place.isOpen ? 'default' : 'secondary'}>
            {place.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{place.address}</span>
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

          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">{place.rating}</span>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                // Mock coordinates for demo
                const lat = userLocation?.lat || 40.7128;
                const lng = userLocation?.lng || -74.0060;
                const url = `https://www.google.com/maps/dir/?api=1&destination=${lat + (Math.random() - 0.5) * 0.01},${lng + (Math.random() - 0.5) * 0.01}`;
                window.open(url, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Directions
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(place.address);
                alert('Address copied!');
              }}
            >
              📋 Copy
            </Button>
            
            {place.phone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${place.phone}`, '_self')}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Nearby Pharmacies & Clinics</h1>
          <p className="text-gray-600 mt-1">Find healthcare facilities near your location</p>
          <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md inline-block">
            Demo Mode - Using mock data for demonstration
          </div>
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
                  <Button onClick={getCurrentLocation} disabled={loading}>
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
              <div className="flex gap-2">
                <Button 
                  onClick={() => setActiveTab(activeTab === 'pharmacies' ? 'clinics' : 'pharmacies')} 
                  size="sm" 
                  variant="outline"
                >
                  Switch to {activeTab === 'pharmacies' ? 'Clinics' : 'Pharmacies'}
                </Button>
                <Button onClick={getCurrentLocation} disabled={loading} size="sm">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                  Refresh Location
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pharmacies' | 'clinics')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pharmacies" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  Pharmacies ({mockPharmacies.length})
                </TabsTrigger>
                <TabsTrigger value="clinics" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  Clinics ({mockClinics.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pharmacies" className="mt-4">
                <div className="max-h-[600px] overflow-y-auto">
                  {mockPharmacies.map((pharmacy) => (
                    <PlaceCard key={pharmacy.id} place={pharmacy} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="clinics" className="mt-4">
                <div className="max-h-[600px] overflow-y-auto">
                  {mockClinics.map((clinic) => (
                    <PlaceCard key={clinic.id} place={clinic} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Map Placeholder */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Map View</h2>
            <Card>
              <CardContent className="p-0">
                <div className="w-full h-[600px] relative rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng-0.01},${mapCenter.lat-0.01},${mapCenter.lng+0.01},${mapCenter.lat+0.01}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`}
                    width="100%"
                    height="600"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Interactive Map"
                  ></iframe>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-xs font-bold text-gray-700 mb-2">LEGEND</div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Your Location</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Pharmacies ({mockPharmacies.length})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Clinics ({mockClinics.length})</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${mapCenter.lat}&mlon=${mapCenter.lng}&zoom=15`, '_blank')}
                    >
                      🔍 Full Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyFinderDemo;