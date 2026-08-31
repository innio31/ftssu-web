// Mirrors api/rt_permissions.php. The backend is the real enforcement --
// these are only used to show/hide UI. Every write still gets checked
// server-side against the member's live role/command.

const RT_ADMIN_ROLES = ['Senior Commander I', 'Senior Commander II', 'Commander I', 'Commander II', 'Secretary'];

export function canManageRT(member) {
    if (!member) return false;
    return RT_ADMIN_ROLES.includes(member.role) && (member.command || '').toUpperCase() === 'RECRUITMENT & TRAINING';
}

export function hasRTFullControl(member) {
    if (!member) return false;
    if (member.role === 'Gulf Serial') return true;
    if (member.role === 'IT Admin' && (member.command || '').toUpperCase() === 'UPPER ROOM') return true;
    return false;
}

export function canAccessRT(member) {
    return canManageRT(member) || hasRTFullControl(member);
}

export const STATUS_LABELS = {
    intending: 'Intending',
    called_for_interview: 'Called for Interview',
    interviewed: 'Interviewed',
    not_reachable: 'Not Reachable',
    training: 'In Training',
    deployed: 'Deployed',
    dropped: 'Dropped',
};

export const STATUS_COLORS = {
    intending: 'bg-gray-100 text-gray-700',
    called_for_interview: 'bg-blue-100 text-blue-700',
    interviewed: 'bg-indigo-100 text-indigo-700',
    not_reachable: 'bg-yellow-100 text-yellow-700',
    training: 'bg-purple-100 text-purple-700',
    deployed: 'bg-green-100 text-green-700',
    dropped: 'bg-red-100 text-red-700',
};
