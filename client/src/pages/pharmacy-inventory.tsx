import React, { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  price: number;
  stock: number;
  minStock: number;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  category: string;
  prescription: boolean;
  description: string;
}

export default function PharmacyInventory() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'antibiotics', name: 'Antibiotics' },
    { id: 'painkillers', name: 'Pain Relief' },
    { id: 'vitamins', name: 'Vitamins' },
    { id: 'diabetes', name: 'Diabetes Care' },
    { id: 'heart', name: 'Heart Care' },
    { id: 'cold', name: 'Cold & Flu' }
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    // Mock data - replace with actual API call
    const mockMedicines: Medicine[] = [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        price: 25,
        stock: 150,
        minStock: 50,
        manufacturer: 'Cipla',
        batchNumber: 'PAR001',
        expiryDate: '2025-06-15',
        category: 'painkillers',
        prescription: false,
        description: 'Pain relief and fever reducer'
      },
      {
        id: '2',
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        price: 120,
        stock: 25,
        minStock: 30,
        manufacturer: 'Sun Pharma',
        batchNumber: 'AMX002',
        expiryDate: '2024-12-30',
        category: 'antibiotics',
        prescription: true,
        description: 'Antibiotic for bacterial infections'
      },
      {
        id: '3',
        name: 'Vitamin D3 1000IU',
        genericName: 'Cholecalciferol',
        price: 180,
        stock: 75,
        minStock: 25,
        manufacturer: 'Dr. Reddy\'s',
        batchNumber: 'VIT003',
        expiryDate: '2024-03-20',
        category: 'vitamins',
        prescription: false,
        description: 'Vitamin D supplement'
      }
    ];
    setMedicines(mockMedicines);
  };

  const isLowStock = (medicine: Medicine) => medicine.stock <= medicine.minStock;
  
  const isExpiringSoon = (medicine: Medicine) => {
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

  const lowStockCount = medicines.filter(isLowStock).length;
  const expiringSoonCount = medicines.filter(isExpiringSoon).length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Inventory</h1>
              <p className="text-gray-600">Manage your medicine stock and inventory</p>
            </div>
            <Button
              onClick={() => setIsAddingMedicine(true)}
              className="bg-amazon-600 hover:bg-amazon-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </Button>
          </div>

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
              {/* Search */}
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

              {/* Category Filter */}
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

              {/* Quick Filters */}
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
                        <div className="text-xs text-gray-500">Min: {medicine.minStock}</div>
                        {isLowStock(medicine) && (
                          <div className="text-xs text-red-600 font-medium">Low Stock!</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{medicine.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{medicine.expiryDate}</div>
                        {isExpiringSoon(medicine) && (
                          <div className="text-xs text-orange-600 font-medium">Expiring Soon!</div>
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

          {filteredMedicines.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No medicines found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}