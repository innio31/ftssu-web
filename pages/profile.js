import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
    const { member, updateMember, logout } = useAuth();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!member) {
            router.push('/');
        } else {
            setPhoneNumber(member.phone_number || '');
            setEmail(member.email || '');
        }
    }, [member, router]);

    const handleUpdateProfile = async () => {
        if (!phoneNumber || phoneNumber.length !== 11) {
            toast.error('Please enter a valid 11-digit phone number');
            return;
        }

        // Update local storage
        updateMember({ phone_number: phoneNumber, email: email });
        toast.success('Profile updated successfully');
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        router.push('/');
    };

    if (!member) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="bg-red-600 text-white p-6 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <button onClick={() => router.back()} className="text-white">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold">My Profile</h1>
                        <div className="w-16"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="text-center mb-6">
                        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-white text-3xl font-bold">
                                {member.first_name?.[0]}{member.last_name?.[0]}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {member.first_name} {member.last_name}
                        </h2>
                        <p className="text-gray-500">ID: {member.id_number}</p>
                    </div>

                    <div className="border-t pt-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Designation
                            </label>
                            <p className="text-gray-900">{member.designation}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Role
                            </label>
                            <p className="text-gray-900">{member.role}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Command
                            </label>
                            <p className="text-gray-900">{member.command}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Gender
                            </label>
                            <p className="text-gray-900">{member.gender}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="08012345678"
                                maxLength={11}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="youremail@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                        </div>

                        <button
                            onClick={handleUpdateProfile}
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors mt-4"
                        >
                            Update Profile
                        </button>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}