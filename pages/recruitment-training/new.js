import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '../../services/api'
import { canAccessRT } from '../../lib/rtPermissions'

export default function NewRecruitPage() {
    const router = useRouter()
    const [member, setMember] = useState(null)
    const [commands, setCommands] = useState([])
    const [form, setForm] = useState({ full_name: '', phone_number: '', command_id: '', email: '', address: '', notes: '' })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) { router.push('/'); return }
        const m = JSON.parse(stored)
        if (!canAccessRT(m)) { router.push('/dashboard'); return }
        setMember(m)
        api.getCommandsWithIds().then((d) => { if (d.success) setCommands(d.commands) })
    }, [router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.full_name.trim() || !form.phone_number.trim() || !form.command_id) {
            setError('Name, phone number, and command are required')
            return
        }
        setSaving(true)
        const data = await api.createRecruit(member.id, form)
        if (data.success) {
            router.push(`/recruitment-training/${data.id}`)
        } else {
            setError(data.message || 'Failed to add recruit')
        }
        setSaving(false)
    }

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    if (!member) return null

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-red-700 text-white p-4">
                <button onClick={() => router.push('/recruitment-training')} className="text-red-200 text-sm mb-1">← Back</button>
                <h1 className="text-xl font-bold">Add Recruit</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input value={form.full_name} onChange={set('full_name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input value={form.phone_number} onChange={set('phone_number')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Command *</label>
                    <select value={form.command_id} onChange={set('command_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Select command</option>
                        {commands.map((c) => <option key={c.id} value={c.id}>{c.command_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input value={form.email} onChange={set('email')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input value={form.address} onChange={set('address')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea value={form.notes} onChange={set('notes')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>

                <button type="submit" disabled={saving} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
                    {saving ? 'Saving...' : 'Add Recruit'}
                </button>
            </form>
        </div>
    )
}
