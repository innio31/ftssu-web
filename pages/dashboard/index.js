import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
    const { member, logout, hasRole } = useAuth();
    const { cartCount } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (!member) {
            router.push('/');
        }
    }, [member, router]);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        router.push('/');
    };

    if (!member) {
        return null;
    }

    const menuItems = [
        { href: '/store', label: '🛍️ Store', color: 'bg-blue-500', show: true },
        { href: '/cart', label: `🛒 Cart ${cartCount > 0 ? `(${cartCount})` : ''}`, color: 'bg-green-500', show: true },
        { href: '/orders', label: '📋 My Orders', color: 'bg-purple-500', show: true },
        { href: '/attendance', label: '📅 Attendance', color: 'bg-yellow-500', show: hasRole(['Senior Commander I', 'Senior Commander II', 'Secretary', 'IT Admin', 'Admin']) },
        { href: '/announcements', label: '📢 Announcements', color: 'bg-pink-500', show: true },
        { href: '/profile', label: '👤 Profile', color: 'bg-gray-500', show: true },
    ];

    const visibleMenu = menuItems.filter(item => item.show);

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="bg-red-600 text-white p-6 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">FTSSU Portal</h1>
                            <p className="text-red-100 text-sm mt-1">Faith Tabernacle Security Service Unit</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-700 px-4 py-2 rounded-lg hover:bg-red-800 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Welcome Banner */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Welcome back, {member.designation} {member.first_name} {member.last_name}!
                    </h2>
                    <div className="flex gap-4 mt-3">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                            {member.role}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {member.command}
                        </span>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleMenu.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${item.color} text-white rounded-xl shadow-md p-6 hover:opacity-90 transition-opacity`}
                        >
                            <div className="text-3xl mb-2">{item.label.split(' ')[0]}</div>
                            <h3 className="text-lg font-semibold">{item.label}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}