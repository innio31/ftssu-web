import React, { useState, useEffect } from 'react'
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

    // All commands list for filtering
    const commands = [
        'All', 'UPPER ROOM', 'GOSHEN', 'YOUTH', 'OPERATION', 'HONOUR', 'G & G',
        'SPECIAL DUTY 1', 'SPECIAL DUTY 2', 'SPECIAL DUTY 3', 'SPECIAL DUTY 4', 'SPECIAL DUTY 5',
        'VETERAN', 'KHMS', 'COVENANT DAY', 'RECRUITMENT & TRAINING', 'SID', 'PATROL',
        'IID', 'FORENSIC', 'FRENCH', 'VISION 1', 'VISION 2', 'VISION 3', 'SECURITY MEDICAL', 'SALES MONITORING'
    ]

    useEffect(() => {
        if (isOpen) {
            loadServices()
        }
    }, [isOpen])

    // Refresh services when modal opens and periodically
    useEffect(() => {
        if (!isOpen) return
        loadServices()
        const interval = setInterval(loadServices, 30000) // Refresh every 30 seconds
        return () => clearInterval(interval)
    }, [isOpen])

    const loadServices = async () => {
        setLoadingServices(true)
        try {
            // Add cache-busting timestamp
            const response = await fetch(`/api/get_services.php?_=${Date.now()}`)
            const data = await response.json()
            if (data.success) {
                // Sort services by date (newest first)
                const sortedServices = (data.services || []).sort((a, b) =>
                    new Date(b.service_date) - new Date(a.service_date)
                )
                setServices(sortedServices)

                // If there was a selected service, try to find it in the new data
                if (selectedService) {
                    const updatedService = sortedServices.find(s => s.id === selectedService.id)
                    if (updatedService) {
                        setSelectedService(updatedService)
                    }
                }
            }
        } catch (error) {
            console.error('Error loading services:', error)
        }
        setLoadingServices(false)
    }

    const loadAttendanceReport = async () => {
        if (!selectedService) {
            alert('Please select a service first')
            return
        }

        setLoading(true)
        setAttendance([])
        setAbsentees([])
        try {
            let url = `/api/get_attendance_report.php?service_id=${selectedService.id}&_=${Date.now()}`
            if (filter.command && filter.command !== 'All') {
                url += `&command=${encodeURIComponent(filter.command)}`
            }
            if (filter.date) {
                url += `&date=${filter.date}`
            }

            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                setAttendance(data.attendance || [])
                // Store absentees data if provided by API
                if (data.absentees) {
                    setAbsentees(data.absentees)
                } else {
                    // If API doesn't provide absentees, we'll need to fetch them separately
                    await loadAbsentees()
                }
            } else {
                alert(data.message || 'Failed to load attendance report')
            }
        } catch (error) {
            console.error('Error loading attendance:', error)
            alert('Network error. Please try again.')
        }
        setLoading(false)
    }

    const loadAbsentees = async () => {
        if (!selectedService) return

        try {
            let url = `/api/get_absentees.php?service_id=${selectedService.id}&_=${Date.now()}`
            if (filter.command && filter.command !== 'All') {
                url += `&command=${encodeURIComponent(filter.command)}`
            }

            const response = await fetch(url)
            const data = await response.json()
            if (data.success) {
                setAbsentees(data.absentees || [])
            }
        } catch (error) {
            console.error('Error loading absentees:', error)
        }
    }

    const exportToExcel = () => {
        if (attendance.length === 0 && absentees.length === 0) {
            alert('No data to export')
            return
        }

        const wb = XLSX.utils.book_new()

        // Export attendance sheet
        if (attendance.length > 0) {
            const attendanceData = attendance.map(a => ({
                'Date': a.service_date,
                'Service': a.service_name,
                'ID Number': a.id_number,
                'Name': `${a.first_name} ${a.last_name}`,
                'Command': a.command,
                'Designation': a.designation,
                'Method': a.attendance_method === 'self_scan' ? 'Self Check-in' : 'Manual Entry',
                'Time': new Date(a.attendance_time).toLocaleTimeString()
            }))
            const ws1 = XLSX.utils.json_to_sheet(attendanceData)
            XLSX.utils.book_append_sheet(wb, ws1, 'Present Members')
        }

        // Export absentees sheet
        if (absentees.length > 0) {
            const absenteesData = absentees.map(a => ({
                'ID Number': a.id_number,
                'Name': `${a.first_name} ${a.last_name}`,
                'Command': a.command,
                'Designation': a.designation,
                'Role': a.role,
                'Phone': a.phone_number || 'N/A'
            }))
            const ws2 = XLSX.utils.json_to_sheet(absenteesData)
            XLSX.utils.book_append_sheet(wb, ws2, 'Absent Members')
        }

        XLSX.writeFile(wb, `attendance_report_${selectedService?.service_name}_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const getAttendanceStats = () => {
        const totalMembers = attendance.length + absentees.length
        const presentCount = attendance.length
        const absentCount = absentees.length
        const percentage = totalMembers > 0 ? ((presentCount / totalMembers) * 100).toFixed(1) : 0

        return { totalMembers, presentCount, absentCount, percentage }
    }

    const handleServiceSelect = (serviceId) => {
        const service = services.find(s => s.id === parseInt(serviceId))
        setSelectedService(service || null)
        setAttendance([])
        setAbsentees([])
        setShowAbsentees(false)
    }

    if (!isOpen) return null

    const stats = getAttendanceStats()

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">📊 Attendance Report</h2>
                    <button onClick={onClose} className="text-gray-500 text-2xl hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <div className="p-4 border-b space-y-3">
                    {/* Service Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Select Service <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={selectedService?.id || ''}
                                onChange={(e) => handleServiceSelect(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Choose a service...</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.service_name} - {service.service_date}
                                        {service.is_active == 1 ? ' (Active)' : ' (Closed)'}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={loadServices}
                                disabled={loadingServices}
                                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                title="Refresh services"
                            >
                                🔄
                            </button>
                        </div>
                        {loadingServices && (
                            <p className="text-xs text-gray-400 mt-1">Loading services...</p>
                        )}
                    </div>

                    {/* Filters */}
                    {selectedService && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Command</label>
                                <select
                                    value={filter.command}
                                    onChange={(e) => setFilter({ ...filter, command: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    {commands.map(cmd => (
                                        <option key={cmd} value={cmd}>{cmd}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Date (Optional)</label>
                                <input
                                    type="date"
                                    value={filter.date}
                                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {selectedService && (
                        <div className="flex gap-3">
                            <button
                                onClick={loadAttendanceReport}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'Load Report'}
                            </button>
                            {(attendance.length > 0 || absentees.length > 0) && (
                                <button
                                    onClick={exportToExcel}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    📊 Export to Excel
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading report...</p>
                        </div>
                    ) : !selectedService ? (
                        <div className="text-center py-8 text-gray-500">
                            Select a service to view attendance report
                        </div>
                    ) : attendance.length === 0 && absentees.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No attendance records found for this service
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-blue-600">{stats.totalMembers}</p>
                                    <p className="text-xs text-gray-500">Total Members</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-green-600">{stats.presentCount}</p>
                                    <p className="text-xs text-gray-500">Present</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-red-600">{stats.absentCount}</p>
                                    <p className="text-xs text-gray-500">Absent</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-purple-600">{stats.percentage}%</p>
                                    <p className="text-xs text-gray-500">Attendance Rate</p>
                                </div>
                            </div>

                            {/* Tab Buttons */}
                            <div className="flex gap-2 border-b">
                                <button
                                    onClick={() => setShowAbsentees(false)}
                                    className={`px-4 py-2 font-semibold transition ${!showAbsentees
                                        ? 'border-b-2 border-red-600 text-red-600'
                                        : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Present ({attendance.length})
                                </button>
                                <button
                                    onClick={() => setShowAbsentees(true)}
                                    className={`px-4 py-2 font-semibold transition ${showAbsentees
                                        ? 'border-b-2 border-red-600 text-red-600'
                                        : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Absent ({absentees.length})
                                </button>
                            </div>

                            {/* Present Members Table */}
                            {!showAbsentees && attendance.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left">S/N</th>
                                                <th className="px-4 py-2 text-left">ID Number</th>
                                                <th className="px-4 py-2 text-left">Name</th>
                                                <th className="px-4 py-2 text-left">Command</th>
                                                <th className="px-4 py-2 text-left">Designation</th>
                                                <th className="px-4 py-2 text-left">Method</th>
                                                <th className="px-4 py-2 text-left">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendance.map((record, idx) => (
                                                <tr key={idx} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2">{idx + 1}</td>
                                                    <td className="px-4 py-2 font-mono text-xs">{record.id_number}</td>
                                                    <td className="px-4 py-2 font-medium">{record.first_name} {record.last_name}</td>
                                                    <td className="px-4 py-2">{record.command}</td>
                                                    <td className="px-4 py-2">{record.designation}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${record.attendance_method === 'self_scan'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {record.attendance_method === 'self_scan' ? 'Self Check-in' : 'Manual Entry'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-xs">{new Date(record.attendance_time).toLocaleTimeString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Present Members Empty State */}
                            {!showAbsentees && attendance.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No present members found
                                </div>
                            )}

                            {/* Absent Members Table */}
                            {showAbsentees && absentees.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left">S/N</th>
                                                <th className="px-4 py-2 text-left">ID Number</th>
                                                <th className="px-4 py-2 text-left">Name</th>
                                                <th className="px-4 py-2 text-left">Command</th>
                                                <th className="px-4 py-2 text-left">Designation</th>
                                                <th className="px-4 py-2 text-left">Role</th>
                                                <th className="px-4 py-2 text-left">Phone</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {absentees.map((record, idx) => (
                                                <tr key={idx} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2">{idx + 1}</td>
                                                    <td className="px-4 py-2 font-mono text-xs">{record.id_number}</td>
                                                    <td className="px-4 py-2 font-medium">{record.first_name} {record.last_name}</td>
                                                    <td className="px-4 py-2">{record.command}</td>
                                                    <td className="px-4 py-2">{record.designation}</td>
                                                    <td className="px-4 py-2">{record.role}</td>
                                                    <td className="px-4 py-2">{record.phone_number || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Absent Members Empty State */}
                            {showAbsentees && absentees.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No absent members found - Perfect attendance! 🎉
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}