import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
    const router = useRouter()
    const [member, setMember] = useState(null)
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('announcements')

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) {
            router.push('/')
            return
        }
        const memberData = JSON.parse(stored)
        setMember(memberData)

        // Load announcements
        fetchAnnouncements()

        setLoading(false)
    }, [router])

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('/api/get_announcements.php')
            const data = await response.json()
            if (data.success && data.announcements) {
                setAnnouncements(data.announcements)
            }
        } catch (error) {
            console.error('Error loading announcements:', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('ftssu_member')
        router.push('/')
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins} minutes ago`
        if (diffHours < 24) return `${diffHours} hours ago`
        return `${diffDays} days ago`
    }

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
        }
        return colors[role] || '#666'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-600 text-white p-6 shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">FTSSU Portal</h1>
                        <p className="text-sm text-red-100 mt-1">Welcome, {member?.first_name} {member?.last_name}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{member?.designation}</span>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{member?.command}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-800 px-4 py-2 rounded-lg text-sm hover:bg-red-900 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content - Announcements First */}
            <div className="p-4">
                {activeTab === 'announcements' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>📢</span> Announcements
                        </h2>
                        {announcements.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                                <p className="text-gray-500">No announcements yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {announcements.map((announcement) => (
                                    <div
                                        key={announcement.id}
                                        className={`bg-white rounded-xl shadow-md overflow-hidden ${announcement.is_pinned == 1 ? 'border-l-4 border-l-red-600' : ''
                                            }`}
                                    >
                                        {announcement.is_pinned == 1 && (
                                            <div className="bg-yellow-50 px-4 py-1 border-b border-yellow-200">
                                                <span className="text-xs text-red-600 font-semibold">📌 PINNED</span>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">{announcement.title}</h3>
                                            <p className="text-gray-600 leading-relaxed mb-3">{announcement.content}</p>
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                        style={{ backgroundColor: getRoleColor(announcement.author_role) }}
                                                    >
                                                        {announcement.author?.[0]}
                                                    </div>
                                                    <span className="text-gray-500">{announcement.author} ({announcement.author_role})</span>
                                                </div>
                                                <span className="text-gray-400 text-xs">{formatDate(announcement.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Placeholder for other tabs - will add functionality gradually */}
                {activeTab === 'store' && (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500">Store coming soon...</p>
                        <button
                            onClick={() => window.location.href = '/store'}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            Go to Store →
                        </button>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500">Profile coming soon...</p>
                        <button
                            onClick={() => window.location.href = '/profile'}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            Go to Profile →
                        </button>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500">My Orders coming soon...</p>
                        <button
                            onClick={() => window.location.href = '/orders'}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            View Orders →
                        </button>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500">Attendance coming soon...</p>
                        <button
                            onClick={() => window.location.href = '/attendance'}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            Mark Attendance →
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex justify-around items-center">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'announcements' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">📢</span>
                        <span className="text-xs mt-1 font-medium">News</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('store')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'store' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">🛍️</span>
                        <span className="text-xs mt-1 font-medium">Store</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'orders' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">📋</span>
                        <span className="text-xs mt-1 font-medium">Orders</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'attendance' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">📅</span>
                        <span className="text-xs mt-1 font-medium">Attendance</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'profile' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">👤</span>
                        <span className="text-xs mt-1 font-medium">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    )
}