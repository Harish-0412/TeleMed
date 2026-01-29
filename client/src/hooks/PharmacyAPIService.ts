import { googleMapsService } from './GoogleMapsService';
import { getAllMedicines } from './FirestoreService';
import { osmService } from './OSMService';

export const getRealPharmacies = async (lat: number, lng: number) => {

  // Try to fetch medicines from Firebase first
  let firebaseMedicines: any[] = [];
  try {
    firebaseMedicines = await getAllMedicines();
  } catch (error) {
    console.warn('Failed to fetch Firebase medicines, falling back to mock:', error);
  }

  try {
    // Try Google Maps first
    let realPharmacies = [];
    try {
      realPharmacies = await googleMapsService.getEnhancedPharmacyData({ lat, lng });
    } catch (gError) {
      console.warn('Google Maps API failed, trying OSM fallback:', gError);
    }

    // If Google fails or returns nothing, use OSM
    if (realPharmacies.length === 0) {
      console.log('No Google results, fetching from OpenStreetMap...');
      const osmFacilities = await osmService.fetchNearbyHealthcare(lat, lng);

      if (osmFacilities.length > 0) {
        realPharmacies = osmFacilities.map(f => ({
          id: f.id,
          name: f.name,
          address: f.address,
          distance: '0.0 km', // Will be calculated below
          duration: '0 mins',
          rating: 4.2,
          isOpen: true,
          phone: f.phone,
          location: { lat: f.lat, lng: f.lng },
          source: 'OpenStreetMap'
        }));
      }
    }

    if (realPharmacies.length > 0) {
      return processRealPharmacyData(realPharmacies, lat, lng, firebaseMedicines);
    } else {
      console.log('No pharmacies found from any source, using mock data');
      return getLocationBasedMockData(lat, lng, firebaseMedicines);
    }
  } catch (error) {
    console.log('Healthcare data integration error:', error);
    return getLocationBasedMockData(lat, lng, firebaseMedicines);
  }
};

const sanitizeMedicines = (medicines: any[]) => {
  return medicines.map(med => ({
    id: med.id || Math.random().toString(36).substr(2, 9),
    name: med.name || 'Unknown Medicine',
    genericName: med.genericName || med.name || 'Unknown Generic',
    dosage: med.dosage || 'N/A',
    price: typeof med.price === 'number' ? med.price : 0,
    stock: typeof med.stock === 'number' ? med.stock : 0,
    category: med.category || 'General',
    prescription: !!med.prescription,
    description: med.description || med.usage || 'No description available.',
  }));
};

const processRealPharmacyData = (places: any[], userLat: number, userLng: number, firebaseMedicines: any[]) => {
  return places.slice(0, 8).map((place, index) => {
    const distanceValue = parseFloat(place.distance) || calculateDistance(userLat, userLng, place.location.lat, place.location.lng);
    const distanceText = place.distance !== '0.0 km' ? place.distance : `${distanceValue.toFixed(1)} km`;

    return {
      id: place.id,
      name: place.name,
      address: place.address,
      distance: distanceText,
      duration: place.duration !== '0 mins' ? place.duration : getDeliveryTime(distanceValue),
      rating: place.rating || (4.0 + Math.random() * 0.8),
      isOpen: place.isOpen,
      phone: place.phone,
      deliveryTime: getDeliveryTime(distanceValue),
      deliveryFee: getDeliveryFee(distanceValue),
      inventory: firebaseMedicines.length > 0 ? sanitizeMedicines(firebaseMedicines) : generateLocationBasedInventory(place.name, userLat, userLng),
      lastUpdated: new Date(),
      location: place.location,
      photos: place.photos || [],
      source: place.source || 'Google'
    };
  });
};

const getLocationBasedMockData = (lat: number, lng: number, firebaseMedicines: any[]) => {
  // Generate realistic pharmacies based on location
  const locationName = getLocationName(lat, lng);
  const pharmacyTypes = getPharmacyTypesForLocation(lat, lng);

  return pharmacyTypes.map((type, index) => ({
    id: `${lat}_${lng}_${index}`,
    name: `${type.name} - ${locationName}`,
    address: `${type.address}, ${locationName}`,
    distance: `${(0.5 + index * 0.7).toFixed(1)} km`,
    duration: `${Math.ceil((0.5 + index * 0.7) * 3)} mins`,
    rating: 3.8 + Math.random() * 1.0,
    isOpen: Math.random() > 0.2,
    phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    deliveryTime: getDeliveryTime(0.5 + index * 0.7),
    deliveryFee: getDeliveryFee(0.5 + index * 0.7),
    inventory: firebaseMedicines.length > 0 ? sanitizeMedicines(firebaseMedicines) : generateLocationBasedInventory(type.name, lat, lng),
    lastUpdated: new Date(),
    location: {
      lat: lat + (Math.random() - 0.5) * 0.02,
      lng: lng + (Math.random() - 0.5) * 0.02
    }
  }));
};

const getLocationName = (lat: number, lng: number) => {
  // Determine location based on coordinates
  if (lat >= 40.7 && lat <= 40.8 && lng >= -74.1 && lng <= -73.9) return 'New York, NY';
  if (lat >= 34.0 && lat <= 34.1 && lng >= -118.3 && lng <= -118.2) return 'Los Angeles, CA';
  if (lat >= 41.8 && lat <= 41.9 && lng >= -87.7 && lng <= -87.6) return 'Chicago, IL';
  if (lat >= 29.7 && lat <= 29.8 && lng >= -95.4 && lng <= -95.3) return 'Houston, TX';
  if (lat >= 33.4 && lat <= 33.5 && lng >= -112.1 && lng <= -112.0) return 'Phoenix, AZ';
  return 'Local Area';
};

const getPharmacyTypesForLocation = (lat: number, lng: number) => {
  const isUrban = Math.abs(lat) > 30 && Math.abs(lng) > 70;

  if (isUrban) {
    return [
      { name: 'CVS Pharmacy', address: '123 Main St' },
      { name: 'Walgreens', address: '456 Broadway' },
      { name: 'Rite Aid', address: '789 First Ave' },
      { name: 'Duane Reade', address: '321 Park Ave' },
      { name: 'Local Pharmacy Plus', address: '654 Oak St' }
    ];
  } else {
    return [
      { name: 'Community Pharmacy', address: '100 Main Street' },
      { name: 'Family Drug Store', address: '200 Center Ave' },
      { name: 'HealthMart Pharmacy', address: '300 Elm Street' },
      { name: 'Independent Pharmacy', address: '400 Pine Road' }
    ];
  }
};

const generateLocationBasedInventory = (pharmacyName: string, lat: number, lng: number) => {
  const isChain = ['CVS', 'Walgreens', 'Rite Aid', 'Duane Reade', 'Apollo', 'MedPlus'].some(chain =>
    pharmacyName.includes(chain)
  );

  const isUrban = Math.abs(lat) > 10 && Math.abs(lng) > 60; // Adjusted for global/India urban detection

  const baseMedicines = [
    {
      name: 'Acetaminophen',
      genericName: 'Acetaminophen',
      dosage: '500mg',
      category: 'Pain Relief',
      prescription: false,
      basePrice: 8.99,
      description: 'Used to treat mild to moderate pain (from headaches, menstrual periods, toothaches, backaches, osteoarthritis, or cold/flu aches and pains) and to reduce fever.'
    },
    {
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      dosage: '200mg',
      category: 'Pain Relief',
      prescription: false,
      basePrice: 12.50,
      description: 'A nonsteroidal anti-inflammatory drug (NSAID) used for relieving pain, helping to reduce inflammation, and reducing a high temperature.'
    },
    {
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      dosage: '250mg',
      category: 'Antibiotics',
      prescription: true,
      basePrice: 25.00,
      description: 'A penicillin-type antibiotic used to treat a wide variety of bacterial infections. It works by stopping the growth of bacteria.'
    },
    {
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      category: 'Blood Pressure',
      prescription: true,
      basePrice: 15.75,
      description: 'Used to treat high blood pressure. Lowering high blood pressure helps prevent strokes, heart attacks, and kidney problems.'
    },
    {
      name: 'Metformin',
      genericName: 'Metformin HCl',
      dosage: '500mg',
      category: 'Diabetes',
      prescription: true,
      basePrice: 19.99,
      description: 'Used with a proper diet and exercise program and possibly with other medications to control high blood sugar in people with type 2 diabetes.'
    },
    {
      name: 'Disposable Syringe (2ml)',
      genericName: 'Medical Syringe',
      dosage: 'N/A',
      category: 'Surgicals',
      prescription: false,
      basePrice: 0.50,
      description: 'Sterile, single-use 2ml syringe for medical administration of fluids or medications.'
    },
    {
      name: 'Disposable Syringe (5ml)',
      genericName: 'Medical Syringe',
      dosage: 'N/A',
      category: 'Surgicals',
      prescription: false,
      basePrice: 0.75,
      description: 'Sterile, single-use 5ml syringe with needle, optimized for precise dosage measurement.'
    },
    {
      name: 'Insulin Syringe',
      genericName: 'U-100 Syringe',
      dosage: '1ml (100 units)',
      category: 'Surgicals',
      prescription: false,
      basePrice: 1.25,
      description: 'Extra-fine needle syringe designed specifically for comfortable insulin delivery.'
    },
    {
      name: 'Digital Thermometer',
      genericName: 'Thermometer',
      dosage: 'N/A',
      category: 'Equipment',
      prescription: false,
      basePrice: 15.00,
      description: 'High-precision digital thermometer for oral, axillary, or rectal temperature measurement.'
    },
    {
      name: 'Surgical Mask (Box of 50)',
      genericName: '3-Ply Face Mask',
      dosage: 'N/A',
      category: 'Supplies',
      prescription: false,
      basePrice: 10.00,
      description: 'Protective 3-ply disposable surgical masks with elastic ear loops for daily protection.'
    }
  ];

  // Add location-specific medicines
  if (isUrban) {
    baseMedicines.push(
      {
        name: 'Allergy Relief',
        genericName: 'Loratadine',
        dosage: '10mg',
        category: 'Allergy',
        prescription: false,
        basePrice: 14.99,
        description: 'Antihistamine used to treat symptoms such as itching, runny nose, watery eyes, and sneezing from "hay fever" and other allergies.'
      },
      {
        name: 'ORS (Oral Rehydration Salts)',
        genericName: 'ORS',
        dosage: '21.8g Sachet',
        category: 'First Aid',
        prescription: false,
        basePrice: 2.00,
        description: 'Used to treat dehydration due to diarrhea or heavy sweating.'
      }
    );
  }

  return baseMedicines.map(med => ({
    id: Math.random().toString(36).substr(2, 9),
    ...med,
    price: adjustPrice(med.basePrice, isChain, isUrban),
    stock: generateStock(med.category, isChain, isUrban)
  }));
};

const adjustPrice = (basePrice: number, isChain: boolean, isUrban: boolean) => {
  let multiplier = 1.0;
  if (isChain) multiplier *= 0.95; // Chain discount
  if (isUrban) multiplier *= 1.1; // Urban premium
  return Math.round(basePrice * multiplier * 100) / 100;
};

const generateStock = (category: string, isChain: boolean, isUrban: boolean) => {
  let baseStock = isChain ? 50 : 25;
  if (isUrban) baseStock *= 1.5;

  const categoryMultipliers: Record<string, number> = {
    'Pain Relief': 1.5,
    'Vitamins': 1.3,
    'Antibiotics': 0.8,
    'Blood Pressure': 1.0,
    'Diabetes': 0.9,
    'Cholesterol': 0.7,
    'Acid Reflux': 1.1,
    'Allergy': 1.2,
    'Sleep Aid': 0.9
  };

  const multiplier = categoryMultipliers[category] || 1.0;
  const stock = Math.floor(baseStock * multiplier * (0.5 + Math.random()));

  return Math.random() < 0.1 ? 0 : stock;
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getDeliveryTime = (distance: number) => {
  if (distance < 2) return '15-25 mins';
  if (distance < 5) return '25-40 mins';
  if (distance < 10) return '45-60 mins';
  return 'Next day';
};

const getDeliveryFee = (distance: number) => {
  if (distance < 2) return 2.99;
  if (distance < 5) return 4.99;
  if (distance < 10) return 7.99;
  return 12.99;
};