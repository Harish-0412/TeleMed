// PharmacyAPIService.ts - Service for pharmacy-related API calls
export class PharmacyAPIService {
  private static baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  // Get nearby pharmacies
  static async getNearbyPharmacies(lat: number, lng: number, radius: number = 5000) {
    try {
      const response = await fetch(`${this.baseURL}/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (!response.ok) throw new Error('Failed to fetch pharmacies');
      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      return this.getMockPharmacies();
    }
  }

  // Get pharmacy details
  static async getPharmacyDetails(pharmacyId: string) {
    try {
      const response = await fetch(`${this.baseURL}/pharmacies/${pharmacyId}`);
      if (!response.ok) throw new Error('Failed to fetch pharmacy details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching pharmacy details:', error);
      return null;
    }
  }

  // Search medicines in pharmacy
  static async searchMedicines(pharmacyId: string, query: string, category?: string) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...(category && { category })
      });
      const response = await fetch(`${this.baseURL}/pharmacies/${pharmacyId}/medicines?${params}`);
      if (!response.ok) throw new Error('Failed to search medicines');
      return await response.json();
    } catch (error) {
      console.error('Error searching medicines:', error);
      return [];
    }
  }

  // Get medicine availability across pharmacies
  static async getMedicineAvailability(medicineName: string, lat: number, lng: number) {
    try {
      const response = await fetch(`${this.baseURL}/medicines/availability?name=${encodeURIComponent(medicineName)}&lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error('Failed to fetch medicine availability');
      return await response.json();
    } catch (error) {
      console.error('Error fetching medicine availability:', error);
      return [];
    }
  }

  // Place order
  static async placeOrder(orderData: any) {
    try {
      const response = await fetch(`${this.baseURL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Failed to place order');
      return await response.json();
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  // Mock data for development
  private static getMockPharmacies() {
    return [
      {
        id: '1',
        name: 'HealthPlus Pharmacy',
        address: '123 Main Street, City Center',
        phone: '+91 98765 43210',
        rating: 4.5,
        distance: 0.8,
        isOpen: true,
        openingHours: '8:00 AM - 10:00 PM',
        services: ['Home Delivery', 'Online Consultation', '24/7 Emergency'],
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      {
        id: '2',
        name: 'MediCare Drugstore',
        address: '456 Health Avenue, Medical District',
        phone: '+91 87654 32109',
        rating: 4.2,
        distance: 1.2,
        isOpen: true,
        openingHours: '9:00 AM - 9:00 PM',
        services: ['Home Delivery', 'Insurance Accepted'],
        coordinates: { lat: 28.6129, lng: 77.2095 }
      }
    ];
  }
}