import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
    const { member } = useAuth();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`;

    const getItemTotal = (item) => {
        if (item.has_custom_price) {
            return item.customAmount || 0;
        }
        return item.price * item.quantity;
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        if (!member) {
            toast.error('Please login to checkout');
            router.push('/');
            return;
        }

        // Get customer info from member profile
        const customerName = `${member.first_name} ${member.last_name}`;
        const customerPhone = member.phone_number;
        const customerCommand = member.command;

        if (!customerPhone) {
            toast.error('Please update your phone number in profile first');
            router.push('/profile');
            return;
        }

        setProcessing(true);

        const orderData = {
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_command: customerCommand,
            total_amount: getTotalPrice(),
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.has_custom_price ? 1 : item.quantity,
                customAmount: item.customAmount,
                has_custom_price: item.has_custom_price,
            })),
        };

        const result = await api.saveOrder(orderData);

        if (result.success) {
            // Create WhatsApp message
            const itemsText = cartItems.map(item => {
                if (item.has_custom_price) {
                    return `• ${item.name}: ₦${item.customAmount?.toLocaleString()}`;
                }
                return `• ${item.name}: ${item.quantity} × ₦${item.price.toLocaleString()} = ₦${(item.price * item.quantity).toLocaleString()}`;
            }).join('%0A');

            const message = `Hello%20Faith%20Tabernacle%20Security%20Accounts%2C%0A%0A✅%20ORDER%20CONFIRMATION%0AOrder%20Number%3A%20${result.order_number}%0A%0A📋%20ORDER%20DETAILS%3A%0A${itemsText}%0A%0A💰%20TOTAL%20AMOUNT%3A%20${formatPrice(getTotalPrice())}%0A%0A👤%20CUSTOMER%20INFORMATION%3A%0AName%3A%20${encodeURIComponent(customerName)}%0APhone%3A%20${customerPhone}%0ACommand%3A%20${encodeURIComponent(customerCommand)}%0A%0A📷%20Payment%20Proof%3A%20(Attach%20screenshot)%0A%0AThank%20you!`;

            const whatsappUrl = `https://wa.me/2348037280183?text=${message}`;

            toast.success(`Order #${result.order_number} created!`);

            if (confirm('Send payment proof via WhatsApp?')) {
                window.open(whatsappUrl, '_blank');
                clearCart();
                router.push('/orders');
            } else {
                clearCart();
                router.push('/orders');
            }
        } else {
            toast.error('Failed to create order. Please try again.');
        }

        setProcessing(false);
    };

    if (cartItems.length === 0) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <FiShoppingBag size={80} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add items from the store to get started</p>
                    <button
                        onClick={() => router.push('/store')}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
                    >
                        Browse Store
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                    {!item.has_custom_price ? (
                                        <p className="text-primary font-semibold mt-1">{formatPrice(item.price)} each</p>
                                    ) : (
                                        <p className="text-primary font-semibold mt-1">Love Seed Amount</p>
                                    )}
                                    <p className="text-gray-600 mt-2">
                                        Total: <span className="font-bold text-primary">{formatPrice(getItemTotal(item))}</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                    {!item.has_custom_price ? (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                                            >
                                                <FiMinus size={16} />
                                            </button>
                                            <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                                            >
                                                <FiPlus size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24"></div>
                                    )}

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
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
                    <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-24">
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
                                    <span className="text-primary text-xl">{formatPrice(getTotalPrice())}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={processing}
                            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Processing...' : 'Proceed to Checkout →'}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            You will be redirected to WhatsApp to send payment proof
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}