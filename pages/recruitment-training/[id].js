import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { api } from '../../services/api'
import { canAccessRT, hasRTFullControl, STATUS_LABELS, STATUS_COLORS } from '../../lib/rtPermissions'

const NEXT_STATUS_OPTIONS = {
    intending: ['called_for_interview', 'not_reachable', 'dropped'],
    called_for_interview: ['interviewed', 'not_reachable', 'dropped'],
    not_reachable: ['called_for_interview', 'dropped'],
    interviewed: ['training', 'dropped'],
    training: ['deployed', 'dropped'],
    deployed: [],
    dropped: ['intending'],
}

export default function RecruitDetailPage() {
    const router = useRouter()
    const { id } = router.query
    const [member, setMember] = useState(null)
    const [recruit, setRecruit] = useState(null)
    const [history, setHistory] = useState([])
    const [batches, setBatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showStatusForm, setShowStatusForm] = useState(null) // status being set, or null
    const [notes, setNotes] = useState('')
    const [reason, setReason] = useState('')
    const [batchId, setBatchId] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) { router.push('/'); return }
        const m = JSON.parse(stored)
        if (!canAccessRT(m)) { router.push('/dashboard'); return }
        setMember(m)
    }, [router])

    const fetchRecruit = useCallback(async () => {
        if (!member || !id) return
        setLoading(true)
        const data = await api.getRecruit(member.id, id)
        if (data.success) {
            setRecruit(data.recruit)
            setHistory(data.status_history)
        } else {
            setError(data.message || 'Recruit not found')
        }
        setLoading(false)
    }, [member, id])

    useEffect(() => { fetchRecruit() }, [fetchRecruit])

    useEffect(() => {
        if (!member) return
        api.getBatches(member.id).then((d) => { if (d.success) setBatches(d.batches) })
    }, [member])

    const submitStatusChange = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        const extra = {}
        if (notes) extra.notes = notes
        if (reason) extra.reason = reason
        if (showStatusForm === 'training' && batchId) extra.training_batch_id = batchId

        const data = await api.updateRecruitStatus(member.id, id, showStatusForm, extra)
        if (data.success) {
            setShowStatusForm(null)
            setNotes(''); setReason(''); setBatchId('')
            fetchRecruit()
        } else {
            setError(data.message || 'Failed to update status')
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        if (!confirm(`Delete ${recruit.full_name}? This cannot be undone.`)) return
        const data = await api.deleteRecruit(member.id, id)
        if (data.success) {
            router.push('/recruitment-training')
        } else {
            setError(data.message || 'Failed to delete')
        }
    }

    if (!member || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
    if (error && !recruit) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
    if (!recruit) return null

    const nextOptions = NEXT_STATUS_OPTIONS[recruit.status] || []

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-red-700 text-white p-4">
                <button onClick={() => router.push('/recruitment-training')} className="text-red-200 text-sm mb-1">← Back to list</button>
                <h1 className="text-xl font-bold">{recruit.full_name}</h1>
                <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[recruit.status]}`}>
                    {STATUS_LABELS[recruit.status]}
                </span>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">{error}</div>}

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="font-semibold text-gray-800 mb-3">Details</h2>
                    <dl className="grid grid-cols-2 gap-y-2 text-sm">
                        <dt className="text-gray-500">Phone</dt><dd>{recruit.phone_number}</dd>
                        <dt className="text-gray-500">Command</dt><dd>{recruit.command_name || '-'}</dd>
                        <dt className="text-gray-500">Batch</dt><dd>{recruit.batch_name || '-'}</dd>
                        <dt className="text-gray-500">Added</dt><dd>{new Date(recruit.created_at).toLocaleDateString()}</dd>
                        {recruit.email && <><dt className="text-gray-500">Email</dt><dd>{recruit.email}</dd></>}
                        {recruit.address && <><dt className="text-gray-500">Address</dt><dd>{recruit.address}</dd></>}
                        {recruit.notes && <><dt className="text-gray-500">Notes</dt><dd>{recruit.notes}</dd></>}
                    </dl>
                </div>

                {nextOptions.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h2 className="font-semibold text-gray-800 mb-3">Move to next stage</h2>
                        <div className="flex flex-wrap gap-2">
                            {nextOptions.map((s) => (
                                <button key={s} onClick={() => setShowStatusForm(s)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${STATUS_COLORS[s]}`}>
                                    {STATUS_LABELS[s]}
                                </button>
                            ))}
                        </div>

                        {showStatusForm && (
                            <form onSubmit={submitStatusChange} className="mt-4 border-t pt-4 space-y-3">
                                <p className="text-sm font-medium">Set status to: {STATUS_LABELS[showStatusForm]}</p>
                                {showStatusForm === 'training' && (
                                    <select value={batchId} onChange={(e) => setBatchId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">No batch (assign later)</option>
                                        {batches.map((b) => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
                                    </select>
                                )}
                                {showStatusForm === 'dropped' && (
                                    <input value={reason} onChange={(e) => setReason(e.target.value)}
                                        placeholder="Reason for dropping (required for reporting)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                )}
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Notes (optional)" rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                <div className="flex gap-2">
                                    <button type="submit" disabled={saving}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                                        {saving ? 'Saving...' : 'Confirm'}
                                    </button>
                                    <button type="button" onClick={() => setShowStatusForm(null)}
                                        className="px-4 py-2 rounded-lg text-sm text-gray-500">Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="font-semibold text-gray-800 mb-3">Status History</h2>
                    {history.length === 0 ? (
                        <p className="text-sm text-gray-400">No history yet</p>
                    ) : (
                        <div className="space-y-2">
                            {history.map((h, i) => (
                                <div key={i} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                                    <p>{h.old_status ? `${STATUS_LABELS[h.old_status] || h.old_status} → ` : ''}{STATUS_LABELS[h.new_status] || h.new_status}</p>
                                    {h.notes && <p className="text-gray-500 text-xs">{h.notes}</p>}
                                    <p className="text-gray-400 text-xs">{new Date(h.changed_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {hasRTFullControl(member) && (
                    <button onClick={handleDelete} className="text-red-600 text-sm font-medium">Delete Recruit</button>
                )}
            </div>
        </div>
    )
}
