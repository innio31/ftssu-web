import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function OrdersPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) {
            router.push('/')
            return
        }
        setLoading(false)
    }, [router])

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
                <button onClick={() => router.back()} className="mr-4">← Back</button>
                <h1 className="text-2xl font-bold inline">My Orders</h1>
            </div>
            <div className="p-6 text-center">
                <div className="bg-white rounded-xl shadow-md p-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">No Orders Yet</h2>
                    <p className="text-gray-500 mb-6">Your orders will appear here once you make a purchase</p>
                    <a href="/store" className="bg-red-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-red-700">
                        Browse Store
                    </a>
                </div>
            </div>
        </div>
    )
}