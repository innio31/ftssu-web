import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { api } from '../../services/api'
import { canAccessRT } from '../../lib/rtPermissions'

export default function BatchesPage() {
    const router = useRouter()
    const [member, setMember] = useState(null)
    const [batches, setBatches] = useState([])
    const [showNewForm, setShowNewForm] = useState(false)
    const [newBatch, setNewBatch] = useState({ batch_name: '', batch_code: '', start_date: '', end_date: '', trainer_name: '', location: '' })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    // attendance marking state
    const [attendanceBatch, setAttendanceBatch] = useState(null)
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10))
    const [attendanceRecruits, setAttendanceRecruits] = useState([])
    const [attendanceStatuses, setAttendanceStatuses] = useState({})

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) { router.push('/'); return }
        const m = JSON.parse(stored)
        if (!canAccessRT(m)) { router.push('/dashboard'); return }
        setMember(m)
    }, [router])

    const fetchBatches = useCallback(async () => {
        if (!member) return
        const data = await api.getBatches(member.id)
        if (data.success) setBatches(data.batches)
    }, [member])

    useEffect(() => { fetchBatches() }, [fetchBatches])

    const handleCreateBatch = async (e) => {
        e.preventDefault()
        setError('')
        if (!newBatch.batch_name || !newBatch.batch_code || !newBatch.start_date) {
            setError('Batch name, code, and start date are required')
            return
        }
        setSaving(true)
        const data = await api.createBatch(member.id, newBatch)
        if (data.success) {
            setShowNewForm(false)
            setNewBatch({ batch_name: '', batch_code: '', start_date: '', end_date: '', trainer_name: '', location: '' })
            fetchBatches()
        } else {
            setError(data.message || 'Failed to create batch')
        }
        setSaving(false)
    }

    const openAttendance = async (batch) => {
        setAttendanceBatch(batch)
        const data = await api.getRecruits(member.id, { batch_id: batch.id, limit: 200 })
        if (data.success) {
            setAttendanceRecruits(data.recruits)
            const init = {}
            data.recruits.forEach((r) => { init[r.id] = 'present' })
            setAttendanceStatuses(init)
        }
    }

    const submitAttendance = async () => {
        const entries = attendanceRecruits.map((r) => ({ recruit_id: r.id, status: attendanceStatuses[r.id] || 'present' }))
        const data = await api.markAttendance(member.id, attendanceBatch.id, attendanceDate, entries)
        if (data.success) {
            setAttendanceBatch(null)
            alert(data.message)
        } else {
            alert(data.message || 'Failed to save attendance')
        }
    }

    const set = (field) => (e) => setNewBatch({ ...newBatch, [field]: e.target.value })

    if (!member) return null

    if (attendanceBatch) {
        return (
            <div className="min-h-screen bg-gray-50 pb-8">
                <div className="bg-red-700 text-white p-4">
                    <button onClick={() => setAttendanceBatch(null)} className="text-red-200 text-sm mb-1">← Cancel</button>
                    <h1 className="text-xl font-bold">Attendance: {attendanceBatch.batch_name}</h1>
                </div>
                <div className="max-w-lg mx-auto p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />

                    <div className="space-y-2">
                        {attendanceRecruits.map((r) => (
                            <div key={r.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
                                <span className="font-medium text-sm">{r.full_name}</span>
                                <select value={attendanceStatuses[r.id]} onChange={(e) => setAttendanceStatuses({ ...attendanceStatuses, [r.id]: e.target.value })}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm">
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="excused">Excused</option>
                                </select>
                            </div>
                        ))}
                        {attendanceRecruits.length === 0 && <p className="text-gray-400 text-sm">No recruits in this batch yet</p>}
                    </div>

                    {attendanceRecruits.length > 0 && (
                        <button onClick={submitAttendance} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold mt-4">
                            Save Attendance
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-red-700 text-white p-4">
                <button onClick={() => router.push('/recruitment-training')} className="text-red-200 text-sm mb-1">← Back</button>
                <h1 className="text-xl font-bold">Training Batches</h1>
            </div>

            <div className="max-w-2xl mx-auto p-4">
                <button onClick={() => setShowNewForm(!showNewForm)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium mb-4">
                    {showNewForm ? 'Cancel' : '+ New Batch'}
                </button>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                {showNewForm && (
                    <form onSubmit={handleCreateBatch} className="bg-white rounded-lg shadow-sm p-4 mb-4 space-y-3">
                        <input value={newBatch.batch_name} onChange={set('batch_name')} placeholder="Batch name *" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        <input value={newBatch.batch_code} onChange={set('batch_code')} placeholder="Batch code (unique) *" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        <div className="flex gap-2">
                            <input type="date" value={newBatch.start_date} onChange={set('start_date')} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="date" value={newBatch.end_date} onChange={set('end_date')} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <input value={newBatch.trainer_name} onChange={set('trainer_name')} placeholder="Trainer name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        <input value={newBatch.location} onChange={set('location')} placeholder="Location" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        <button type="submit" disabled={saving} className="w-full bg-red-600 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                            {saving ? 'Creating...' : 'Create Batch'}
                        </button>
                    </form>
                )}

                <div className="space-y-2">
                    {batches.map((b) => (
                        <div key={b.id} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{b.batch_name}</p>
                                    <p className="text-sm text-gray-500">{b.batch_code} · {b.recruit_count} recruit(s) · {b.status}</p>
                                    {b.trainer_name && <p className="text-xs text-gray-400">Trainer: {b.trainer_name}</p>}
                                </div>
                                <button onClick={() => openAttendance(b)} className="text-sm text-red-600 font-medium">Attendance</button>
                            </div>
                        </div>
                    ))}
                    {batches.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No batches yet</p>}
                </div>
            </div>
        </div>
    )
}
