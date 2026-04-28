import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { FiCalendar, FiUserCheck, FiQrCode, FiUsers, FiSearch, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AttendancePage() {
    const { member, hasRole } = useAuth();
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [activeServices, setActiveServices] = useState([]);
    const [members, setMembers] = useState([]);
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showManualModal, setShowManualModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedCommand, setSelectedCommand] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [recording, setRecording] = useState(false);
    const [qrScanning, setQrScanning] = useState(false);

    const canTakeAttendance = hasRole(['Senior Commander I', 'Senior Commander II', 'Secretary', 'IT Admin', 'Golf Serial', 'Admin']);
    const canSeeAllMembers = hasRole(['IT Admin', 'Golf Serial', 'Admin']);

    useEffect(() => {
        loadAttendanceHistory();
        if (canTakeAttendance) {
            loadActiveServices();
            if (canSeeAllMembers) {
                loadAllCommands();
            } else {
                loadMembersByCommand(member.command);
            }
        }
    }, []);

    const loadAttendanceHistory = async () => {
        const result = await api.getAttendanceHistory(member.id);
        if (result.success) {
            setAttendanceHistory(result.attendance || []);
        }
        setLoading(false);
    };

    const loadActiveServices = async () => {
        const result = await api.getActiveServices();
        if (result.success) {
            setActiveServices(result.services || []);
        }
    };

    const loadAllCommands = async () => {
        const result = await api.getAllCommands();
        if (result.success) {
            setCommands(['All Commands', ...(result.commands || [])]);
        }
    };

    const loadMembersByCommand = async (command) => {
        if (command === 'All Commands') {
            const result = await api.getMembers();
            if (result.success) setMembers(result.members || []);
        } else if (command) {
            const result = await api.getMembersByCommand(command);
            if (result.success) setMembers(result.members || []);
        }
    };

    const handleCommandSelect = async (command) => {
        setSelectedCommand(command);
        setSelectedMember(null);
        await loadMembersByCommand(command);
    };

    const recordAttendance = async () => {
        if (!selectedService) {
            toast.error('Please select a service');
            return;
        }
        if (!selectedMember) {
            toast.error('Please select a member');
            return;
        }
        if (recording) return;

        setRecording(true);
        const result = await api.recordAttendance(selectedMember.id, selectedService.id, member.id);

        if (result.success) {
            toast.success(`Attendance recorded for ${selectedMember.first_name} ${selectedMember.last_name}`);
            setShowManualModal(false);
            setSelectedService(null);
            setSelectedCommand('');
            setSelectedMember(null);
            setSearchQuery('');
            await loadAttendanceHistory();
        } else {
            toast.error(result.error || 'Failed to record attendance');
        }
        setRecording(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-NG', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredMembers = members.filter(m =>
        m.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">📅 Attendance</h1>

                {/* Manual Attendance Button */}
                {canTakeAttendance && (
                    <div className="bg-gradient-to-r from-primary to-red-700 rounded-2xl p-6 text-white">
                        <h2 className="text-xl font-bold mb-2">📝 Take Attendance</h2>
                        <p className="text-red-100 mb-4">
                            {canSeeAllMembers
                                ? "Record attendance for any member in any command"
                                : `Record attendance for members in ${member?.command} command`}
                        </p>
                        <button
                            onClick={() => setShowManualModal(true)}
                            className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <FiUserCheck size={20} />
                            Take Manual Attendance
                        </button>
                    </div>
                )}

                {/* Active Services */}
                {canTakeAttendance && activeServices.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FiCalendar className="text-primary" />
                            Active Services
                        </h2>
                        <div className="space-y-3">
                            {activeServices.map((service) => (
                                <div key={service.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800">{service.service_name}</p>
                                        <p className="text-sm text-gray-500">{service.service_date} at {service.start_time}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Active</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attendance History */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">📋 My Attendance History</h2>
                    {attendanceHistory.length > 0 ? (
                        <div className="space-y-3">
                            {attendanceHistory.map((record) => (
                                <div key={record.id} className="flex justify-between items-center p-4 border-b border-gray-100">
                                    <div>
                                        <p className="font-semibold text-gray-800">{record.service_name}</p>
                                        <p className="text-sm text-gray-500">{formatDate(record.attendance_time)}</p>
                                        <p className="text-xs text-gray-400">
                                            Method: {record.attendance_method === 'self_scan' ? 'Self Check-in' : 'Manual Entry'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-600">
                                        <FiCheckCircle size={20} />
                                        <span className="text-sm font-semibold">Present</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No attendance records found</p>
                    )}
                </div>
            </div>

            {/* Manual Attendance Modal */}
            {showManualModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowManualModal(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b px-6 py-4">
                            <h2 className="text-2xl font-bold text-primary">Take Manual Attendance</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Select Service */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Select Service *</label>
                                <div className="flex flex-wrap gap-2">
                                    {activeServices.map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => setSelectedService(service)}
                                            className={`px-4 py-2 rounded-full transition-colors ${selectedService?.id === service.id
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {service.service_name}
                                        </button>
                                    ))}
                                </div>
                                {activeServices.length === 0 && (
                                    <p className="text-gray-500 text-sm">No active services available</p>
                                )}
                            </div>

                            {/* Select Command - For IT Admins */}
                            {canSeeAllMembers && (
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Select Command *</label>
                                    <select
                                        value={selectedCommand}
                                        onChange={(e) => handleCommandSelect(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select Command</option>
                                        {commands.map((cmd) => (
                                            <option key={cmd} value={cmd}>{cmd}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Search Member */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Search Member</label>
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name or ID..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            {/* Members List */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Select Member *</label>
                                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                                    {filteredMembers.length > 0 ? (
                                        filteredMembers.map((member) => (
                                            <button
                                                key={member.id}
                                                onClick={() => setSelectedMember(member)}
                                                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedMember?.id === member.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                                                    }`}
                                            >
                                                <p className="font-semibold text-gray-800">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-gray-500">ID: {member.id_number} | Command: {member.command}</p>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">
                                            {canSeeAllMembers && !selectedCommand
                                                ? 'Select a command to view members'
                                                : 'No members found'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                            <button
                                onClick={() => setShowManualModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={recordAttendance}
                                disabled={!selectedService || !selectedMember || recording}
                                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {recording ? 'Recording...' : 'Record Attendance'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}