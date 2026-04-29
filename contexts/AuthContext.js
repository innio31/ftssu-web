import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE_URL = '';

export const AuthProvider = ({ children }) => {
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        loadMemberFromStorage();
    }, []);

    const loadMemberFromStorage = () => {
        try {
            const storedMember = localStorage.getItem('ftssu_member');
            if (storedMember) {
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
            console.log('Attempting login for:', idNumber);
            console.log('API URL:', `${API_BASE_URL}/verify_member.php`);

            const response = await fetch(`/api/verify_member.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    id_number: idNumber,
                    password: password
                }),
            });

            console.log('Response status:', response.status);

            const text = await response.text();
            console.log('Raw response:', text);

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('JSON parse error:', e);
                return { success: false, error: 'Server returned invalid response' };
            }

            if (result.success && result.member) {
                const memberData = result.member;

                localStorage.setItem('ftssu_member', JSON.stringify(memberData));
                localStorage.setItem('ftssu_member_id', memberData.id);
                localStorage.setItem('ftssu_member_role', memberData.role);
                localStorage.setItem('ftssu_member_command', memberData.command);

                setMember(memberData);
                setIsAuthenticated(true);

                return { success: true, member: memberData };
            } else {
                return { success: false, error: result.message || result.error || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error details:', error);
            return { success: false, error: 'Network error: ' + error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('ftssu_member');
        localStorage.removeItem('ftssu_member_id');
        localStorage.removeItem('ftssu_member_role');
        localStorage.removeItem('ftssu_member_command');
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