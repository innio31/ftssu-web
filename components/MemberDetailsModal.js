import React, { useState, useEffect } from 'react'

export default function MemberDetailsModal({ isOpen, onClose, member: initialMember, onUpdate }) {
    const [member, setMember] = useState(initialMember)
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editedData, setEditedData] = useState({})
    const [memberDetails, setMemberDetails] = useState(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [editingStatus, setEditingStatus] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')

    useEffect(() => {
        if (initialMember) {
            setMember(initialMember)
            setEditedData({
                first_name: initialMember.first_name || '',
                last_name: initialMember.last_name || '',
                designation: initialMember.designation || 'Brother',
                command: initialMember.command || '',
                role: initialMember.role || 'Member',
                gender: initialMember.gender || 'Male',
                phone_number: initialMember.phone_number || '',
                email: initialMember.email || '',
                date_of_birth: initialMember.date_of_birth || '',
                date_joined: initialMember.date_joined || ''
            })
            setSelectedStatus(initialMember.status || 'pending')
            fetchMemberDetails()
        }
    }, [initialMember])

    const fetchMemberDetails = async () => {
        if (!initialMember?.id) return
        setLoadingDetails(true)
        try {
            const response = await fetch(`/api/get_member_details.php?id=${initialMember.id}`)
            const data = await response.json()
            if (data.success) {
                setMemberDetails(data)
                if (data.member?.status) {
                    setSelectedStatus(data.member.status)
                }
            }
        } catch (error) {
            console.error('Error fetching member details:', error)
        }
        setLoadingDetails(false)
    }

    const handleStatusUpdate = async () => {
        try {
            const response = await fetch('/api/update_member_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    member_id: member.id,
                    status: selectedStatus
                })
            })
            const data = await response.json()
            if (data.success) {
                alert('Status updated successfully!')
                setEditingStatus(false)
                fetchMemberDetails()
                if (onUpdate) onUpdate({ ...member, status: selectedStatus })
            } else {
                alert(data.message || 'Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Network error')
        }
    }

    const handleSave = async () => {
        setLoading(true)

        // Build update data - only include fields that have changed
        const updateData = { id: member.id }
        let hasChanges = false

        if (editedData.first_name !== member.first_name) {
            updateData.first_name = editedData.first_name
            hasChanges = true
        }
        if (editedData.last_name !== member.last_name) {
            updateData.last_name = editedData.last_name
            hasChanges = true
        }
        if (editedData.designation !== member.designation) {
            updateData.designation = editedData.designation
            hasChanges = true
        }
        if (editedData.command !== member.command) {
            updateData.command = editedData.command
            hasChanges = true
        }
        if (editedData.role !== member.role) {
            updateData.role = editedData.role
            hasChanges = true
        }
        if (editedData.gender !== member.gender) {
            updateData.gender = editedData.gender
            hasChanges = true
        }
        if (editedData.phone_number !== member.phone_number) {
            updateData.phone_number = editedData.phone_number
            hasChanges = true
        }
        if (editedData.email !== member.email) {
            updateData.email = editedData.email
            hasChanges = true
        }
        if (editedData.date_of_birth !== member.date_of_birth) {
            updateData.date_of_birth = editedData.date_of_birth
            hasChanges = true
        }
        if (editedData.date_joined !== member.date_joined) {
            updateData.date_joined = editedData.date_joined
            hasChanges = true
        }

        if (!hasChanges) {
            alert('No changes to update')
            setEditing(false)
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/update_member.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })
            const data = await response.json()

            if (data.success) {
                alert('Member updated successfully!')
                const updatedMember = { ...member, ...updateData }
                setMember(updatedMember)
                if (onUpdate) onUpdate(updatedMember)
                setEditing(false)
                fetchMemberDetails() // Refresh details after update
            } else {
                alert(data.error || data.message || 'Failed to update member')
            }
        } catch (error) {
            console.error('Update error:', error)
            alert('Network error')
        }
        setLoading(false)
    }

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-700',
            'inactive': 'bg-yellow-100 text-yellow-700',
            'not_available': 'bg-orange-100 text-orange-700',
            'revalidation': 'bg-red-100 text-red-700',
            'deceased': 'bg-gray-700 text-white',
            'pending': 'bg-gray-100 text-gray-500'
        }
        return colors[status] || 'bg-gray-100 text-gray-600'
    }

    const getStatusText = (status) => {
        const texts = {
            'active': '✅ Active (70%+ attendance)',
            'inactive': '⚠️ Inactive (Below 40% attendance)',
            'not_available': '📭 Not Available (2+ months absent)',
            'revalidation': '🔄 Revalidation (6+ months absent)',
            'deceased': '💔 Deceased',
            'pending': '⏳ Pending'
        }
        return texts[status] || status
    }

    if (!isOpen) return null

    const commands = [
        'UPPER ROOM', 'GOSHEN', 'YOUTH', 'OPERATION', 'HONOUR', 'G & G',
        'SPECIAL DUTY 1', 'SPECIAL DUTY 2', 'SPECIAL DUTY 3', 'SPECIAL DUTY 4', 'SPECIAL DUTY 5',
        'Command 1', 'Command 2', 'Command 3', 'Command 4', 'Command 5', 'Command 6', 'Command 7',
        'Command 8', 'Command 9', 'Command 10', 'Command 11', 'Command 12', 'Command 13', 'Command 14',
        'Command 15', 'Command 16', 'Command 17', 'Command 18', 'Command 19', 'Command 20', 'Command 21',
        'Command 22', 'VETERAN', 'KHMS', 'COVENANT DAY', 'RECRUITMENT & TRAINING', 'SID', 'PATROL',
        'IID', 'FORENSIC', 'FRENCH', 'VISION 1', 'VISION 2', 'VISION 3', 'SECURITY MEDICAL', 'SALES MONITORING'
    ]

    const roles = ['Member', 'Secretary', 'Commander I', 'Commander II', 'Senior Commander I',
        'Senior Commander II', 'IT Admin', 'Acct Admin', 'Admin', 'Golf Charlie',
        'Alpha Golf Charlie', 'Golf Serial', 'Alpha Golf Serial']

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not set'
        return new Date(dateStr).toLocaleDateString()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
            setEditing(false)
            setEditingStatus(false)
            onClose()
        }}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Member Details</h2>
                    <div className="flex gap-2">
                        {!editing && !editingStatus && (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Edit Profile
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-500 text-2xl hover:text-gray-700">
                            &times;
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Profile Image */}
                    <div className="flex justify-center mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                            {member?.profile_picture ? (
                                <img src={member.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                                    {member?.first_name?.[0]}{member?.last_name?.[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Member Information */}
                    <div className="space-y-4">
                        {editing ? (
                            // Edit Mode
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">ID Number</label>
                                    <input
                                        type="text"
                                        value={member?.id_number || ''}
                                        disabled
                                        className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={editedData.first_name}
                                        onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={editedData.last_name}
                                        onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
                                    <select
                                        value={editedData.designation}
                                        onChange={(e) => setEditedData({ ...editedData, designation: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="Brother">Brother</option>
                                        <option value="Sister">Sister</option>
                                        <option value="Deacon">Deacon</option>
                                        <option value="Deaconess">Deaconess</option>
                                        <option value="Pastor">Pastor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Command</label>
                                    <select
                                        value={editedData.command}
                                        onChange={(e) => setEditedData({ ...editedData, command: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="">Select Command</option>
                                        {commands.map(cmd => (
                                            <option key={cmd} value={cmd}>{cmd}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                    <select
                                        value={editedData.role}
                                        onChange={(e) => setEditedData({ ...editedData, role: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                                    <select
                                        value={editedData.gender}
                                        onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editedData.phone_number}
                                        onChange={(e) => setEditedData({ ...editedData, phone_number: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editedData.email}
                                        onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={editedData.date_of_birth?.split('T')[0] || ''}
                                        onChange={(e) => setEditedData({ ...editedData, date_of_birth: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date Joined</label>
                                    <input
                                        type="date"
                                        value={editedData.date_joined?.split('T')[0] || ''}
                                        onChange={(e) => setEditedData({ ...editedData, date_joined: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setEditing(false)
                                            setEditedData({
                                                first_name: member.first_name,
                                                last_name: member.last_name,
                                                designation: member.designation,
                                                command: member.command,
                                                role: member.role,
                                                gender: member.gender,
                                                phone_number: member.phone_number,
                                                email: member.email,
                                                date_of_birth: member.date_of_birth,
                                                date_joined: member.date_joined
                                            })
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            // View Mode
                            <>
                                {/* Basic Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">ID Number</p>
                                        <p className="text-gray-800 font-medium">{member?.id_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                                        <p className="text-gray-800 font-medium">{member?.first_name} {member?.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Designation</p>
                                        <p className="text-gray-800 font-medium">{member?.designation}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Command</p>
                                        <p className="text-gray-800 font-medium">{member?.command}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Role</p>
                                        <p className="text-gray-800 font-medium">{member?.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Gender</p>
                                        <p className="text-gray-800 font-medium">{member?.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                                        <p className="text-gray-800 font-medium">{member?.phone_number || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                        <p className="text-gray-800 font-medium">{member?.email || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Date of Birth</p>
                                        <p className="text-gray-800 font-medium">{formatDate(member?.date_of_birth)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Date Joined</p>
                                        <p className="text-gray-800 font-medium">{formatDate(member?.date_joined)}</p>
                                    </div>
                                </div>

                                {/* Status Section */}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Member Status</p>
                                        {!editingStatus && (
                                            <button
                                                onClick={() => setEditingStatus(true)}
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                Edit Status
                                            </button>
                                        )}
                                    </div>

                                    {editingStatus ? (
                                        <div className="space-y-3">
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <option value="active">✅ Active (70%+ attendance)</option>
                                                <option value="inactive">⚠️ Inactive (Below 40% attendance)</option>
                                                <option value="not_available">📭 Not Available (2+ months absent)</option>
                                                <option value="revalidation">🔄 Revalidation (6+ months absent)</option>
                                                <option value="deceased">💔 Deceased</option>
                                                <option value="pending">⏳ Pending</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingStatus(false)
                                                        setSelectedStatus(member?.status || 'pending')
                                                    }}
                                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleStatusUpdate}
                                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                                >
                                                    Save Status
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(member?.status)}`}>
                                                {getStatusText(member?.status)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Attendance Statistics */}
                                {loadingDetails ? (
                                    <div className="border-t pt-4">
                                        <p className="text-center text-gray-500 py-4">Loading attendance data...</p>
                                    </div>
                                ) : memberDetails?.attendance_stats ? (
                                    <div className="border-t pt-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Attendance Statistics (Last 90 Days)</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {memberDetails.attendance_stats.total_services_90days || 0}
                                                </p>
                                                <p className="text-xs text-gray-500">Total Services</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {memberDetails.attendance_stats.attended_count || 0}
                                                </p>
                                                <p className="text-xs text-gray-500">Attended</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <p className={`text-2xl font-bold ${(memberDetails.attendance_stats.attendance_percentage || 0) >= 70 ? 'text-green-600' :
                                                        (memberDetails.attendance_stats.attendance_percentage || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {memberDetails.attendance_stats.attendance_percentage || 0}%
                                                </p>
                                                <p className="text-xs text-gray-500">Attendance Rate</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {memberDetails.attendance_stats.days_since_last_attendance !== null
                                                        ? `${memberDetails.attendance_stats.days_since_last_attendance}d`
                                                        : 'Never'}
                                                </p>
                                                <p className="text-xs text-gray-500">Since Last Attendance</p>
                                            </div>
                                        </div>
                                        {memberDetails.attendance_stats.last_attendance && (
                                            <p className="text-xs text-gray-400 text-center mt-2">
                                                Last attended: {new Date(memberDetails.attendance_stats.last_attendance).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ) : null}

                                {/* Monthly Breakdown */}
                                {memberDetails?.monthly_attendance && memberDetails.monthly_attendance.length > 0 && (
                                    <div className="border-t pt-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Monthly Attendance Breakdown</p>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {memberDetails.monthly_attendance.map((month, idx) => {
                                                const percentage = (month.attended / month.total_services) * 100
                                                return (
                                                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                        <span className="text-sm text-gray-600">{month.month}</span>
                                                        <div className="flex items-center gap-3 flex-1 ml-4">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${percentage >= 70 ? 'bg-green-600' :
                                                                            percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                                                                        }`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500 min-w-[60px]">
                                                                {month.attended}/{month.total_services}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}