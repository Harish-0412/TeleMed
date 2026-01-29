// Free Public APIs for Medicine Data
import { getRealPharmacies } from './PharmacyAPIService';

export class PublicMedicineAPI {
  
  // FDA Drug Database API (Free)
  async getFDADrugInfo(drugName: string) {
    try {
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('FDA API request failed');
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.log('FDA API unavailable, using fallback');
      return [];
    }
  }
  
  // RxNorm API (Free - NIH/NLM)
  async getRxNormInfo(drugName: string) {
    try {
      const response = await fetch(
        `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`
      );
      
      if (!response.ok) {
        throw new Error('RxNorm API request failed');
      }
      
      const data = await response.json();
      return data.drugGroup?.conceptGroup || [];
    } catch (error) {
      console.log('RxNorm API unavailable, using fallback');
      return [];
    }
  }
  
  // OpenFDA Device API (Free)
  async getMedicalDeviceInfo(deviceName: string) {
    try {
      const response = await fetch(
        `https://api.fda.gov/device/510k.json?search=device_name:"${deviceName}"&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('OpenFDA Device API request failed');
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.log('OpenFDA Device API unavailable');
      return [];
    }
  }
}

// Enhanced Pharmacy Service with Public APIs
export const getEnhancedPharmacyData = async (lat: number, lng: number, medicineName?: string) => {
  const medicineAPI = new PublicMedicineAPI();
  
  try {
    // Get Google Places pharmacy data (already working)
    const googlePlacesData = await getRealPharmacies(lat, lng);
    
    // Enhance with medicine information if searching for specific drug
    if (medicineName) {
      const [fdaInfo, rxNormInfo] = await Promise.allSettled([
        medicineAPI.getFDADrugInfo(medicineName),
        medicineAPI.getRxNormInfo(medicineName)
      ]);
      
      // Add real medicine data to pharmacies
      const enhancedPharmacies = googlePlacesData.map(pharmacy => ({
        ...pharmacy,
        inventory: pharmacy.inventory.map(med => {
          if (med.name.toLowerCase().includes(medicineName.toLowerCase())) {
            return {
              ...med,
              fdaInfo: fdaInfo.status === 'fulfilled' ? fdaInfo.value[0] : null,
              rxNormInfo: rxNormInfo.status === 'fulfilled' ? rxNormInfo.value[0] : null,
              verified: true
            };
          }
          return med;
        })
      }));
      
      return enhancedPharmacies;
    }
    
    return googlePlacesData;
  } catch (error) {
    console.error('Enhanced pharmacy data error:', error);
    // Fallback to basic Google Places data
    return await getRealPharmacies(lat, lng);
  }
};

// GoodRx-style Price Comparison (Mock implementation)
export const getMedicinePriceComparison = (medicineName: string, pharmacies: any[]) => {
  // Simulate price comparison across pharmacies
  return pharmacies.map(pharmacy => {
    const basePrice = Math.random() * 50 + 10; // $10-$60 range
    const chainMultiplier = pharmacy.name.includes('CVS') ? 0.95 : 
                           pharmacy.name.includes('Walgreens') ? 0.97 : 
                           pharmacy.name.includes('Rite Aid') ? 1.02 : 1.0;
    
    return {
      ...pharmacy,
      inventory: pharmacy.inventory.map((med: any) => ({
        ...med,
        price: Math.round(basePrice * chainMultiplier * 100) / 100,
        priceComparison: {
          isLowest: Math.random() > 0.7,
          savings: Math.round(Math.random() * 15 * 100) / 100,
          averagePrice: Math.round((basePrice * 1.1) * 100) / 100
        }
      }))
    };
  });
};

// Real-time inventory simulation with business logic
export const simulateRealTimeInventory = (pharmacies: any[]) => {
  const currentHour = new Date().getHours();
  const isBusinessHours = currentHour >= 9 && currentHour <= 21;
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  return pharmacies.map(pharmacy => ({
    ...pharmacy,
    inventory: pharmacy.inventory.map((med: any) => {
      // Simulate realistic stock changes
      let stockChange = 0;
      
      // More sales during business hours
      if (isBusinessHours) {
        stockChange = Math.floor(Math.random() * 3) - 1; // -1 to +1
      }
      
      // Less activity on weekends
      if (isWeekend) {
        stockChange = Math.floor(stockChange * 0.5);
      }
      
      // Popular medicines sell faster
      if (['Acetaminophen', 'Ibuprofen', 'Aspirin'].includes(med.name)) {
        stockChange -= 1;
      }
      
      const newStock = Math.max(0, med.stock + stockChange);
      
      return {
        ...med,
        stock: newStock,
        lastRestocked: newStock > med.stock ? new Date() : med.lastRestocked,
        trending: stockChange < -1 // Mark as trending if selling fast
      };
    })
  }));
};