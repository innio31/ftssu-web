import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        loadMemberFromStorage();
    }, []);

    const loadMemberFromStorage = async () => {
        try {
            const storedMember = localStorage.getItem('ftssu_member');
            const storedId = localStorage.getItem('ftssu_member_id');

            if (storedMember && storedId) {
                const memberData = JSON.parse(storedMember);
                setMember(memberData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading member:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (idNumber, password) => {
        try {
            const result = await api.verifyMember(idNumber, password);

            if (result.success && result.member) {
                const memberData = result.member;

                localStorage.setItem('ftssu_member', JSON.stringify(memberData));
                localStorage.setItem('ftssu_member_id', memberData.id);
                localStorage.setItem('ftssu_member_role', memberData.role);
                localStorage.setItem('ftssu_member_command', memberData.command);
                localStorage.setItem('ftssu_last_activity', Date.now().toString());

                setMember(memberData);
                setIsAuthenticated(true);

                return { success: true, member: memberData };
            } else {
                return { success: false, error: result.message || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('ftssu_member');
        localStorage.removeItem('ftssu_member_id');
        localStorage.removeItem('ftssu_member_role');
        localStorage.removeItem('ftssu_member_command');
        localStorage.removeItem('ftssu_last_activity');
        setMember(null);
        setIsAuthenticated(false);
    };

    const updateMember = (updatedData) => {
        const newMember = { ...member, ...updatedData };
        setMember(newMember);
        localStorage.setItem('ftssu_member', JSON.stringify(newMember));
    };

    const hasRole = (roles) => {
        if (!member) return false;
        if (typeof roles === 'string') return member.role === roles;
        return roles.includes(member.role);
    };

    return (
        <AuthContext.Provider value={{
            member,
            loading,
            isAuthenticated,
            login,
            logout,
            updateMember,
            hasRole,
        }}>
            {children}
        </AuthContext.Provider>
    );
};