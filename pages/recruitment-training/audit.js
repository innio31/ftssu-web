import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '../../services/api'
import { hasRTFullControl } from '../../lib/rtPermissions'

export default function AuditLogPage() {
    const router = useRouter()
    const [member, setMember] = useState(null)
    const [log, setLog] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) { router.push('/'); return }
        const m = JSON.parse(stored)
        if (!hasRTFullControl(m)) { router.push('/recruitment-training'); return }
        setMember(m)
    }, [router])

    useEffect(() => {
        if (!member) return
        api.getAuditLog(member.id).then((data) => {
            if (data.success) setLog(data.audit_log)
            else setError(data.message || 'Failed to load audit log')
            setLoading(false)
        })
    }, [member])

    if (!member) return null

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-red-700 text-white p-4">
                <button onClick={() => router.push('/recruitment-training')} className="text-red-200 text-sm mb-1">← Back</button>
                <h1 className="text-xl font-bold">Audit Log</h1>
            </div>

            <div className="max-w-2xl mx-auto p-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
                {loading ? (
                    <p className="text-gray-400 text-center py-8">Loading...</p>
                ) : (
                    <div className="space-y-2">
                        {log.map((entry) => (
                            <div key={entry.id} className="bg-white rounded-lg shadow-sm p-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-medium">{entry.action}</span>
                                    <span className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">{entry.description}</p>
                                <p className="text-gray-400 text-xs mt-1">{entry.user_name || 'Unknown'} ({entry.user_role || '-'})</p>
                            </div>
                        ))}
                        {log.length === 0 && <p className="text-gray-400 text-center py-8">No audit entries yet</p>}
                    </div>
                )}
            </div>
        </div>
    )
}
