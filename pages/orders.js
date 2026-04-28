import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { FiSearch, FiPackage, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function OrdersPage() {
    const { member } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState(member?.phone_number || '');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleTrackOrder = async () => {
        if (!phoneNumber || phoneNumber.length !== 11) {
            alert('Please enter a valid 11-digit phone number');
            return;
        }

        setLoading(true);
        const result = await api.getOrders(phoneNumber);
        setLoading(false);
        setSearched(true);

        if (result.success) {
            setOrders(result.orders);
        } else {
            setOrders([]);
            alert('Failed to fetch orders');
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return { icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending Payment' };
            case 'payment_confirmed':
                return { icon: FiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Payment Confirmed' };
            case 'goods_delivered':
                return { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Delivered ✓' };
            case 'cancelled':
                return { icon: FiXCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Cancelled' };
            default:
                return { icon: FiPackage, color: 'text-gray-600', bg: 'bg-gray-100', text: status };
        }
    };

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`;
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">📋 Track Orders</h1>

                {/* Search Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                    <div className="flex gap-3">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="e.g., 08012345678"
                            maxLength={11}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleTrackOrder}
                            disabled={loading}
                            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSearch />}
                            Track
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                {searched && !loading && orders.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FiPackage size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
                        <p className="text-gray-500">No orders found for this phone number.</p>
                    </div>
                )}

                <div className="space-y-4">
                    {orders.map((order) => {
                        const StatusIcon = getStatusConfig(order.status).icon;
                        const statusConfig = getStatusConfig(order.status);

                        return (
                            <div key={order.order_number} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary">{order.order_number}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div className={`${statusConfig.bg} px-3 py-1 rounded-full flex items-center gap-2`}>
                                            <StatusIcon className={statusConfig.color} size={16} />
                                            <span className={`text-sm font-semibold ${statusConfig.color}`}>{statusConfig.text}</span>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Customer Name</p>
                                            <p className="font-medium">{order.customer_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Command</p>
                                            <p className="font-medium">{order.customer_command || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Amount</p>
                                            <p className="text-2xl font-bold text-primary">{formatPrice(order.total_amount)}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedOrder(selectedOrder?.order_number === order.order_number ? null : order)}
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            {selectedOrder?.order_number === order.order_number ? 'Hide Items ↑' : 'View Items ↓'}
                                        </button>
                                    </div>

                                    {/* Order Items - Expandable */}
                                    {selectedOrder?.order_number === order.order_number && (
                                        <div className="mt-4 pt-4 border-t">
                                            <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                                            <div className="space-y-2">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <div>
                                                            <p className="font-medium">{item.product_name}</p>
                                                            <p className="text-xs text-gray-500">×{item.quantity} @ {formatPrice(item.unit_price)}</p>
                                                        </div>
                                                        <p className="font-semibold text-primary">{formatPrice(item.total_price)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {orders.length > 0 && (
                    <p className="text-center text-sm text-gray-500 py-4">
                        Showing {orders.length} order(s)
                    </p>
                )}
            </div>
        </Layout>
    );
}