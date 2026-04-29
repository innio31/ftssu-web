import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function StorePage() {
    const router = useRouter();
    const { member } = useAuth();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [customAmount, setCustomAmount] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!member) {
            router.push('/');
            return;
        }
        loadProducts();
    }, [member]);

    const loadProducts = async () => {
        const result = await api.getProducts();
        if (result.success) {
            setProducts(result.products);
        }
        setLoading(false);
    };

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`;

    const handleAddToCart = () => {
        if (!selectedProduct) return;

        if (selectedProduct.has_custom_price) {
            const amount = parseInt(customAmount);
            if (!amount || amount <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }
            addToCart(selectedProduct, 1, amount);
            toast.success(`Added ₦${amount.toLocaleString()} as ${selectedProduct.name}`);
        } else {
            addToCart(selectedProduct, quantity);
            toast.success(`Added ${quantity} × ${selectedProduct.name}`);
        }

        setShowModal(false);
        setQuantity(1);
        setCustomAmount('');
        setSelectedProduct(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="bg-red-600 text-white p-6 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <button onClick={() => router.back()} className="text-white hover:text-red-200">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold">🛍️ Order Form</h1>
                        <button onClick={() => router.push('/cart')} className="text-white hover:text-red-200">
                            🛒 Cart
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Welcome Banner */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <p className="text-gray-600">Welcome, <span className="font-semibold">{member?.first_name} {member?.last_name}</span></p>
                    <p className="text-sm text-gray-500">Command: {member?.command}</p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                                {!product.has_custom_price ? (
                                    <p className="text-2xl font-bold text-red-600 mb-4">{formatPrice(product.price)}</p>
                                ) : (
                                    <p className="text-sm text-red-600 mb-4 italic">💝 Give what's in your heart</p>
                                )}
                                {product.description && (
                                    <p className="text-gray-500 text-sm mb-4">{product.description}</p>
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setShowModal(true);
                                    }}
                                    className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products available at the moment.</p>
                    </div>
                )}
            </div>

            {/* Add to Cart Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add to Cart</h2>
                        <h3 className="text-xl font-semibold text-red-600 mb-2">{selectedProduct.name}</h3>

                        {!selectedProduct.has_custom_price ? (
                            <>
                                <p className="text-gray-600 mb-4">{formatPrice(selectedProduct.price)} each</p>

                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xl font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-xl font-bold"
                                    >
                                        +
                                    </button>
                                </div>

                                <p className="text-lg font-semibold text-center mb-6">
                                    Total: {formatPrice(selectedProduct.price * quantity)}
                                </p>
                            </>
                        ) : (
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">
                                    Enter Amount (₦)
                                </label>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}