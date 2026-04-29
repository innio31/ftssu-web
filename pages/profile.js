import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function ProfilePage() {
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
                <button onClick={() => router.back()} className="mr-4">← Back</button>
                <h1 className="text-2xl font-bold inline">My Profile</h1>
            </div>
            <div className="p-6 max-w-md mx-auto">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-center mb-6">
                        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-white text-3xl font-bold">{member?.first_name?.[0]}{member?.last_name?.[0]}</span>
                        </div>
                        <h2 className="text-xl font-bold mt-3">{member?.first_name} {member?.last_name}</h2>
                        <p className="text-gray-500">ID: {member?.id_number}</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Designation:</span>
                            <span className="font-semibold">{member?.designation}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Role:</span>
                            <span className="font-semibold">{member?.role}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Command:</span>
                            <span className="font-semibold">{member?.command}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-semibold">{member?.gender}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-semibold">{member?.phone_number || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-semibold">{member?.email || 'Not set'}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full bg-red-600 text-white py-3 rounded-lg mt-6 hover:bg-red-700">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}