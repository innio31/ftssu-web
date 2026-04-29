import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AnnouncementsPage() {
    const router = useRouter()
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) {
            router.push('/')
            return
        }

        // Fetch announcements
        fetch('/api/get_announcements.php')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.announcements) {
                    setAnnouncements(data.announcements)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error('Error loading announcements:', err)
                setLoading(false)
            })
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">Loading announcements...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-red-600 text-white p-6">
                <button onClick={() => router.back()} className="mr-4">← Back</button>
                <h1 className="text-2xl font-bold inline">Announcements</h1>
            </div>
            <div className="p-6 max-w-3xl mx-auto">
                {announcements.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">📢</div>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">No Announcements</h2>
                        <p className="text-gray-500">Check back later for updates</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div key={announcement.id} className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-bold text-lg text-gray-800">{announcement.title}</h3>
                                <p className="text-gray-600 mt-2">{announcement.content}</p>
                                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                                    <span>By: {announcement.author} ({announcement.author_role})</span>
                                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}