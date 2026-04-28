import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { FiBell, FiPin, FiUser, FiClock } from 'react-icons/fi';

export default function AnnouncementsPage() {
    const { member } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        const result = await api.getAnnouncements();
        if (result.success && result.announcements) {
            setAnnouncements(result.announcements);
        }
        setLoading(false);
    };

    const getTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    const getRoleColor = (role) => {
        const colors = {
            'Admin': '#cc0000',
            'IT Admin': '#2196F3',
            'Acct Admin': '#4CAF50',
            'Senior Commander I': '#FF9800',
            'Senior Commander II': '#FF9800',
            'Commander I': '#9C27B0',
            'Commander II': '#9C27B0',
            'Secretary': '#00BCD4',
        };
        return colors[role] || '#666';
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-red-700 rounded-2xl p-6 text-white">
                    <h1 className="text-2xl font-bold">📢 Announcements</h1>
                    <p className="text-red-100 mt-2">Stay updated with the latest news</p>
                </div>

                {/* Announcements List */}
                {announcements.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FiBell size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No announcements</h3>
                        <p className="text-gray-500">Check back later for updates</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`bg-white rounded-xl shadow-sm overflow-hidden ${announcement.is_pinned == 1 ? 'border-l-4 border-l-primary' : ''
                                    }`}
                            >
                                {announcement.is_pinned == 1 && (
                                    <div className="bg-yellow-50 px-4 py-1 flex items-center gap-1">
                                        <FiPin size={12} className="text-primary" />
                                        <span className="text-xs text-primary font-semibold">PINNED</span>
                                    </div>
                                )}

                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-3">{announcement.title}</h2>
                                    <p className="text-gray-600 leading-relaxed mb-4">{announcement.content}</p>

                                    <div className="flex flex-wrap justify-between items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: `${getRoleColor(announcement.author_role)}20` }}
                                            >
                                                <FiUser size={14} style={{ color: getRoleColor(announcement.author_role) }} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{announcement.author}</p>
                                                <p className="text-xs text-gray-500">{announcement.author_role}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                                            <FiClock size={14} />
                                            <span>{getTimeAgo(announcement.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}