// CVS API Integration Service
export class CVSAPIService {
  private baseURL = 'https://api.cvs.com/v1';
  private apiKey = process.env.CVS_API_KEY;
  
  // Get CVS store locations
  async getStoreLocations(lat: number, lng: number, radius = 10) {
    try {
      const response = await fetch(
        `${this.baseURL}/stores/search?lat=${lat}&lng=${lng}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`CVS API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CVS Store API error:', error);
      throw error;
    }
  }
  
  // Get medicine inventory for specific store
  async getStoreInventory(storeId: string, medicineNDC?: string) {
    try {
      const url = medicineNDC 
        ? `${this.baseURL}/stores/${storeId}/inventory/${medicineNDC}`
        : `${this.baseURL}/stores/${storeId}/inventory`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`CVS Inventory API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CVS Inventory API error:', error);
      throw error;
    }
  }
  
  // Search for medicine across CVS network
  async searchMedicine(medicineName: string, lat: number, lng: number) {
    try {
      const response = await fetch(
        `${this.baseURL}/medicines/search?name=${encodeURIComponent(medicineName)}&lat=${lat}&lng=${lng}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`CVS Medicine Search API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CVS Medicine Search API error:', error);
      throw error;
    }
  }
  
  // Get real-time pricing
  async getMedicinePricing(storeId: string, medicineNDC: string) {
    try {
      const response = await fetch(
        `${this.baseURL}/stores/${storeId}/pricing/${medicineNDC}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`CVS Pricing API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CVS Pricing API error:', error);
      throw error;
    }
  }
}

// Walgreens API Service
export class WalgreensAPIService {
  private baseURL = 'https://api.walgreens.com/v3';
  private subscriptionKey = process.env.WALGREENS_SUBSCRIPTION_KEY;
  
  async getStoreLocations(lat: number, lng: number) {
    try {
      const response = await fetch(
        `${this.baseURL}/stores/search?lat=${lat}&lng=${lng}`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.subscriptionKey!,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return await response.json();
    } catch (error) {
      console.error('Walgreens API error:', error);
      throw error;
    }
  }
}

// Usage Example
export const getPharmacyChainData = async (lat: number, lng: number, medicineName?: string) => {
  const cvsService = new CVSAPIService();
  const walgreensService = new WalgreensAPIService();
  
  try {
    // Get data from multiple pharmacy chains
    const [cvsStores, walgreensStores] = await Promise.allSettled([
      cvsService.getStoreLocations(lat, lng),
      walgreensService.getStoreLocations(lat, lng)
    ]);
    
    const allStores = [];
    
    // Process CVS data
    if (cvsStores.status === 'fulfilled') {
      allStores.push(...cvsStores.value.stores.map((store: any) => ({
        ...store,
        chain: 'CVS',
        realInventory: true
      })));
    }
    
    // Process Walgreens data
    if (walgreensStores.status === 'fulfilled') {
      allStores.push(...walgreensStores.value.stores.map((store: any) => ({
        ...store,
        chain: 'Walgreens',
        realInventory: true
      })));
    }
    
    return allStores;
  } catch (error) {
    console.error('Pharmacy chain API error:', error);
    throw error;
  }
};