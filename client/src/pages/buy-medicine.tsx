import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, MapPin, Star, Clock, Phone, Plus, Minus, Package, AlertTriangle, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { PharmacyAPIService } from '@/services/PharmacyAPIService';
import { GoogleMapsService } from '@/services/GoogleMapsService';
import Checkout from '@/components/Checkout';
import OrderConfirmation from '@/components/OrderConfirmation';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  price: number;
  stock: number;
  minStock?: number;
  manufacturer: string;
  batchNumber?: string;
  expiryDate?: string;
  description: string;
  category: string;
  prescription: boolean;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance: number;
  isOpen: boolean;
  medicines: Medicine[];
}

interface CartItem extends Medicine {
  quantity: number;
}

export default function BuyMedicine() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'inventory'>('buy');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [currentView, setCurrentView] = useState<'shopping' | 'checkout' | 'confirmation'>('shopping');
  const [orderData, setOrderData] = useState<any>(null);

  const categories = [
    { id: 'all', name: 'All Medicines' },
    { id: 'antibiotics', name: 'Antibiotics' },
    { id: 'painkillers', name: 'Pain Relief' },
    { id: 'vitamins', name: 'Vitamins' },
    { id: 'diabetes', name: 'Diabetes Care' },
    { id: 'heart', name: 'Heart Care' },
    { id: 'cold', name: 'Cold & Flu' }
  ];

  useEffect(() => {
    getUserLocation();
    loadNearbyPharmacies();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  };

  const loadNearbyPharmacies = async () => {
    setLoading(true);
    try {
      const mockPharmacies: Pharmacy[] = [
        {
          id: '1',
          name: 'HealthPlus Pharmacy',
          address: '123 Main Street, City Center',
          phone: '+91 98765 43210',
          rating: 4.5,
          distance: 0.8,
          isOpen: true,
          medicines: [
            {
              id: 'm1',
              name: 'Paracetamol 500mg',
              genericName: 'Acetaminophen',
              price: 25,
              stock: 150,
              minStock: 50,
              manufacturer: 'Cipla',
              batchNumber: 'PAR001',
              expiryDate: '2025-06-15',
              description: 'Pain relief and fever reducer',
              category: 'painkillers',
              prescription: false
            },
            {
              id: 'm2',
              name: 'Amoxicillin 250mg',
              genericName: 'Amoxicillin',
              price: 120,
              stock: 25,
              minStock: 30,
              manufacturer: 'Sun Pharma',
              batchNumber: 'AMX002',
              expiryDate: '2024-12-30',
              description: 'Antibiotic for bacterial infections',
              category: 'antibiotics',
              prescription: true
            },
            {
              id: 'm3',
              name: 'Vitamin D3 1000IU',
              genericName: 'Cholecalciferol',
              price: 180,
              stock: 75,
              minStock: 25,
              manufacturer: 'Dr. Reddy\'s',
              batchNumber: 'VIT003',
              expiryDate: '2024-03-20',
              description: 'Vitamin D supplement',
              category: 'vitamins',
              prescription: false
            }
          ]
        }
      ];
      
      setPharmacies(mockPharmacies);
      if (mockPharmacies.length > 0) {
        setSelectedPharmacy(mockPharmacies[0]);
        setMedicines(mockPharmacies[0].medicines);
      }
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (medicine: Medicine) => medicine.minStock ? medicine.stock <= medicine.minStock : false;
  
  const isExpiringSoon = (medicine: Medicine) => {
    if (!medicine.expiryDate) return false;
    const expiryDate = new Date(medicine.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    const matchesLowStock = !showLowStock || isLowStock(medicine);
    const matchesExpiring = !showExpiringSoon || isExpiringSoon(medicine);
    return matchesSearch && matchesCategory && matchesLowStock && matchesExpiring;
  });

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: Math.min(item.quantity + 1, medicine.stock) }
            : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const updateQuantity = (medicineId: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === medicineId) {
          const newQuantity = Math.max(0, Math.min(item.quantity + change, item.stock));
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const lowStockCount = medicines.filter(isLowStock).length;
  const expiringSoonCount = medicines.filter(isExpiringSoon).length;

  const handleCheckout = () => {
    if (cart.length > 0 && selectedPharmacy) {
      setCurrentView('checkout');
    }
  };

  const handleOrderComplete = (data: any) => {
    setOrderData(data);
    setCurrentView('confirmation');
    setCart([]); // Clear cart after successful order
  };

  const handleBackToShopping = () => {
    setCurrentView('shopping');
    setActiveTab('buy');
  };

  // Show checkout page
  if (currentView === 'checkout' && selectedPharmacy) {
    return (
      <Checkout
        cart={cart}
        pharmacy={selectedPharmacy}
        onBack={() => setCurrentView('shopping')}
        onOrderComplete={handleOrderComplete}
      />
    );
  }

  // Show order confirmation page
  if (currentView === 'confirmation' && orderData) {
    return (
      <OrderConfirmation
        orderData={orderData}
        onBackToShopping={handleBackToShopping}
      />
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Management</h1>
              <p className="text-gray-600">Buy medicines and manage pharmacy inventory</p>
            </div>
            
            {/* Cart Summary */}
            {activeTab === 'buy' && (
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-amazon-600" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">₹{getTotalPrice()}</p>
                  <p className="text-sm text-gray-600">{getTotalItems()} items</p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'buy'
                    ? 'text-amazon-600 border-b-2 border-amazon-600'
                    : 'text-gray-600 hover:text-amazon-600'
                }`}
              >
                Buy Medicines
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'inventory'
                    ? 'text-amazon-600 border-b-2 border-amazon-600'
                    : 'text-gray-600 hover:text-amazon-600'
                }`}
              >
                Pharmacy Inventory
              </button>
            </div>
          </div>

          {activeTab === 'buy' ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Pharmacy Selection */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nearby Pharmacies</h3>
                  <div className="space-y-3">
                    {pharmacies.map(pharmacy => (
                      <div
                        key={pharmacy.id}
                        onClick={() => {
                          setSelectedPharmacy(pharmacy);
                          setMedicines(pharmacy.medicines);
                        }}
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
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>{pharmacy.distance} km away</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{pharmacy.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-amazon-100 text-amazon-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                    />
                  </div>
                </div>

                {/* Selected Pharmacy Info */}
                {selectedPharmacy && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedPharmacy.name}</h2>
                        <p className="text-gray-600 mb-2">{selectedPharmacy.address}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{selectedPharmacy.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{selectedPharmacy.distance} km away</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{selectedPharmacy.rating}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedPharmacy.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPharmacy.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Medicines Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredMedicines.map(medicine => {
                    const cartItem = cart.find(item => item.id === medicine.id);
                    return (
                      <div key={medicine.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{medicine.name}</h3>
                            <p className="text-sm text-gray-600">{medicine.genericName}</p>
                            <p className="text-xs text-gray-500">{medicine.manufacturer}</p>
                          </div>
                          {medicine.prescription && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              Rx
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{medicine.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-lg font-bold text-amazon-600">₹{medicine.price}</p>
                            <p className="text-xs text-gray-500">Stock: {medicine.stock}</p>
                          </div>
                        </div>

                        {cartItem ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(medicine.id, -1)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-medium">{cartItem.quantity}</span>
                              <button
                                onClick={() => updateQuantity(medicine.id, 1)}
                                className="w-8 h-8 rounded-full bg-amazon-600 text-white flex items-center justify-center hover:bg-amazon-700"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="font-semibold text-amazon-600">
                              ₹{cartItem.price * cartItem.quantity}
                            </p>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(medicine)}
                            disabled={medicine.stock === 0}
                            className="w-full bg-amazon-600 hover:bg-amazon-700"
                          >
                            {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {filteredMedicines.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No medicines found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Inventory Management Tab */
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Medicines</p>
                      <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-amazon-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Stock Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{medicines.reduce((total, med) => total + (med.price * med.stock), 0).toLocaleString()}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Low Stock Items</p>
                      <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Expiring Soon</p>
                      <p className="text-2xl font-bold text-orange-600">{expiringSoonCount}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                      />
                    </div>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amazon-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <Button
                      variant={showLowStock ? "default" : "outline"}
                      onClick={() => setShowLowStock(!showLowStock)}
                      className={showLowStock ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      Low Stock
                    </Button>
                    <Button
                      variant={showExpiringSoon ? "default" : "outline"}
                      onClick={() => setShowExpiringSoon(!showExpiringSoon)}
                      className={showExpiringSoon ? "bg-orange-600 hover:bg-orange-700" : ""}
                    >
                      Expiring Soon
                    </Button>
                  </div>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medicine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMedicines.map(medicine => (
                        <tr key={medicine.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                              <div className="text-sm text-gray-500">{medicine.genericName}</div>
                              <div className="text-xs text-gray-400">{medicine.manufacturer}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {categories.find(c => c.id === medicine.category)?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{medicine.stock} units</div>
                            {medicine.minStock && (
                              <div className="text-xs text-gray-500">Min: {medicine.minStock}</div>
                            )}
                            {isLowStock(medicine) && (
                              <div className="text-xs text-red-600 font-medium">Low Stock!</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{medicine.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {medicine.expiryDate && (
                              <>
                                <div className="text-sm text-gray-900">{medicine.expiryDate}</div>
                                {isExpiringSoon(medicine) && (
                                  <div className="text-xs text-orange-600 font-medium">Expiring Soon!</div>
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {medicine.prescription && (
                                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                  Prescription
                                </span>
                              )}
                              {isLowStock(medicine) && (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  Low Stock
                                </span>
                              )}
                              {isExpiringSoon(medicine) && (
                                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                  Expiring
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button className="text-amazon-600 hover:text-amazon-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          {cart.length > 0 && activeTab === 'buy' && (
            <div className="fixed bottom-6 right-6">
              <Button
                onClick={handleCheckout}
                size="lg"
                className="bg-amazon-600 hover:bg-amazon-700 shadow-lg"
              >
                Checkout (₹{getTotalPrice()})
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}