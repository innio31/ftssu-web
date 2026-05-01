import { useState, useEffect, useRef } from 'react';

const VAPID_PUBLIC_KEY = 'BOi3CgueVPx_-CM45Wfrd6up3AYLvX2uGhoWSDKQJOifPpnxJTUsShQMZljZIyVBFEUehuTiQdR6ul6vLB-0xOI';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function NotificationBell({ member }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [permissionState, setPermissionState] = useState('default');
    const dropdownRef = useRef(null);

    // Subscribe to push & fetch notifications on mount
    useEffect(() => {
        if (!member?.id) return;
        subscribeToPush();
        fetchNotifications();

        // Poll every 60 seconds for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [member]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('[Push] Not supported in this browser');
            return;
        }

        const permission = await Notification.requestPermission();
        setPermissionState(permission);

        if (permission !== 'granted') {
            console.log('[Push] Permission denied');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const existing = await registration.pushManager.getSubscription();

            // If already subscribed, just save it (in case of re-login)
            const subscription = existing || await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Save subscription to server
            await fetch('/api/save_subscription.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    member_id: member.id,
                    subscription: subscription.toJSON()
                })
            });

            console.log('[Push] Subscribed and saved successfully');
        } catch (err) {
            console.error('[Push] Subscription failed:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/get_notifications.php?member_id=${member.id}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            }
        } catch (err) {
            console.error('[Notifications] Fetch failed:', err);
        }
    };

    const handleBellClick = async () => {
        setShowDropdown(prev => !prev);

        // Mark all as read when opening
        if (!showDropdown && unreadCount > 0) {
            try {
                await fetch('/api/get_notifications.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ member_id: member.id })
                });
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            } catch (err) {
                console.error('[Notifications] Mark read failed:', err);
            }
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'announcement': return '📢';
            case 'order': return '🛍️';
            case 'birthday': return '🎂';
            default: return '🔔';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleBellClick}
                className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-red-600 px-4 py-3 flex justify-between items-center">
                        <h3 className="text-white font-bold text-sm">🔔 Notifications</h3>
                        <span className="text-red-200 text-xs">{notifications.length} total</span>
                    </div>

                    {/* Permission warning */}
                    {permissionState === 'denied' && (
                        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
                            <p className="text-yellow-700 text-xs">⚠️ Push blocked. Enable in browser settings to receive alerts.</p>
                        </div>
                    )}

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-3xl mb-2">🔕</p>
                                <p className="text-gray-400 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`px-4 py-3 transition-colors ${!n.is_read ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <div className="flex gap-3 items-start">
                                        <span className="text-xl mt-0.5">{getTypeIcon(n.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold text-gray-800 truncate ${!n.is_read ? 'text-red-800' : ''}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                                            <p className="text-xs text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                                        </div>
                                        {!n.is_read && (
                                            <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}