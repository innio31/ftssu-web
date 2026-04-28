const API_BASE_URL = 'https://impactdigitalacademy.com.ng/ftssu/api';

export const api = {
    // Auth
    verifyMember: async (idNumber, password) => {
        const response = await fetch(`${API_BASE_URL}/verify_member.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_number: idNumber, password }),
        });
        return response.json();
    },

    // Members
    getMember: async (id) => {
        const response = await fetch(`${API_BASE_URL}/get_member.php?id=${id}`);
        return response.json();
    },

    getMembers: async () => {
        const response = await fetch(`${API_BASE_URL}/get_members.php`);
        return response.json();
    },

    getMembersByCommand: async (command) => {
        const response = await fetch(`${API_BASE_URL}/get_members_by_command.php?command=${encodeURIComponent(command)}`);
        return response.json();
    },

    addMember: async (memberData) => {
        const response = await fetch(`${API_BASE_URL}/add_member.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData),
        });
        return response.json();
    },

    updateMember: async (memberData) => {
        const response = await fetch(`${API_BASE_URL}/update_member.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData),
        });
        return response.json();
    },

    deleteMember: async (id) => {
        const response = await fetch(`${API_BASE_URL}/delete_member.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        return response.json();
    },

    // Products
    getProducts: async () => {
        const response = await fetch(`${API_BASE_URL}/get_products.php`);
        return response.json();
    },

    addProduct: async (productData) => {
        const response = await fetch(`${API_BASE_URL}/add_product.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        return response.json();
    },

    updateProduct: async (productData) => {
        const response = await fetch(`${API_BASE_URL}/update_product.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        return response.json();
    },

    deleteProduct: async (id) => {
        const response = await fetch(`${API_BASE_URL}/delete_product.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        return response.json();
    },

    // Orders
    saveOrder: async (orderData) => {
        const response = await fetch(`${API_BASE_URL}/save_order.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        return response.json();
    },

    getOrders: async (phoneNumber) => {
        const response = await fetch(`${API_BASE_URL}/get_orders.php?phone=${phoneNumber}`);
        return response.json();
    },

    getAllOrders: async (startDate = null, endDate = null) => {
        let url = `${API_BASE_URL}/get_all_orders.php`;
        const params = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (params.length) url += `?${params.join('&')}`;
        const response = await fetch(url);
        return response.json();
    },

    getOrderDetails: async (orderNumber) => {
        const response = await fetch(`${API_BASE_URL}/get_order_details.php?order_number=${orderNumber}`);
        return response.json();
    },

    updateOrderStatus: async (orderId, status, deliveredBy = null) => {
        const response = await fetch(`${API_BASE_URL}/update_order_status.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status, delivered_by: deliveredBy }),
        });
        return response.json();
    },

    // Attendance
    getAttendanceHistory: async (memberId) => {
        const response = await fetch(`${API_BASE_URL}/get_attendance_history.php?member_id=${memberId}`);
        return response.json();
    },

    getAttendanceReport: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('start_date', filters.startDate);
        if (filters.endDate) params.append('end_date', filters.endDate);
        if (filters.command) params.append('command', filters.command);
        const response = await fetch(`${API_BASE_URL}/get_attendance_report.php?${params}`);
        return response.json();
    },

    recordAttendance: async (memberId, serviceId, takenBy) => {
        const response = await fetch(`${API_BASE_URL}/record_attendance.php`, {
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
        const response = await fetch(`${API_BASE_URL}/get_active_services.php`);
        return response.json();
    },

    getServices: async () => {
        const response = await fetch(`${API_BASE_URL}/get_services.php`);
        return response.json();
    },

    addService: async (serviceData) => {
        const response = await fetch(`${API_BASE_URL}/add_service.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData),
        });
        return response.json();
    },

    updateService: async (serviceData) => {
        const response = await fetch(`${API_BASE_URL}/update_service.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData),
        });
        return response.json();
    },

    deleteService: async (id) => {
        const response = await fetch(`${API_BASE_URL}/delete_service.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        return response.json();
    },

    // Announcements
    getAnnouncements: async () => {
        const response = await fetch(`${API_BASE_URL}/get_announcements.php`);
        return response.json();
    },

    addAnnouncement: async (announcementData) => {
        const response = await fetch(`${API_BASE_URL}/add_announcement.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(announcementData),
        });
        return response.json();
    },

    deleteAnnouncement: async (id) => {
        const response = await fetch(`${API_BASE_URL}/delete_announcement.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        return response.json();
    },

    pinAnnouncement: async (id, isPinned) => {
        const response = await fetch(`${API_BASE_URL}/pin_announcement.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_pinned: isPinned ? 1 : 0 }),
        });
        return response.json();
    },

    // Commands
    getAllCommands: async () => {
        const response = await fetch(`${API_BASE_URL}/get_all_commands.php`);
        return response.json();
    },

    // Sales Report
    getSalesReport: async (startDate = null, endDate = null) => {
        let url = `${API_BASE_URL}/get_sales_report.php`;
        const params = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (params.length) url += `?${params.join('&')}`;
        const response = await fetch(url);
        return response.json();
    },

    getVersion: async () => {
        const response = await fetch(`${API_BASE_URL}/get_version.php`);
        return response.json();
    },
};