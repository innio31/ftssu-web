import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { FiCamera, FiMail, FiPhone, FiCalendar, FiKey, FiSave, FiX, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { member, updateMember } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(member?.phone_number || '');
    const [email, setEmail] = useState(member?.email || '');
    const [dateOfBirth, setDateOfBirth] = useState(member?.date_of_birth || '');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(member?.profile_picture || null);
    const [uploading, setUploading] = useState(false);

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-NG');
    };

    const handleSaveProfile = async () => {
        if (!phoneNumber || phoneNumber.length !== 11) {
            toast.error('Please enter a valid 11-digit phone number');
            return;
        }

        setLoading(true);
        const result = await api.updateMember({
            id: member.id,
            phone_number: phoneNumber,
            email: email,
            date_of_birth: dateOfBirth,
        });

        if (result.success) {
            updateMember({ phone_number: phoneNumber, email: email, date_of_birth: dateOfBirth });
            toast.success('Profile updated successfully');
            setEditing(false);
        } else {
            toast.error(result.error || 'Failed to update profile');
        }
        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 4) {
            toast.error('Password must be at least 4 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await api.updateMember({
            id: member.id,
            password: newPassword,
        });

        if (result.success) {
            toast.success('Password changed successfully');
            setShowChangePassword(false);
            setNewPassword('');
            setConfirmPassword('');
        } else {
            toast.error(result.error || 'Failed to change password');
        }
        setLoading(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append('member_id', member.id);
        formData.append('profile_picture', file);

        try {
            const response = await fetch('https://impactdigitalacademy.com.ng/ftssu/api/update_member.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setProfilePicture(data.member?.profile_picture);
                updateMember({ profile_picture: data.member?.profile_picture });
                toast.success('Profile picture updated');
            } else {
                toast.error(data.error || 'Failed to upload image');
            }
        } catch (error) {
            toast.error('Network error');
        }
        setUploading(false);
    };

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

                {/* Profile Header */}
                <div className="bg-gradient-to-r from-primary to-red-700 rounded-2xl p-6 text-white">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                                    <FiUser size={40} className="text-white" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer">
                                <FiCamera size={16} className="text-primary" />
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                            </label>
                            {uploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>}
                        </div>
                        <h2 className="text-xl font-bold">{member?.first_name} {member?.last_name}</h2>
                        <p className="text-red-100">{member?.role}</p>
                        <p className="text-sm text-red-100 mt-1">ID: {member?.id_number}</p>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Designation:</span>
                            <span className="font-semibold">{member?.designation || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-semibold">{member?.gender || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Command:</span>
                            <span className="font-semibold">{member?.command || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Date Joined:</span>
                            <span className="font-semibold">{formatDate(member?.date_joined)}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                        {!editing && (
                            <button onClick={() => setEditing(true)} className="text-primary hover:underline text-sm">
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiPhone /> Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="08012345678"
                                    maxLength={11}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiMail /> Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="youremail@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiCalendar /> Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditing(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 flex items-center justify-center gap-2"
                                >
                                    <FiX /> Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave />}
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600 flex items-center gap-2"><FiPhone /> Phone:</span>
                                <span className="font-semibold">{phoneNumber || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600 flex items-center gap-2"><FiMail /> Email:</span>
                                <span className="font-semibold">{email || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600 flex items-center gap-2"><FiCalendar /> Date of Birth:</span>
                                <span className="font-semibold">{formatDate(dateOfBirth)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FiKey /> Security
                    </h3>

                    {showChangePassword ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 4 characters"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowChangePassword(true)}
                            className="text-primary font-semibold hover:underline"
                        >
                            Change Password →
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
}