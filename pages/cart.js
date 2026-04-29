import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CartPage() {
    const router = useRouter();
    const { member } = useAuth();
    const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
    const [processing, setProcessing] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [orderSaved, setOrderSaved] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`;

    const getItemTotal = (item) => {
        if (item.has_custom_price) {
            return item.customAmount || 0;
        }
        return item.price * item.quantity;
    };

    // Function to validate customer info from member profile
    const validateCustomerInfo = () => {
        if (!member) {
            toast.error('Please login to continue');
            router.push('/');
            return false;
        }

        if (!member.phone_number) {
            toast.error('Please update your phone number in profile first');
            router.push('/profile');
            return false;
        }

        if (!member.command) {
            toast.error('Command information missing');
            return false;
        }

        return true;
    };

    // Function to save order to backend
    const saveOrderToBackend = async () => {
        if (!validateCustomerInfo()) return null;

        const items = cartItems
            .filter(item => item.has_custom_price ? (item.customAmount > 0) : (item.quantity > 0))
            .map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.has_custom_price ? 1 : item.quantity,
                customAmount: item.customAmount,
                has_custom_price: item.has_custom_price,
            }));

        if (items.length === 0) {
            toast.error('Please add at least one item to your order');
            return null;
        }

        const orderData = {
            customer_name: `${member.first_name} ${member.last_name}`,
            customer_phone: member.phone_number,
            customer_command: member.command,
            total_amount: getTotalPrice(),
            items: items
        };

        try {
            const result = await api.saveOrder(orderData);
            if (result.success) {
                return { success: true, order_number: result.order_number, total: getTotalPrice() };
            } else {
                toast.error('Error saving order: ' + (result.error || 'Unknown error'));
                return null;
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error saving order. Please check your connection.');
            return null;
        }
    };

    // Handle "Proceed to Payment" - Validate and show payment details
    const handleProceedToPayment = async () => {
        if (!validateCustomerInfo()) return;

        const total = getTotalPrice();
        if (total === 0) {
            toast.error('Please add at least one item to your order');
            return;
        }

        // Show payment details section
        setShowPaymentDetails(true);

        // Scroll to payment section
        setTimeout(() => {
            const paymentSection = document.getElementById('payment-section');
            if (paymentSection) {
                paymentSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    // Handle WhatsApp send - Save order ONCE then open WhatsApp
    const handleSendPaymentProof = async (e) => {
        e.preventDefault();

        if (!validateCustomerInfo()) return;

        const total = getTotalPrice();
        if (total === 0) {
            toast.error('Please add at least one item to your order');
            return;
        }

        // Prevent duplicate order saving
        if (orderSaved && orderNumber) {
            // Already saved, just open WhatsApp
            const whatsappUrl = generateWhatsAppUrl(orderNumber, total);
            window.open(whatsappUrl, '_blank');
            toast.success(`Order #${orderNumber} already recorded. Send payment proof via WhatsApp.`);
            return;
        }

        // Save order to backend (first and only time)
        setProcessing(true);
        const saveResult = await saveOrderToBackend();
        setProcessing(false);

        if (saveResult && saveResult.success) {
            setOrderSaved(true);
            setOrderNumber(saveResult.order_number);

            // Clear cart after successful order
            clearCart();

            // Open WhatsApp with order details
            const whatsappUrl = generateWhatsAppUrl(saveResult.order_number, saveResult.total);
            window.open(whatsappUrl, '_blank');

            toast.success(`✅ Order #${saveResult.order_number} recorded successfully!`);

            // Redirect to orders page after a delay
            setTimeout(() => {
                router.push('/orders');
            }, 3000);
        }
    };

    const generateWhatsAppUrl = (orderNum, totalAmount) => {
        const customerName = `${member?.first_name} ${member?.last_name}` || 'Customer';
        const customerPhone = member?.phone_number || 'Not provided';
        const customerCommand = member?.command || 'Not specified';
        const formattedTotal = formatPrice(totalAmount);

        const itemsText = cartItems.map(item => {
            if (item.has_custom_price) {
                return `• ${item.name}: ₦${item.customAmount?.toLocaleString()}`;
            }
            return `• ${item.name}: ${item.quantity} × ₦${item.price.toLocaleString()} = ₦${(item.price * item.quantity).toLocaleString()}`;
        }).join('%0A');

        const message = `Hello%20Faith%20Tabernacle%20Security%20Accounts%2C%0A%0A✅%20ORDER%20CONFIRMATION%0AOrder%20Number%3A%20${orderNum}%0A%0A📋%20ORDER%20DETAILS%3A%0A${itemsText}%0A%0A💰%20TOTAL%20AMOUNT%3A%20${formattedTotal}%0A%0A👤%20CUSTOMER%20INFORMATION%3A%0AName%3A%20${encodeURIComponent(customerName)}%0APhone%3A%20${customerPhone}%0ACommand%3A%20${encodeURIComponent(customerCommand)}%0A%0A📷%20Payment%20Proof%3A%20(Attach%20screenshot)%0A%0AThank%20you!`;

        return `https://wa.me/2348037280183?text=${message}`;
    };

    if (cartItems.length === 0 && !orderSaved) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-red-600 text-white p-6">
                    <button onClick={() => router.back()} className="text-white">← Back</button>
                    <h1 className="text-2xl font-bold mt-2">Shopping Cart</h1>
                </div>
                <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add items from the store to get started</p>
                    <button
                        onClick={() => router.push('/store')}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
                    >
                        Browse Store
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />

            <div className="bg-red-600 text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <button onClick={() => router.back()} className="text-white">← Back</button>
                        <h1 className="text-2xl font-bold">Shopping Cart</h1>
                        <div className="w-16"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-md p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                                        {!item.has_custom_price ? (
                                            <p className="text-red-600 font-semibold mt-1">{formatPrice(item.price)} each</p>
                                        ) : (
                                            <p className="text-red-600 font-semibold mt-1">Love Seed Amount: {formatPrice(item.customAmount)}</p>
                                        )}
                                        <p className="text-gray-600 mt-2">
                                            Total: <span className="font-bold text-red-600">{formatPrice(getItemTotal(item))}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {!item.has_custom_price ? (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24"></div>
                                        )}

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-700 text-xl"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="text-gray-500 hover:text-red-500 text-sm"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(getTotalPrice())}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold text-gray-800">
                                    <span>Total</span>
                                    <span className="text-red-600 text-xl">{formatPrice(getTotalPrice())}</span>
                                </div>
                            </div>
                        </div>

                        {!showPaymentDetails ? (
                            <button
                                onClick={handleProceedToPayment}
                                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                💳 PROCEED TO PAYMENT →
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                    <p className="text-green-700 text-sm font-semibold">✓ Order ready for payment</p>
                                </div>

                                <button
                                    onClick={handleSendPaymentProof}
                                    disabled={processing}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>📱</span>
                                            Send Payment Proof on WhatsApp
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Details Section - Shows when user proceeds */}
                {showPaymentDetails && (
                    <div id="payment-section" className="mt-8 bg-white rounded-xl shadow-md overflow-hidden border-2 border-red-200">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                            <h3 className="text-white font-bold text-lg">🏦 PAYMENT DETAILS</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">ACCOUNT NUMBER</div>
                                    <div className="text-lg font-bold text-gray-800">0520007050</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">BANK NAME</div>
                                    <div className="text-lg font-bold text-gray-800">Covenant Microfinance Bank</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">ACCOUNT NAME</div>
                                    <div className="text-lg font-bold text-gray-800">Faith Tabernacle Security Service Group</div>
                                </div>
                            </div>

                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                <p className="text-yellow-800 text-sm">
                                    ✅ After payment, click the "Send Payment Proof" button above to complete your order
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}