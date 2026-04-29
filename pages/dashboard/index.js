import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
    const router = useRouter()
    const [member, setMember] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) {
            router.push('/')
            return
        }
        setMember(JSON.parse(stored))
        setLoading(false)
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('ftssu_member')
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-red-600 text-white p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">FTSSU Portal</h1>
                        <p className="text-sm text-red-100 mt-1">Welcome, {member?.first_name} {member?.last_name}</p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-700 px-4 py-2 rounded-lg hover:bg-red-800">
                        Logout
                    </button>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <a href="/store" className="bg-blue-500 text-white p-6 rounded-xl shadow-md hover:bg-blue-600 transition">
                        <div className="text-3xl mb-2">🛍️</div>
                        <h3 className="font-bold">Store</h3>
                        <p className="text-sm opacity-90">Order security items</p>
                    </a>
                    <a href="/profile" className="bg-green-500 text-white p-6 rounded-xl shadow-md hover:bg-green-600 transition">
                        <div className="text-3xl mb-2">👤</div>
                        <h3 className="font-bold">Profile</h3>
                        <p className="text-sm opacity-90">View and edit profile</p>
                    </a>
                    <a href="/cart" className="bg-purple-500 text-white p-6 rounded-xl shadow-md hover:bg-purple-600 transition">
                        <div className="text-3xl mb-2">🛒</div>
                        <h3 className="font-bold">Cart</h3>
                        <p className="text-sm opacity-90">View your cart</p>
                    </a>
                    <a href="/orders" className="bg-orange-500 text-white p-6 rounded-xl shadow-md hover:bg-orange-600 transition">
                        <div className="text-3xl mb-2">📋</div>
                        <h3 className="font-bold">My Orders</h3>
                        <p className="text-sm opacity-90">Track your orders</p>
                    </a>
                    <a href="/attendance" className="bg-teal-500 text-white p-6 rounded-xl shadow-md hover:bg-teal-600 transition">
                        <div className="text-3xl mb-2">📅</div>
                        <h3 className="font-bold">Attendance</h3>
                        <p className="text-sm opacity-90">Mark attendance</p>
                    </a>
                    <a href="/announcements" className="bg-pink-500 text-white p-6 rounded-xl shadow-md hover:bg-pink-600 transition">
                        <div className="text-3xl mb-2">📢</div>
                        <h3 className="font-bold">Announcements</h3>
                        <p className="text-sm opacity-90">View updates</p>
                    </a>
                </div>
            </div>
        </div>
    )
}