import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Search,
    ShoppingBag,
    Plus,
    Minus,
    Info,
    ChevronRight,
    Star,
    Clock,
    Truck,
    ArrowLeft,
    CheckCircle2,
    Package,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { getRealPharmacies } from '@/services/PharmacyAPIService';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Medication {
    id: string;
    name: string;
    genericName: string;
    dosage: string;
    price: number;
    stock: number;
    category: string;
    prescription: boolean;
    description: string;
}

interface Pharmacy {
    id: string;
    name: string;
    address: string;
    distance: string;
    duration: string;
    rating: number;
    isOpen: boolean;
    phone?: string;
    deliveryTime: string;
    deliveryFee: number;
    inventory: Medication[];
    source?: string;
    location?: { lat: number; lng: number };
}

type DeliveryMethod = 'cod';

function toTitleCase(input: string) {
    return input
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function deriveNameFromEmail(email?: string | null) {
    if (!email) return '';
    const local = email.split('@')[0] ?? '';
    const parts = local.split(/[._-]+/g).filter(Boolean);
    if (parts.length === 0) return local;
    return toTitleCase(parts.join(' '));
}

const BuyMedicinesPage = () => {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('cod');
    const { toast } = useToast();
    const { user } = useAuth();

    const ashaWorkerName =
        user?.displayName ||
        deriveNameFromEmail(user?.email) ||
        user?.email ||
        'Unknown';

    useEffect(() => {
        const fetchShops = async () => {
            setLoading(true);
            try {
                // Get user location
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    try {
                        const data = await getRealPharmacies(pos.coords.latitude, pos.coords.longitude);
                        setPharmacies(data as Pharmacy[]);
                    } catch (err) {
                        console.error("Data fetch error:", err);
                    } finally {
                        setLoading(false);
                    }
                }, async (err) => {
                    console.error("Location error:", err);
                    // Fallback location (Generic)
                    try {
                        const data = await getRealPharmacies(12.9716, 77.5946);
                        setPharmacies(data as Pharmacy[]);
                    } catch (err) {
                        console.error("Fallback fetch error:", err);
                    } finally {
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error("Fetch error:", error);
                setLoading(false);
            }
        };

        fetchShops();
    }, []);

    const addToCart = (medId: string) => {
        setCart(prev => ({
            ...prev,
            [medId]: (prev[medId] || 0) + 1
        }));
        toast({
            title: "Added to cart",
            description: "Medicine added to your basket.",
        });
    };

    const removeFromCart = (medId: string) => {
        if (!cart[medId]) return;
        setCart(prev => {
            const next = { ...prev };
            if (next[medId] === 1) delete next[medId];
            else next[medId]--;
            return next;
        });
    };

    const categories = ['All', ...Array.from(new Set(selectedPharmacy?.inventory.map(m => m.category) || []))];

    const filteredInventory = selectedPharmacy?.inventory.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.genericName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || med.category === activeCategory;
        return matchesSearch && matchesCategory;
    }) || [];

    const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
    const cartLines = (selectedPharmacy?.inventory ?? [])
        .filter(med => cart[med.id])
        .map(med => ({
            med,
            qty: cart[med.id] ?? 0,
            lineTotal: (cart[med.id] ?? 0) * med.price
        }));
    const itemsTotal = cartLines.reduce((sum, l) => sum + l.lineTotal, 0);
    const deliveryFee = selectedPharmacy?.deliveryFee ?? 0;
    const grandTotal = itemsTotal + (cartItemCount > 0 ? deliveryFee : 0);

    const openCheckout = () => {
        if (!selectedPharmacy) return;
        if (cartItemCount === 0) {
            toast({
                title: "Cart is empty",
                description: "Please add at least one medicine to proceed to checkout.",
                variant: "destructive"
            });
            return;
        }
        setIsCheckoutOpen(true);
    };

    const placeOrder = () => {
        if (!selectedPharmacy) return;
        if (!customerName.trim()) {
            toast({
                title: "Customer name required",
                description: "Please enter the customer's name to place the order.",
                variant: "destructive"
            });
            return;
        }
        // For now: simulate placing an order (COD only)
        toast({
            title: "Order placed (Cash on Delivery)",
            description: `${customerName.trim()} • ASHA: ${ashaWorkerName} • ${cartItemCount} item(s) from ${selectedPharmacy.name}`
        });
        setCart({});
        setIsCheckoutOpen(false);
        setCustomerName('');
        setDeliveryMethod('cod');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex flex-col items-center justify-center h-[80vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-600 mb-4"></div>
                    <p className="text-gray-600 font-medium text-lg">Finding nearby medical shops...</p>
                    <p className="text-gray-400 text-sm mt-2">Checking real-world locations and inventory</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            {!selectedPharmacy ? (
                <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buy Medicines Nearby</h1>
                        <p className="text-gray-600">Order from trusted real-world pharmacies around you</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pharmacies.map(shop => (
                            <Card
                                key={shop.id}
                                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-none bg-white rounded-2xl overflow-hidden"
                                onClick={() => setSelectedPharmacy(shop)}
                            >
                                <div className="h-32 bg-gradient-to-br from-amazon-500 to-green-500 relative p-6 flex flex-col justify-end">
                                    <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border-none text-white">
                                        {shop.distance}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                                        <Badge variant="outline" className="text-[10px] uppercase py-0 px-1 border-white/30 text-white">
                                            via {shop.source || 'GPS'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-xl font-bold text-white truncate">{shop.name}</h3>
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4 text-amazon-500 flex-shrink-0" />
                                        <span className="truncate">{shop.address}</span>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-bold text-gray-700">{shop.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {shop.duration}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Truck className="h-3 w-3" />
                                                {shop.deliveryTime}
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full bg-amazon-600 hover:bg-amazon-700 rounded-xl group-hover:scale-[1.02] transition-transform">
                                        View Inventory
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto px-4 py-8 mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => setSelectedPharmacy(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-amazon-600 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to shops
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-black text-gray-900">{selectedPharmacy.name}</h1>
                                <Badge variant={selectedPharmacy.isOpen ? 'default' : 'secondary'} className={selectedPharmacy.isOpen ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                                    {selectedPharmacy.isOpen ? 'Open Now' : 'Closed'}
                                </Badge>
                            </div>
                            <p className="text-gray-500 flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> {selectedPharmacy.address}
                            </p>
                        </div>

                        <Card className="bg-amazon-600 text-white border-none rounded-2xl p-4 shadow-lg shadow-amazon-200">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/70">Shopping Cart</p>
                                    <p className="text-lg font-bold">{cartItemCount} Items</p>
                                </div>
                                <Button
                                    onClick={openCheckout}
                                    variant="ghost"
                                    className="bg-white/10 hover:bg-white/20 text-white border-none ml-4"
                                >
                                    Check Out
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Filters */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="sticky top-24">
                                <h3 className="font-bold text-gray-900 mb-4 px-2 uppercase text-xs tracking-widest text-gray-400">Categories</h3>
                                <div className="flex flex-col gap-1">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeCategory === cat
                                                ? 'bg-amazon-600 text-white font-bold shadow-md shadow-amazon-100'
                                                : 'text-gray-600 hover:bg-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Inventory */}
                        <div className="lg:col-span-3">
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Search medicines, dosages, or surgical supplies..."
                                    className="pl-12 py-6 rounded-2xl bg-white border-none shadow-sm focus-visible:ring-amazon-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-4">
                                {filteredInventory.length > 0 ? (
                                    filteredInventory.map(med => (
                                        <Card key={med.id} className="border-none bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col sm:flex-row">
                                                    <div className="p-6 flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                                    {med.name}
                                                                    {med.prescription && (
                                                                        <Badge variant="outline" className="text-[10px] text-red-500 border-red-200 bg-red-50">Rx Required</Badge>
                                                                    )}
                                                                </h4>
                                                                <p className="text-sm font-medium text-gray-400">{med.genericName} • {med.dosage}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-2xl font-black text-gray-900">₹{med.price.toFixed(2)}</p>
                                                                <p className="text-xs text-green-600 font-bold uppercase tracking-wider">
                                                                    {med.stock > 0 ? `${med.stock} in stock` : 'Out of stock'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-3 mt-4">
                                                            <Info className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                                {med.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="px-6 pb-6 sm:py-6 sm:w-48 bg-gray-50/50 flex flex-col justify-center gap-3">
                                                        {!cart[med.id] ? (
                                                            <Button
                                                                onClick={() => addToCart(med.id)}
                                                                className="w-full bg-amazon-600 hover:bg-amazon-700 rounded-xl font-bold h-12"
                                                                disabled={med.stock <= 0}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add to Cart
                                                            </Button>
                                                        ) : (
                                                            <div className="flex items-center justify-between border-2 border-amazon-600 rounded-xl h-12 bg-white overflow-hidden">
                                                                <button
                                                                    onClick={() => removeFromCart(med.id)}
                                                                    className="px-4 h-full hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <Minus className="h-4 w-4 text-amazon-600" />
                                                                </button>
                                                                <span className="font-black text-amazon-600 text-lg">{cart[med.id]}</span>
                                                                <button
                                                                    onClick={() => addToCart(med.id)}
                                                                    className="px-4 h-full hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <Plus className="h-4 w-4 text-amazon-600" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-3xl">
                                        <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900">No items found</h3>
                                        <p className="text-gray-400">Try adjusting your search or category filter</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Dialog */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Checkout</DialogTitle>
                        <DialogDescription>
                            Enter customer details and confirm delivery. (For now: Cash on Delivery)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Input
                                    id="customerName"
                                    placeholder="Enter customer name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ashaName">ASHA Worker (Logged-in)</Label>
                                <Input id="ashaName" value={ashaWorkerName} readOnly />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Delivery / Payment</Label>
                            <RadioGroup
                                value={deliveryMethod}
                                onValueChange={(v) => setDeliveryMethod((v as DeliveryMethod) || 'cod')}
                                className="grid gap-3"
                            >
                                <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer">
                                    <RadioGroupItem value="cod" />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">Cash on Delivery (COD)</div>
                                        <div className="text-sm text-gray-500">Pay when the medicines are delivered.</div>
                                    </div>
                                </label>
                            </RadioGroup>
                        </div>

                        <div className="rounded-xl border bg-white">
                            <div className="px-4 py-3 border-b">
                                <div className="font-semibold text-gray-900">
                                    Order Summary{selectedPharmacy ? ` • ${selectedPharmacy.name}` : ''}
                                </div>
                            </div>
                            <div className="p-4 grid gap-3">
                                {cartLines.length === 0 ? (
                                    <div className="text-sm text-gray-500">No items in cart.</div>
                                ) : (
                                    cartLines.map(({ med, qty, lineTotal }) => (
                                        <div key={med.id} className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-medium text-gray-900">{med.name}</div>
                                                <div className="text-sm text-gray-500">{med.genericName} • {med.dosage}</div>
                                                <div className="text-sm text-gray-600">Qty: {qty}</div>
                                            </div>
                                            <div className="font-semibold text-gray-900">₹{lineTotal.toFixed(2)}</div>
                                        </div>
                                    ))
                                )}

                                <div className="border-t pt-3 grid gap-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Items total</span>
                                        <span className="text-gray-900 font-medium">₹{itemsTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery fee</span>
                                        <span className="text-gray-900 font-medium">
                                            {cartItemCount > 0 ? `₹${deliveryFee.toFixed(2)}` : '₹0.00'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base pt-1">
                                        <span className="text-gray-900 font-semibold">Grand total</span>
                                        <span className="text-gray-900 font-black">₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-amazon-600 hover:bg-amazon-700"
                            onClick={placeOrder}
                            disabled={cartItemCount === 0 || deliveryMethod !== 'cod'}
                        >
                            Place Order (COD)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BuyMedicinesPage;
