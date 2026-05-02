import { useState, useEffect } from 'react';

export default function WeeklyReportForm({ member, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        report_date: new Date().toISOString().split('T')[0],
        type_of_service: '',
        location_served: '',
        command_strength: 0,
        service_1_attendance: 0,
        service_2_attendance: 0,
        service_3_attendance: 0,
        tools_deployed: {
            patrol_vehicle: false,
            patrol_bike: false,
            torchlight: false,
            umbrella: false,
            radio: false,
            others: ''
        },
        incident_report: '',
        recommendations: ''
    });

    const [relocatedMembers, setRelocatedMembers] = useState([]);
    const [leftMembers, setLeftMembers] = useState([]);
    const [wsfAttendance, setWsfAttendance] = useState({ total: 0 });
    const [submitting, setSubmitting] = useState(false);
    const [commandMembers, setCommandMembers] = useState([]);
    const [newRelocatedMember, setNewRelocatedMember] = useState({
        member_id: '',
        name: '',
        new_location: '',
        reason: ''
    });
    const [newLeftMember, setNewLeftMember] = useState({
        member_id: '',
        name: '',
        reason: ''
    });

    useEffect(() => {
        fetchCommandMembers();
    }, [member]);

    const fetchCommandMembers = async () => {
        try {
            const response = await fetch(`/api/get_command_members.php?command=${encodeURIComponent(member.command)}`);
            const data = await response.json();
            if (data.success) {
                setCommandMembers(data.members);
                setFormData(prev => ({ ...prev, command_strength: data.members.length }));
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const calculateAverageAttendance = () => {
        const { service_1_attendance, service_2_attendance, service_3_attendance } = formData;
        const total = (service_1_attendance || 0) + (service_2_attendance || 0) + (service_3_attendance || 0);
        const count = [service_1_attendance, service_2_attendance, service_3_attendance].filter(v => v > 0).length;
        return count > 0 ? (total / count).toFixed(2) : 0;
    };

    const handleAddRelocatedMember = () => {
        if (!newRelocatedMember.member_id || !newRelocatedMember.new_location) {
            alert('Please select a member and enter new location');
            return;
        }
        const member = commandMembers.find(m => m.id === parseInt(newRelocatedMember.member_id));
        setRelocatedMembers([...relocatedMembers, {
            ...newRelocatedMember,
            name: member ? `${member.first_name} ${member.last_name}` : newRelocatedMember.name,
            relocation_date: new Date().toISOString().split('T')[0]
        }]);
        setNewRelocatedMember({ member_id: '', name: '', new_location: '', reason: '' });
    };

    const handleAddLeftMember = () => {
        if (!newLeftMember.member_id) {
            alert('Please select a member');
            return;
        }
        const member = commandMembers.find(m => m.id === parseInt(newLeftMember.member_id));
        setLeftMembers([...leftMembers, {
            ...newLeftMember,
            name: member ? `${member.first_name} ${member.last_name}` : newLeftMember.name,
            left_date: new Date().toISOString().split('T')[0]
        }]);
        setNewLeftMember({ member_id: '', name: '', reason: '' });
    };

    const handleRemoveRelocated = (index) => {
        setRelocatedMembers(relocatedMembers.filter((_, i) => i !== index));
    };

    const handleRemoveLeft = (index) => {
        setLeftMembers(leftMembers.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!formData.type_of_service) {
            alert('Please enter type of service');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/save_weekly_report.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    command_name: member.command,
                    submitted_by_member_id: member.id,
                    submitted_by_name: `${member.first_name} ${member.last_name}`,
                    average_attendance: calculateAverageAttendance(),
                    relocated_members: relocatedMembers,
                    left_members: leftMembers,
                    wsf_attendance: wsfAttendance.total
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Weekly report submitted successfully!');
                if (onSuccess) onSuccess();
            } else {
                alert(data.message || 'Failed to submit report');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Network error');
        }
        setSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800">Weekly Command Report of Activities</h3>
            <p className="text-sm text-gray-500">Command: <strong>{member.command}</strong></p>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Report Date</label>
                    <input
                        type="date"
                        value={formData.report_date}
                        onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type of Service</label>
                    <input
                        type="text"
                        value={formData.type_of_service}
                        onChange={(e) => setFormData({ ...formData, type_of_service: e.target.value })}
                        placeholder="e.g., Sunday Service, Mid-week Service"
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location Served</label>
                    <input
                        type="text"
                        value={formData.location_served}
                        onChange={(e) => setFormData({ ...formData, location_served: e.target.value })}
                        placeholder="e.g., Main Auditorium, Overflow Hall"
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Command Strength</label>
                    <input
                        type="number"
                        value={formData.command_strength}
                        onChange={(e) => setFormData({ ...formData, command_strength: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                        readOnly
                    />
                    <p className="text-xs text-gray-400">Auto-calculated from command members</p>
                </div>
            </div>

            {/* Attendance for 3 Services */}
            <div className="border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-3">Attendance by Service</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">1st Service</label>
                        <input
                            type="number"
                            value={formData.service_1_attendance}
                            onChange={(e) => setFormData({ ...formData, service_1_attendance: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">2nd Service</label>
                        <input
                            type="number"
                            value={formData.service_2_attendance}
                            onChange={(e) => setFormData({ ...formData, service_2_attendance: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">3rd Service</label>
                        <input
                            type="number"
                            value={formData.service_3_attendance}
                            onChange={(e) => setFormData({ ...formData, service_3_attendance: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800">
                        Average Attendance: <span className="text-xl">{calculateAverageAttendance()}</span>
                    </p>
                </div>
            </div>

            {/* Relocated Members */}
            <div className="border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-3">Relocated Members</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <select
                        value={newRelocatedMember.member_id}
                        onChange={(e) => setNewRelocatedMember({ ...newRelocatedMember, member_id: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="">Select Member</option>
                        {commandMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.id_number})</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="New Location"
                        value={newRelocatedMember.new_location}
                        onChange={(e) => setNewRelocatedMember({ ...newRelocatedMember, new_location: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    />
                    <input
                        type="text"
                        placeholder="Reason (optional)"
                        value={newRelocatedMember.reason}
                        onChange={(e) => setNewRelocatedMember({ ...newRelocatedMember, reason: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    />
                    <button
                        onClick={handleAddRelocatedMember}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>
                {relocatedMembers.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {relocatedMembers.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>{item.name} → {item.new_location}</span>
                                <button onClick={() => handleRemoveRelocated(idx)} className="text-red-500">Remove</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Left LFC Members */}
            <div className="border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-3">Left LFC Members</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                    <select
                        value={newLeftMember.member_id}
                        onChange={(e) => setNewLeftMember({ ...newLeftMember, member_id: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="">Select Member</option>
                        {commandMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.id_number})</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Reason"
                        value={newLeftMember.reason}
                        onChange={(e) => setNewLeftMember({ ...newLeftMember, reason: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    />
                    <button
                        onClick={handleAddLeftMember}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                        Add
                    </button>
                </div>
                {leftMembers.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {leftMembers.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>{item.name} - {item.reason}</span>
                                <button onClick={() => handleRemoveLeft(idx)} className="text-red-500">Remove</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* WSF Attendance */}
            <div className="border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-3">WSF Attendance</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Total Present</label>
                        <input
                            type="number"
                            value={wsfAttendance.total}
                            onChange={(e) => setWsfAttendance({ total: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Tools Deployed */}
            <div className="border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-3">Tools Deployed</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.tools_deployed.patrol_vehicle}
                            onChange={(e) => setFormData({
                                ...formData,
                                tools_deployed: { ...formData.tools_deployed, patrol_vehicle: e.target.checked }
                            })}
                        />
                        Patrol Vehicle
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.tools_deployed.patrol_bike}
                            onChange={(e) => setFormData({
                                ...formData,
                                tools_deployed: { ...formData.tools_deployed, patrol_bike: e.target.checked }
                            })}
                        />
                        Patrol Bike
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.tools_deployed.torchlight}
                            onChange={(e) => setFormData({
                                ...formData,
                                tools_deployed: { ...formData.tools_deployed, torchlight: e.target.checked }
                            })}
                        />
                        Torchlight
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.tools_deployed.umbrella}
                            onChange={(e) => setFormData({
                                ...formData,
                                tools_deployed: { ...formData.tools_deployed, umbrella: e.target.checked }
                            })}
                        />
                        Umbrella
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.tools_deployed.radio}
                            onChange={(e) => setFormData({
                                ...formData,
                                tools_deployed: { ...formData.tools_deployed, radio: e.target.checked }
                            })}
                        />
                        Radio
                    </label>
                    <div className="col-span-2 md:col-span-1">
                        <input
                            type="text"
                            placeholder="Other tools"
                            value={formData.tools_deployed.others}
                            onChange={(e) => setFormData({
                                ...formData,
                                tools_deployed: { ...formData.tools_deployed, others: e.target.value }
                            })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Incident Report */}
            <div className="border-t pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Incident Report</label>
                <textarea
                    rows="4"
                    value={formData.incident_report}
                    onChange={(e) => setFormData({ ...formData, incident_report: e.target.value })}
                    placeholder="Report any incidents or security-related events..."
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                />
            </div>

            {/* Recommendations/Comments */}
            <div className="border-t pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Recommendations / Comments</label>
                <textarea
                    rows="3"
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    placeholder="Any recommendations or comments..."
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
            </div>
        </div>
    );
}