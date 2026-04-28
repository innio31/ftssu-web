import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { FiShoppingBag, FiPackage, FiCalendar, FiUsers, FiDollarSign, FiClipboard } from 'react-icons/fi';
import { api } from '../../services/api';

export default function Dashboard() {
    const { member, hasRole } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        activeServices: 0,
        totalMembers: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!member) {
            router.push('/');
            return;
        }
        loadDashboardData();
    }, [member]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load orders (if Acct Admin or Admin)
            if (hasRole(['Acct Admin', 'Admin'])) {
                const ordersResult = await api.getAllOrders();
                if (ordersResult.success) {
                    const totalRevenue = ordersResult.orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
                    setStats(prev => ({
                        ...prev,
                        totalOrders: ordersResult.orders.length,
                        totalRevenue: totalRevenue,
                    }));
                    setRecentOrders(ordersResult.orders.slice(0, 5));
                }
            }

            // Load active services (if IT Admin or Admin)
            if (hasRole(['IT Admin', 'Admin'])) {
                const servicesResult = await api.getActiveServices();
                if (servicesResult.success) {
                    setStats(prev => ({
                        ...prev,
                        activeServices: servicesResult.services?.length || 0,
                    }));
                }
            }

            // Load members (if IT Admin or Admin)
            if (hasRole(['IT Admin', 'Admin'])) {
                const membersResult = await api.getMembers();
                if (membersResult.success) {
                    setStats(prev => ({
                        ...prev,
                        totalMembers: membersResult.members?.length || 0,
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
        setLoading(false);
    };

    const quickActions = [];

    if (hasRole(['Acct Admin', 'Admin'])) {
        quickActions.push(
            { name: 'View Orders', href: '/admin/orders', icon: FiClipboard, color: 'bg-blue-500' },
            { name: 'Manage Products', href: '/admin/products', icon: FiPackage, color: 'bg-green-500' }
        );
    }

    if (hasRole(['IT Admin', 'Admin'])) {
        quickActions.push(
            { name: 'Manage Members', href: '/admin/members', icon: FiUsers, color: 'bg-purple-500' },
            { name: 'Create Service', href: '/admin/services', icon: FiCalendar, color: 'bg-orange-500' }
        );
    }

    quickActions.push(
        { name: 'Shop Now', href: '/store', icon: FiShoppingBag, color: 'bg-primary' }
    );

    return (
        <Layout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-primary to-red-700 rounded-2xl p-6 text-white">
                    <h1 className="text-2xl font-bold">
                        Welcome back, {member?.first_name} {member?.last_name}!
                    </h1>
                    <p className="text-red-100 mt-2">
                        {member?.role} | {member?.command}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {hasRole(['Acct Admin', 'Admin']) && (
                        <>
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            ₦{stats.totalRevenue.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <FiDollarSign className="text-green-600 text-xl" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FiClipboard className="text-blue-600 text-xl" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {hasRole(['IT Admin', 'Admin']) && (
                        <>
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Members</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.totalMembers}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <FiUsers className="text-purple-600 text-xl" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Active Services</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.activeServices}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <FiCalendar className="text-orange-600 text-xl" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.name}
                                    onClick={() => router.push(action.href)}
                                    className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
                                >
                                    <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                                        <Icon className="text-white text-xl" />
                                    </div>
                                    <span className="text-gray-700 font-medium">{action.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Orders */}
                {hasRole(['Acct Admin', 'Admin']) && recentOrders.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {recentOrders.map((order) => (
                                            <tr key={order.order_number} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/orders/${order.order_number}`)}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_number}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{order.customer_name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-primary">₦{parseFloat(order.total_amount).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'goods_delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'payment_confirmed' ? 'bg-blue-100 text-blue-700' :
                                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                        }`}>
                                                        {order.status === 'goods_delivered' ? 'Delivered' :
                                                            order.status === 'payment_confirmed' ? 'Paid' :
                                                                order.status === 'pending' ? 'Pending' : 'Cancelled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}