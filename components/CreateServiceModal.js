import React, { useState } from 'react'

export default function CreateServiceModal({ isOpen, onClose, onSuccess, activeServicesCount }) {
    const [serviceName, setServiceName] = useState('')
    const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('11:00')
    const [loading, setLoading] = useState(false)
    const [closePrevious, setClosePrevious] = useState(false)

    const handleSubmit = async () => {
        if (!serviceName.trim()) {
            alert('Please enter service name')
            return
        }

        setLoading(true)

        // If there are active services, ask for confirmation
        if (activeServicesCount > 0 && !closePrevious) {
            const confirm = window.confirm(
                `There is currently ${activeServicesCount} active service(s).\n\n` +
                `Creating a new service will close the current active service(s).\n\n` +
                `Do you want to proceed?`
            )
            if (!confirm) {
                setLoading(false)
                return
            }
        }

        try {
            const response = await fetch('/api/add_service.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_name: serviceName,
                    service_date: serviceDate,
                    start_time: startTime,
                    end_time: endTime,
                    created_by: 'IT Admin'
                })
            })
            const data = await response.json()

            if (data.success) {
                alert('Service created successfully!')
                onSuccess()
                handleClose()
            } else {
                alert(data.error || 'Failed to create service')
            }
        } catch (error) {
            console.error('Error creating service:', error)
            alert('Network error')
        }
        setLoading(false)
    }

    const handleClose = () => {
        setServiceName('')
        setServiceDate(new Date().toISOString().split('T')[0])
        setStartTime('09:00')
        setEndTime('11:00')
        setClosePrevious(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
                <div className="border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Create New Service</h2>
                    <button onClick={handleClose} className="text-gray-500 text-2xl hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name *</label>
                        <input
                            type="text"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            placeholder="e.g., Sunday Service, Covenant Day"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={serviceDate}
                            onChange={(e) => setServiceDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>

                    {activeServicesCount > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Note: Creating this service will close {activeServicesCount} active service(s).
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-t p-4 flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Service'}
                    </button>
                </div>
            </div>
        </div>
    )
}