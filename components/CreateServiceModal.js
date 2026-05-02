import React, { useState } from 'react'

const SERVICE_TYPES = [
    {
        id: 'Sunday',
        label: 'Sunday Service',
        icon: '⛪',
        description: 'Regular weekly Sunday service',
        color: 'border-red-400 bg-red-50',
        activeColor: 'border-red-600 bg-red-100 ring-2 ring-red-400',
        defaultTime: '07:00',
    },
    {
        id: 'All Night',
        label: 'All Night Service',
        icon: '🌙',
        description: 'Overnight prayer & worship service',
        color: 'border-blue-400 bg-blue-50',
        activeColor: 'border-blue-600 bg-blue-100 ring-2 ring-blue-400',
        defaultTime: '22:00',
    },
    {
        id: 'Special',
        label: 'Special Service',
        icon: '✨',
        description: 'Special programme, convention or event',
        color: 'border-purple-400 bg-purple-50',
        activeColor: 'border-purple-600 bg-purple-100 ring-2 ring-purple-400',
        defaultTime: '09:00',
    },
]

export default function CreateServiceModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1) // 1 = pick type, 2 = fill details
    const [serviceType, setServiceType] = useState(null)
    const [form, setForm] = useState({
        service_name: '',
        service_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        description: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleTypeSelect = (type) => {
        setServiceType(type)
        // Pre-fill name and time based on type
        const suggestedName = type.id === 'Sunday'
            ? `Sunday Service — ${formatDateShort(form.service_date)}`
            : type.id === 'All Night'
                ? `All Night Service — ${formatDateShort(form.service_date)}`
                : ''
        setForm(f => ({
            ...f,
            service_name: suggestedName,
            start_time: type.defaultTime,
        }))
        setStep(2)
    }

    const handleBack = () => {
        setStep(1)
        setServiceType(null)
        setError('')
    }

    const handleDateChange = (val) => {
        setForm(f => {
            const newName = serviceType?.id === 'Sunday'
                ? `Sunday Service — ${formatDateShort(val)}`
                : serviceType?.id === 'All Night'
                    ? `All Night Service — ${formatDateShort(val)}`
                    : f.service_name
            return { ...f, service_date: val, service_name: newName }
        })
    }

    const formatDateShort = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-NG', {
            day: '2-digit', month: 'short', year: 'numeric'
        })
    }

    const handleSubmit = async () => {
        setError('')
        if (!form.service_name.trim()) { setError('Service name is required.'); return }
        if (!form.service_date) { setError('Service date is required.'); return }
        if (!form.start_time) { setError('Start time is required.'); return }

        setSubmitting(true)
        try {
            const res = await fetch('/api/create_service.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_type: serviceType.id,
                    service_name: form.service_name.trim(),
                    service_date: form.service_date,
                    start_time: form.start_time,
                    end_time: form.end_time || null,
                    description: form.description.trim(),
                    is_active: 1,
                })
            })
            const data = await res.json()

            if (data.success) {
                onSuccess && onSuccess(data.service)
                handleReset()
                onClose()
            } else {
                setError(data.message || 'Failed to create service. Please try again.')
            }
        } catch (err) {
            console.error('[CreateService] Error:', err)
            setError('Network error. Please check your connection.')
        }
        setSubmitting(false)
    }

    const handleReset = () => {
        setStep(1)
        setServiceType(null)
        setForm({
            service_name: '',
            service_date: new Date().toISOString().split('T')[0],
            start_time: '',
            end_time: '',
            description: '',
        })
        setError('')
    }

    const handleClose = () => {
        handleReset()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4"
            onClick={handleClose}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <div className="flex items-center gap-3">
                        {step === 2 && (
                            <button onClick={handleBack}
                                className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Create Service</h2>
                            <p className="text-xs text-gray-400">
                                {step === 1 ? 'Step 1: Choose service type' : `Step 2: ${serviceType?.label} details`}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                        &times;
                    </button>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                    <div className="h-1 bg-red-600 transition-all duration-300"
                        style={{ width: step === 1 ? '50%' : '100%' }} />
                </div>

                <div className="flex-1 overflow-y-auto p-5">

                    {/* ---- STEP 1: Choose type ---- */}
                    {step === 1 && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 mb-4">
                                What type of service are you creating?
                            </p>
                            {SERVICE_TYPES.map(type => (
                                <button key={type.id} onClick={() => handleTypeSelect(type)}
                                    className={`w-full text-left border-2 rounded-xl p-4 transition hover:shadow-md ${type.color}`}>
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">{type.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800">{type.label}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ---- STEP 2: Service details ---- */}
                    {step === 2 && serviceType && (
                        <div className="space-y-4">

                            {/* Type badge */}
                            <div className={`flex items-center gap-2 p-3 rounded-xl border-2 ${serviceType.color}`}>
                                <span className="text-2xl">{serviceType.icon}</span>
                                <div>
                                    <p className="font-bold text-gray-700 text-sm">{serviceType.label}</p>
                                    <p className="text-xs text-gray-500">{serviceType.description}</p>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Service Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Service Name <span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={form.service_name}
                                    onChange={e => setForm(f => ({ ...f, service_name: e.target.value }))}
                                    placeholder={`e.g. ${serviceType.label}`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input type="date" value={form.service_date}
                                    onChange={e => handleDateChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                            </div>

                            {/* Start & End Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input type="time" value={form.start_time}
                                        onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        End Time <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input type="time" value={form.end_time}
                                        onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Description <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea value={form.description} rows={3}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Additional notes about this service..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer — only on step 2 */}
                {step === 2 && (
                    <div className="border-t p-4 flex gap-3">
                        <button onClick={handleBack}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                            ← Back
                        </button>
                        <button onClick={handleSubmit} disabled={submitting}
                            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                            {submitting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Creating...
                                </>
                            ) : '✅ Create Service'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}