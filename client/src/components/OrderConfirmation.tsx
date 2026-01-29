import React from 'react';
import { CheckCircle, MapPin, Clock, Phone, Mail, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

interface OrderConfirmationProps {
  orderData: any;
  onBackToShopping: () => void;
}

export default function OrderConfirmation({ orderData, onBackToShopping }: OrderConfirmationProps) {
  const orderId = `ORD${Date.now().toString().slice(-8)}`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amazon-50 via-white to-amazon-100 pt-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">Thank you for your order. We'll process it shortly.</p>
            <div className="mt-4 p-3 bg-green-50 rounded-lg inline-block">
              <p className="text-green-800 font-medium">Order ID: {orderId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amazon-100 rounded-full flex items-center justify-center">
                      <span className="text-amazon-600 font-medium text-sm">C</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{orderData.customerName}</p>
                      <p className="text-sm text-gray-600">Customer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">P</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{orderData.patientName}</p>
                      <p className="text-sm text-gray-600">Patient</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{orderData.phone}</span>
                  </div>
                  {orderData.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{orderData.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Delivery Address</p>
                    <p className="text-gray-600">{orderData.deliveryAddress}</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Estimated Delivery</p>
                      <p className="text-sm text-green-700">
                        {new Date(orderData.estimatedDelivery).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pharmacy Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pharmacy Details</h2>
                <div className="p-4 bg-amazon-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{orderData.pharmacy.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{orderData.pharmacy.address}</p>
                  <p className="text-sm text-gray-600">📞 {orderData.pharmacy.phone}</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Items Ordered */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items Ordered
                </h2>
                <div className="space-y-4">
                  {orderData.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.genericName}</p>
                        <p className="text-sm text-gray-600">{item.manufacturer}</p>
                        <p className="text-sm text-amazon-600 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
                        <p className="text-sm text-gray-600">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{orderData.pricing.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">
                      {orderData.pricing.deliveryFee === 0 ? 'FREE' : `₹${orderData.pricing.deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="text-gray-900">₹{orderData.pricing.tax}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total Paid</span>
                    <span className="text-amazon-600">₹{orderData.pricing.total}</span>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Payment Method:</strong> {
                        orderData.paymentMethod === 'cod' ? 'Cash on Delivery' :
                        orderData.paymentMethod === 'upi' ? 'UPI Payment' : 'Credit/Debit Card'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amazon-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Order Confirmation</p>
                      <p className="text-sm text-gray-600">You'll receive an SMS/email confirmation shortly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Pharmacy Processing</p>
                      <p className="text-sm text-gray-600">Pharmacy will prepare your medicines</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Out for Delivery</p>
                      <p className="text-sm text-gray-600">You'll get tracking details via SMS</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                    <div>
                      <p className="font-medium text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-600">Medicines delivered to your address</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={onBackToShopping}
                  className="w-full bg-amazon-600 hover:bg-amazon-700 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.print()}
                >
                  Print Order Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}