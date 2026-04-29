import React, { useState, useEffect } from 'react'

export default function AttendanceModal({ isOpen, onClose, member, service, onSuccess }) {
    const [members, setMembers] = useState([])
    const [filteredMembers, setFilteredMembers] = useState([])
    const [selectedMembers, setSelectedMembers] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (isOpen && service && member) {
            loadMembers()
        }
    }, [isOpen, service, member])

    useEffect(() => {
        filterMembers()
    }, [searchTerm, members])

    const loadMembers = async () => {
        setLoading(true)
        try {
            // Get members from the same command
            const response = await fetch(`/api/get_members_by_command.php?command=${encodeURIComponent(member.command)}`)
            const data = await response.json()
            if (data.success) {
                setMembers(data.members || [])
                setFilteredMembers(data.members || [])

                // Initialize selected members state
                const initialSelected = {}
                data.members.forEach(m => {
                    initialSelected[m.id] = false
                })
                setSelectedMembers(initialSelected)
            }
        } catch (error) {
            console.error('Error loading members:', error)
            alert('Failed to load members')
        } finally {
            setLoading(false)
        }
    }

    const filterMembers = () => {
        if (!searchTerm.trim()) {
            setFilteredMembers(members)
        } else {
            const filtered = members.filter(m =>
                m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.id_number.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredMembers(filtered)
        }
    }

    const toggleMember = (memberId) => {
        setSelectedMembers(prev => ({
            ...prev,
            [memberId]: !prev[memberId]
        }))
    }

    const selectAll = () => {
        const newSelected = {}
        filteredMembers.forEach(m => {
            newSelected[m.id] = true
        })
        setSelectedMembers(prev => ({ ...prev, ...newSelected }))
    }

    const deselectAll = () => {
        const newSelected = {}
        filteredMembers.forEach(m => {
            newSelected[m.id] = false
        })
        setSelectedMembers(prev => ({ ...prev, ...newSelected }))
    }

    const submitAttendance = async () => {
        const selected = Object.keys(selectedMembers).filter(id => selectedMembers[id])

        if (selected.length === 0) {
            alert('Please select at least one member')
            return
        }

        setSubmitting(true)
        let successCount = 0
        let failCount = 0

        for (const memberId of selected) {
            try {
                const response = await fetch('/api/record_attendance.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        member_id: parseInt(memberId),
                        service_id: service.id,
                        attendance_method: 'manual_entry',
                        taken_by: member.id
                    })
                })
                const data = await response.json()
                if (data.success) {
                    successCount++
                } else {
                    failCount++
                }
            } catch (error) {
                console.error('Error recording attendance:', error)
                failCount++
            }
        }

        setSubmitting(false)
        alert(`Attendance recorded!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`)

        if (successCount > 0) {
            onSuccess()
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Take Attendance</h2>
                        <p className="text-sm text-gray-500">{service?.service_name} - {service?.service_date}</p>
                        <p className="text-xs text-gray-400">Command: {member?.command}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 text-2xl hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <div className="p-4 border-b">
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button
                            onClick={selectAll}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Select All
                        </button>
                        <button
                            onClick={deselectAll}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="text-sm text-gray-500">
                        {filteredMembers.length} members found
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8">Loading members...</div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No members found</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredMembers.map(m => (
                                <label
                                    key={m.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {m.designation} {m.first_name} {m.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">ID: {m.id_number}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers[m.id] || false}
                                        onChange={() => toggleMember(m.id)}
                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                    />
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submitAttendance}
                        disabled={submitting}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                        {submitting ? 'Recording...' : 'Record Attendance'}
                    </button>
                </div>
            </div>
        </div>
    )
}