import React, { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'

export default function AttendanceReportModal({ isOpen, onClose, member }) {
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState(null)
    const [attendance, setAttendance] = useState([])
    const [absentees, setAbsentees] = useState([])
    const [loading, setLoading] = useState(false)
    const [showAbsentees, setShowAbsentees] = useState(false)
    const [filter, setFilter] = useState({ command: 'All', date: '' })
    const [loadingServices, setLoadingServices] = useState(false)

    // FIX: use a ref to track if already loaded — prevents double-load race condition
    const hasLoaded = useRef(false)

    const commands = [
        'All', 'UPPER ROOM', 'GOSHEN', 'YOUTH', 'OPERATION', 'HONOUR', 'G & G',
        'SPECIAL DUTY 1', 'SPECIAL DUTY 2', 'SPECIAL DUTY 3', 'SPECIAL DUTY 4', 'SPECIAL DUTY 5',
        'VETERAN', 'KHMS', 'COVENANT DAY', 'RECRUITMENT & TRAINING', 'SID', 'PATROL',
        'IID', 'FORENSIC', 'FRENCH', 'VISION 1', 'VISION 2', 'VISION 3',
        'SECURITY MEDICAL', 'SALES MONITORING',
        ...Array.from({ length: 22 }, (_, i) => `COMMAND ${i + 1}`)
    ]

    // FIX: single useEffect, no race condition
    useEffect(() => {
        if (isOpen && !hasLoaded.current) {
            hasLoaded.current = true
            loadServices()
        }
        if (!isOpen) {
            hasLoaded.current = false
        }
    }, [isOpen])

    const loadServices = async () => {
        setLoadingServices(true)
        try {
            const response = await fetch(`/api/get_services.php?_=${Date.now()}`)
            const data = await response.json()
            if (data.success) {
                const sorted = (data.services || []).sort((a, b) =>
                    new Date(b.service_date) - new Date(a.service_date)
                )
                setServices(sorted)
                console.log('[ReportModal] Services loaded:', sorted.length, sorted.map(s => ({ id: s.id, type: typeof s.id })))

                // Re-sync selectedService if it exists
                if (selectedService) {
                    const updated = sorted.find(s => String(s.id) === String(selectedService.id))
                    if (!updated) {
                        setSelectedService(null)
                        setAttendance([])
                        setAbsentees([])
                    }
                }
            }
        } catch (err) {
            console.error('[ReportModal] Load services failed:', err)
        }
        setLoadingServices(false)
    }

    // FIX: compare as strings — avoids int/string mismatch from API
    const handleServiceSelect = (e) => {
        const val = e.target.value
        console.log('[ReportModal] Dropdown changed to:', val)
        setAttendance([])
        setAbsentees([])
        setShowAbsentees(false)

        if (!val) {
            setSelectedService(null)
            return
        }

        const found = services.find(s => String(s.id) === String(val))
        console.log('[ReportModal] Matched service:', found)
        setSelectedService(found || null)
    }

    const clearSelection = () => {
        setSelectedService(null)
        setAttendance([])
        setAbsentees([])
        setShowAbsentees(false)
    }

    const loadAttendanceReport = async () => {
        if (!selectedService) { alert('Please select a service first'); return }

        setLoading(true)
        setAttendance([])
        setAbsentees([])
        try {
            let url = `/api/get_attendance_report.php?service_id=${selectedService.id}&_=${Date.now()}`
            if (filter.command && filter.command !== 'All')
                url += `&command=${encodeURIComponent(filter.command)}`
            if (filter.date)
                url += `&date=${filter.date}`

            const res = await fetch(url)
            const data = await res.json()

            if (data.success) {
                setAttendance(data.attendance || [])
                await loadAbsentees()
            } else {
                alert(data.message || 'Failed to load attendance report')
            }
        } catch (err) {
            console.error('[ReportModal] Load report failed:', err)
            alert('Network error. Please try again.')
        }
        setLoading(false)
    }

    const loadAbsentees = async () => {
        if (!selectedService) return
        try {
            let url = `/api/get_absentees.php?service_id=${selectedService.id}&_=${Date.now()}`
            if (filter.command && filter.command !== 'All')
                url += `&command=${encodeURIComponent(filter.command)}`

            const res = await fetch(url)
            const data = await res.json()
            if (data.success) setAbsentees(data.absentees || [])
        } catch (err) {
            console.error('[ReportModal] Load absentees failed:', err)
        }
    }

    const exportToExcel = () => {
        if (attendance.length === 0 && absentees.length === 0) { alert('No data to export'); return }
        const wb = XLSX.utils.book_new()

        if (attendance.length > 0) {
            const ws1 = XLSX.utils.json_to_sheet(attendance.map((a, i) => ({
                'S/N': i + 1,
                'Date': a.service_date,
                'Service': a.service_name,
                'ID Number': a.id_number,
                'Name': `${a.first_name} ${a.last_name}`,
                'Command': a.command,
                'Designation': a.designation,
                'Method': a.attendance_method === 'self_scan' ? 'Self Check-in' : 'Manual Entry',
                'Time': new Date(a.attendance_time).toLocaleTimeString()
            })))
            XLSX.utils.book_append_sheet(wb, ws1, 'Present Members')
        }

        if (absentees.length > 0) {
            const ws2 = XLSX.utils.json_to_sheet(absentees.map((a, i) => ({
                'S/N': i + 1,
                'ID Number': a.id_number,
                'Name': `${a.first_name} ${a.last_name}`,
                'Command': a.command,
                'Designation': a.designation,
                'Role': a.role,
                'Phone': a.phone_number || 'N/A'
            })))
            XLSX.utils.book_append_sheet(wb, ws2, 'Absent Members')
        }

        XLSX.writeFile(wb, `attendance_${selectedService?.service_name}_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const getStats = () => {
        const total = attendance.length + absentees.length
        const present = attendance.length
        const absent = absentees.length
        const pct = total > 0 ? ((present / total) * 100).toFixed(1) : 0
        return { total, present, absent, pct }
    }

    if (!isOpen) return null
    const stats = getStats()

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}>
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">📊 Attendance Report</h2>
                    <button onClick={onClose} className="text-gray-500 text-2xl hover:text-gray-700">&times;</button>
                </div>

                {/* Controls */}
                <div className="p-4 border-b space-y-3">
                    {/* Service selector */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Select Service <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={selectedService ? String(selectedService.id) : ''}
                                onChange={handleServiceSelect}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">-- Choose a service --</option>
                                {services.map(s => (
                                    <option key={s.id} value={String(s.id)}>
                                        {s.service_name} — {s.service_date}
                                        {s.is_active == 1 ? ' ✓ Active' : ' ✗ Closed'}
                                    </option>
                                ))}
                            </select>
                            <button onClick={loadServices} disabled={loadingServices}
                                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                title="Refresh">
                                {loadingServices ? '⟳' : '🔄'}
                            </button>
                            {selectedService && (
                                <button onClick={clearSelection}
                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                    title="Clear">✕</button>
                            )}
                        </div>
                        {loadingServices && <p className="text-xs text-gray-400 mt-1">Loading services...</p>}
                        {selectedService && (
                            <p className="text-xs text-green-600 mt-1">
                                ✅ Selected: <strong>{selectedService.service_name}</strong> — {selectedService.service_date}
                            </p>
                        )}
                    </div>

                    {/* Filters + load button — only when service selected */}
                    {selectedService && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Command</label>
                                    <select value={filter.command}
                                        onChange={e => setFilter({ ...filter, command: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                                        {commands.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Date (Optional)</label>
                                    <input type="date" value={filter.date}
                                        onChange={e => setFilter({ ...filter, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={loadAttendanceReport} disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                                    {loading ? 'Loading...' : 'Load Report'}
                                </button>
                                {(attendance.length > 0 || absentees.length > 0) && (
                                    <button onClick={exportToExcel}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        📊 Export to Excel
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {!selectedService ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-6xl mb-4">📅</div>
                            <p className="text-lg font-medium">Select a service to view attendance report</p>
                            <p className="text-sm mt-2">Choose from the dropdown above</p>
                        </div>
                    ) : loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                            <p className="text-gray-500 mt-2">Loading report...</p>
                        </div>
                    ) : attendance.length === 0 && absentees.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-lg font-medium">No records found</p>
                            <button onClick={loadAttendanceReport}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Members', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Present', value: stats.present, color: 'text-green-600', bg: 'bg-green-50' },
                                    { label: 'Absent', value: stats.absent, color: 'text-red-600', bg: 'bg-red-50' },
                                    { label: 'Attendance %', value: `${stats.pct}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
                                ].map(s => (
                                    <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-gray-500">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 border-b">
                                <button onClick={() => setShowAbsentees(false)}
                                    className={`px-4 py-2 font-semibold transition ${!showAbsentees ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}>
                                    ✓ Present ({attendance.length})
                                </button>
                                <button onClick={() => setShowAbsentees(true)}
                                    className={`px-4 py-2 font-semibold transition ${showAbsentees ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}>
                                    ✗ Absent ({absentees.length})
                                </button>
                            </div>

                            {/* Present table */}
                            {!showAbsentees && attendance.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {['S/N', 'ID Number', 'Name', 'Command', 'Designation', 'Method', 'Time'].map(h => (
                                                    <th key={h} className="px-4 py-2 text-left">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendance.map((r, i) => (
                                                <tr key={i} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2">{i + 1}</td>
                                                    <td className="px-4 py-2 font-mono text-xs">{r.id_number}</td>
                                                    <td className="px-4 py-2 font-medium">{r.first_name} {r.last_name}</td>
                                                    <td className="px-4 py-2">{r.command}</td>
                                                    <td className="px-4 py-2">{r.designation}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${r.attendance_method === 'self_scan' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                            {r.attendance_method === 'self_scan' ? 'Self Check-in' : 'Manual Entry'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-xs">{new Date(r.attendance_time).toLocaleTimeString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {!showAbsentees && attendance.length === 0 && (
                                <p className="text-center py-8 text-gray-500">No present members found</p>
                            )}

                            {/* Absent table */}
                            {showAbsentees && absentees.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {['S/N', 'ID Number', 'Name', 'Command', 'Designation', 'Role', 'Phone'].map(h => (
                                                    <th key={h} className="px-4 py-2 text-left">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {absentees.map((r, i) => (
                                                <tr key={i} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2">{i + 1}</td>
                                                    <td className="px-4 py-2 font-mono text-xs">{r.id_number}</td>
                                                    <td className="px-4 py-2 font-medium">{r.first_name} {r.last_name}</td>
                                                    <td className="px-4 py-2">{r.command}</td>
                                                    <td className="px-4 py-2">{r.designation}</td>
                                                    <td className="px-4 py-2">{r.role}</td>
                                                    <td className="px-4 py-2">{r.phone_number || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {showAbsentees && absentees.length === 0 && (
                                <p className="text-center py-8 text-gray-500">🎉 Perfect attendance — no absentees!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}