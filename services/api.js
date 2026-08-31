const API_BASE_URL = ''; // Empty for proxy

export const api = {
    // Auth
    verifyMember: async (idNumber, password) => {
        const response = await fetch(`/api/verify_member.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_number: idNumber, password }),
        });
        return response.json();
    },

    // Members
    getMember: async (id) => {
        const response = await fetch(`/api/get_member.php?id=${id}`);
        return response.json();
    },

    getMembers: async () => {
        const response = await fetch(`/api/get_members.php`);
        return response.json();
    },

    getMembersByCommand: async (command) => {
        const response = await fetch(`/api/get_members_by_command.php?command=${encodeURIComponent(command)}`);
        return response.json();
    },

    // Products
    getProducts: async () => {
        const response = await fetch(`/api/get_products.php`);
        return response.json();
    },

    // Orders
    saveOrder: async (orderData) => {
        const response = await fetch(`/api/save_order.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        return response.json();
    },

    getOrders: async (phoneNumber) => {
        const response = await fetch(`/api/get_orders.php?phone=${phoneNumber}`);
        return response.json();
    },

    getAllOrders: async (startDate = null, endDate = null) => {
        let url = `/api/get_all_orders.php`;
        const params = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (params.length) url += `?${params.join('&')}`;
        const response = await fetch(url);
        return response.json();
    },

    getOrderDetails: async (orderNumber) => {
        const response = await fetch(`/api/get_order_details.php?order_number=${orderNumber}`);
        return response.json();
    },

    updateOrderStatus: async (orderId, status, deliveredBy = null) => {
        const response = await fetch(`/api/update_order_status.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status, delivered_by: deliveredBy }),
        });
        return response.json();
    },

    // Attendance
    getAttendanceHistory: async (memberId) => {
        const response = await fetch(`/api/get_attendance_history.php?member_id=${memberId}`);
        return response.json();
    },

    getAttendanceReport: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('start_date', filters.startDate);
        if (filters.endDate) params.append('end_date', filters.endDate);
        if (filters.command) params.append('command', filters.command);
        const response = await fetch(`/api/get_attendance_report.php?${params}`);
        return response.json();
    },

    recordAttendance: async (memberId, serviceId, takenBy) => {
        const response = await fetch(`/api/record_attendance.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                member_id: memberId,
                service_id: serviceId,
                attendance_method: 'manual_entry',
                taken_by: takenBy,
            }),
        });
        return response.json();
    },

    getActiveServices: async () => {
        const response = await fetch(`/api/get_active_services.php`);
        return response.json();
    },

    getServices: async () => {
        const response = await fetch(`/api/get_services.php`);
        return response.json();
    },

    // Announcements
    getAnnouncements: async () => {
        const response = await fetch(`/api/get_announcements.php`);
        return response.json();
    },

    // Commands
    getAllCommands: async () => {
        const response = await fetch(`/api/get_all_commands.php`);
        return response.json();
    },

    // Sales Report
    getSalesReport: async (startDate = null, endDate = null) => {
        let url = `/api/get_sales_report.php`;
        const params = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (params.length) url += `?${params.join('&')}`;
        const response = await fetch(url);
        return response.json();
    },

    // Recruitment & Training
    checkLoginMethod: async (idNumber) => {
        const response = await fetch(`/api/check_login_method.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_number: idNumber }),
        });
        return response.json();
    },

    getRecruits: async (memberId, filters = {}) => {
        const params = new URLSearchParams({ member_id: memberId, ...filters });
        const response = await fetch(`/api/rt_get_recruits.php?${params}`);
        return response.json();
    },

    getRecruit: async (memberId, recruitId) => {
        const response = await fetch(`/api/rt_get_recruit.php?member_id=${memberId}&id=${recruitId}`);
        return response.json();
    },

    createRecruit: async (memberId, recruitData) => {
        const response = await fetch(`/api/rt_create_recruit.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id: memberId, ...recruitData }),
        });
        return response.json();
    },

    updateRecruit: async (memberId, recruitId, changes) => {
        const response = await fetch(`/api/rt_update_recruit.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id: memberId, recruit_id: recruitId, ...changes }),
        });
        return response.json();
    },

    updateRecruitStatus: async (memberId, recruitId, status, extra = {}) => {
        const response = await fetch(`/api/rt_update_status.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id: memberId, recruit_id: recruitId, status, ...extra }),
        });
        return response.json();
    },

    deleteRecruit: async (memberId, recruitId) => {
        const response = await fetch(`/api/rt_delete_recruit.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id: memberId, recruit_id: recruitId }),
        });
        return response.json();
    },

    getBatches: async (memberId) => {
        const response = await fetch(`/api/rt_batches.php?member_id=${memberId}`);
        return response.json();
    },

    createBatch: async (memberId, batchData) => {
        const response = await fetch(`/api/rt_batches.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id: memberId, ...batchData }),
        });
        return response.json();
    },

    markAttendance: async (memberId, batchId, attendanceDate, entries) => {
        const response = await fetch(`/api/rt_mark_attendance.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id: memberId, batch_id: batchId, attendance_date: attendanceDate, entries }),
        });
        return response.json();
    },

    getNonProgression: async (memberId, stage = null) => {
        const params = new URLSearchParams({ member_id: memberId, ...(stage ? { stage } : {}) });
        const response = await fetch(`/api/rt_get_non_progression.php?${params}`);
        return response.json();
    },

    getReports: async (memberId) => {
        const response = await fetch(`/api/rt_reports.php?member_id=${memberId}`);
        return response.json();
    },

    generateReport: async (memberId, reportData) => {
        const response = await fetch(`/api/rt_reports.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id: memberId, ...reportData }),
        });
        return response.json();
    },

    getAuditLog: async (memberId, filters = {}) => {
        const params = new URLSearchParams({ member_id: memberId, ...filters });
        const response = await fetch(`/api/rt_audit_log.php?${params}`);
        return response.json();
    },

    getCommandsWithIds: async () => {
        const response = await fetch(`/api/rt_get_commands.php`);
        return response.json();
    },
};