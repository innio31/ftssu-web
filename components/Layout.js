import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FiHome, FiShoppingBag, FiShoppingCart, FiClipboard, FiUser, FiMenu, FiX, FiBell, FiLogOut, FiCalendar, FiUsers, FiPackage, FiMegaphone } from 'react-icons/fi';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { member, logout, hasRole } = useAuth();
    const { cartCount } = useCart();
    const router = useRouter();

    const isITAdmin = hasRole(['IT Admin', 'Admin']);
    const isAcctAdmin = hasRole(['Acct Admin', 'Admin']);
    const isSeniorCommander = hasRole(['Senior Commander I', 'Senior Commander II', 'Admin']);
    const isSecretary = hasRole(['Secretary', 'Admin']);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: FiHome, show: true },
        { name: 'Store', href: '/store', icon: FiShoppingBag, show: true },
        { name: 'Attendance', href: '/attendance', icon: FiCalendar, show: isSeniorCommander || isSecretary },
        { name: 'Announcements', href: '/announcements', icon: FiMegaphone, show: true },
        { name: 'My Orders', href: '/orders', icon: FiClipboard, show: true },
        { name: 'Members', href: '/admin/members', icon: FiUsers, show: isITAdmin },
        { name: 'Services', href: '/admin/services', icon: FiCalendar, show: isITAdmin },
        { name: 'Products', href: '/admin/products', icon: FiPackage, show: isAcctAdmin },
        { name: 'Profile', href: '/profile', icon: FiUser, show: true },
    ];

    const visibleNavItems = navItems.filter(item => item.show);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary text-white z-50 px-4 py-3 flex justify-between items-center">
                <button onClick={() => setSidebarOpen(true)}>
                    <FiMenu size={24} />
                </button>
                <div className="font-bold">FTSSU</div>
                <Link href="/cart" className="relative">
                    <FiShoppingCart size={24} />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-yellow-400 text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="bg-primary p-6 text-white">
                        <div className="flex justify-between items-center lg:justify-center">
                            <div>
                                <div className="text-xl font-bold">FTSSU</div>
                                <div className="text-xs text-red-100 mt-1">Faith Tabernacle Security</div>
                            </div>
                            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                                <FiX size={24} />
                            </button>
                        </div>
                        {member && (
                            <div className="mt-4 pt-4 border-t border-red-700">
                                <div className="text-sm font-semibold">{member.designation} {member.first_name} {member.last_name}</div>
                                <div className="text-xs text-red-200 mt-1">{member.role}</div>
                                <div className="text-xs text-red-200">{member.command}</div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6">
                        {visibleNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-6 py-3 mx-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                    {item.name === 'Cart' && cartCount > 0 && (
                                        <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-6 border-t">
                        <button
                            onClick={() => {
                                logout();
                                router.push('/');
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <FiLogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-0">
                {/* Desktop Header */}
                <div className="hidden lg:block bg-white shadow-sm sticky top-0 z-10">
                    <div className="px-8 py-4 flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-800">
                            {router.pathname === '/' ? 'Dashboard' : router.pathname.split('/').pop()}
                        </h1>
                        <div className="flex items-center gap-4">
                            <Link href="/cart" className="relative">
                                <FiShoppingCart size={20} className="text-gray-600" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <div className="text-sm text-gray-600">
                                {member?.first_name} {member?.last_name}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}