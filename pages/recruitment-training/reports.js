import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '../../services/api'
import { canAccessRT, STATUS_LABELS } from '../../lib/rtPermissions'

export default function ReportsPage() {
    const router = useRouter()
    const [member, setMember] = useState(null)
    const [reportType, setReportType] = useState('monthly')
    const [periodStart, setPeriodStart] = useState('')
    const [periodEnd, setPeriodEnd] = useState('')
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) { router.push('/'); return }
        const m = JSON.parse(stored)
        if (!canAccessRT(m)) { router.push('/dashboard'); return }
        setMember(m)

        // default period: this month
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        setPeriodStart(start.toISOString().slice(0, 10))
        setPeriodEnd(now.toISOString().slice(0, 10))
    }, [router])

    const handleGenerate = async (e) => {
        e.preventDefault()
        setError('')
        setGenerating(true)
        const data = await api.generateReport(member.id, { report_type: reportType, period_start: periodStart, period_end: periodEnd })
        if (data.success) {
            setResult(data.data)
        } else {
            setError(data.message || 'Failed to generate report')
        }
        setGenerating(false)
    }

    if (!member) return null

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-red-700 text-white p-4">
                <button onClick={() => router.push('/recruitment-training')} className="text-red-200 text-sm mb-1">← Back</button>
                <h1 className="text-xl font-bold">Reports</h1>
            </div>

            <div className="max-w-2xl mx-auto p-4">
                <form onSubmit={handleGenerate} className="bg-white rounded-lg shadow-sm p-4 mb-4 space-y-3">
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">From</label>
                            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">To</label>
                            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                    <button type="submit" disabled={generating} className="w-full bg-red-600 text-white py-2 rounded-lg font-medium disabled:opacity-50">
                        {generating ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                {result && (
                    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">New recruits this period</p>
                            <p className="text-2xl font-bold">{result.new_recruits}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Status breakdown</p>
                            <div className="space-y-1">
                                {result.status_breakdown.map((s) => (
                                    <div key={s.status} className="flex justify-between text-sm">
                                        <span>{STATUS_LABELS[s.status] || s.status}</span>
                                        <span className="font-medium">{s.count}</span>
                                    </div>
                                ))}
                                {result.status_breakdown.length === 0 && <p className="text-gray-400 text-sm">No data for this period</p>}
                            </div>
                        </div>
                        {result.dropout_breakdown.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Dropouts by stage</p>
                                <div className="space-y-1">
                                    {result.dropout_breakdown.map((d) => (
                                        <div key={d.stage} className="flex justify-between text-sm">
                                            <span>{d.stage.replace(/_/g, ' ')}</span>
                                            <span className="font-medium">{d.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
