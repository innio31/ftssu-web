import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

export default function AttendanceReportModal({ isOpen, onClose, member }) {
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState(null)
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState({ command: 'All', date: '' })

    useEffect(() => {
        if (isOpen) {
            loadServices()
        }
    }, [isOpen])

    const loadServices = async () => {
        try {
            const response = await fetch('/api/get_services.php')
            const data = await response.json()
            if (data.success) {
                setServices(data.services || [])
            }
        } catch (error) {
            console.error('Error loading services:', error)
        }
    }

    const loadAttendanceReport = async () => {
        if (!selectedService) return

        setLoading(true)
        try {
            let url = `/api/get_attendance_report.php?service_id=${selectedService.id}`
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
            }
        } catch (error) {
            console.error('Error loading attendance:', error)
            alert('Failed to load attendance report')
        }
        setLoading(false)
    }

    const exportToExcel = () => {
        if (attendance.length === 0) {
            alert('No data to export')
            return
        }

        const exportData = attendance.map(a => ({
            'Date': a.service_date,
            'Service': a.service_name,
            'ID Number': a.id_number,
            'Name': `${a.first_name} ${a.last_name}`,
            'Command': a.command,
            'Method': a.attendance_method === 'self_scan' ? 'Self Check-in' : 'Manual Entry',
            'Time': new Date(a.attendance_time).toLocaleTimeString()
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report')
        XLSX.writeFile(wb, `attendance_${selectedService?.service_name}_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Attendance Report</h2>
                    <button onClick={onClose} className="text-gray-500 text-2xl hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <div className="p-4 border-b space-y-3">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Service</label>
                        <select
                            value={selectedService?.id || ''}
                            onChange={(e) => {
                                const service = services.find(s => s.id === parseInt(e.target.value))
                                setSelectedService(service)
                                setAttendance([])
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="">Choose a service...</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.service_name} - {service.service_date}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedService && (
                        <div className="flex gap-3">
                            <button
                                onClick={loadAttendanceReport}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Load Report
                            </button>
                            {attendance.length > 0 && (
                                <button
                                    onClick={exportToExcel}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Export to Excel
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8">Loading report...</div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {selectedService ? 'No attendance records found' : 'Select a service to view report'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Service</th>
                                        <th className="px-4 py-2 text-left">ID Number</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Command</th>
                                        <th className="px-4 py-2 text-left">Method</th>
                                        <th className="px-4 py-2 text-left">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record, idx) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{record.service_date}</td>
                                            <td className="px-4 py-2">{record.service_name}</td>
                                            <td className="px-4 py-2">{record.id_number}</td>
                                            <td className="px-4 py-2">{record.first_name} {record.last_name}</td>
                                            <td className="px-4 py-2">{record.command}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${record.attendance_method === 'self_scan'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {record.attendance_method === 'self_scan' ? 'Self Check-in' : 'Manual Entry'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">{new Date(record.attendance_time).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 text-sm text-gray-500">
                                Total: {attendance.length} members
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}