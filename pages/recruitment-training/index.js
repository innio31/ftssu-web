import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { api } from '../../services/api'
import { canAccessRT, hasRTFullControl, STATUS_LABELS, STATUS_COLORS } from '../../lib/rtPermissions'

const STATUS_TABS = ['all', 'intending', 'called_for_interview', 'interviewed', 'not_reachable', 'training', 'deployed', 'dropped']

export default function RecruitmentTrainingPage() {
    const router = useRouter()
    const [member, setMember] = useState(null)
    const [recruits, setRecruits] = useState([])
    const [total, setTotal] = useState(0)
    const [status, setStatus] = useState('all')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) { router.push('/'); return }
        const m = JSON.parse(stored)
        if (!canAccessRT(m)) { router.push('/dashboard'); return }
        setMember(m)
    }, [router])

    const fetchRecruits = useCallback(async () => {
        if (!member) return
        setLoading(true)
        setError('')
        try {
            const filters = { limit: 50 }
            if (status !== 'all') filters.status = status
            if (search.trim()) filters.search = search.trim()
            const data = await api.getRecruits(member.id, filters)
            if (data.success) {
                setRecruits(data.recruits)
                setTotal(data.total)
            } else {
                setError(data.message || 'Failed to load recruits')
            }
        } catch (e) {
            setError('Network error loading recruits')
        }
        setLoading(false)
    }, [member, status, search])

    useEffect(() => { fetchRecruits() }, [fetchRecruits])

    if (!member) return null

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-red-700 text-white p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div>
                        <button onClick={() => router.push('/dashboard')} className="text-red-200 text-sm mb-1">← Dashboard</button>
                        <h1 className="text-xl font-bold">Recruitment & Training</h1>
                    </div>
                    <div className="flex gap-2">
                        {hasRTFullControl(member) && (
                            <button onClick={() => router.push('/recruitment-training/audit')}
                                className="bg-red-800 px-3 py-2 rounded-lg text-sm">Audit Log</button>
                        )}
                        <button onClick={() => router.push('/recruitment-training/batches')}
                            className="bg-red-800 px-3 py-2 rounded-lg text-sm">Batches</button>
                        <button onClick={() => router.push('/recruitment-training/reports')}
                            className="bg-red-800 px-3 py-2 rounded-lg text-sm">Reports</button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button onClick={() => router.push('/recruitment-training/new')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium">+ Add Recruit</button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {STATUS_TABS.map((s) => (
                        <button key={s} onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${status === s ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>
                            {s === 'all' ? 'All' : STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

                <p className="text-sm text-gray-500 mb-2">{total} recruit{total !== 1 ? 's' : ''}</p>

                {loading ? (
                    <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : recruits.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No recruits found</div>
                ) : (
                    <div className="space-y-2">
                        {recruits.map((r) => (
                            <button key={r.id} onClick={() => router.push(`/recruitment-training/${r.id}`)}
                                className="w-full bg-white rounded-lg shadow-sm p-4 flex items-center justify-between text-left hover:shadow-md transition">
                                <div>
                                    <p className="font-semibold text-gray-800">{r.full_name}</p>
                                    <p className="text-sm text-gray-500">{r.phone_number} · {r.command_name || 'No command'}</p>
                                    {r.batch_name && <p className="text-xs text-gray-400 mt-0.5">Batch: {r.batch_name}</p>}
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {STATUS_LABELS[r.status] || r.status}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
