import { useState, useEffect } from 'react';

const PRIORITY_STYLES = {
    High: { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', border: 'border-l-red-500' },
    Medium: { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', border: 'border-l-yellow-500' },
    Low: { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', border: 'border-l-green-500' },
};

const STATUS_STYLES = {
    Pending: 'bg-gray-100 text-gray-600',
    Reviewed: 'bg-blue-100 text-blue-700',
    Addressed: 'bg-green-100 text-green-700',
};

const CATEGORY_ICONS = {
    Operations: '⚙️',
    Administration: '📋',
    Welfare: '❤️',
    General: '💬',
};

export default function ObservationsAdmin({ member }) {
    const [observations, setObservations] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all' });
    const [selected, setSelected] = useState(null); // observation being actioned
    const [actionNote, setActionNote] = useState('');
    const [updating, setUpdating] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => { fetchObservations(); }, [filters]);

    const fetchObservations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'fetch',
                member_id: member.id,
                ...Object.fromEntries(Object.entries(filters)),
            });
            const res = await fetch(`/api/observations.php?${params}`);
            const data = await res.json();
            if (data.success) {
                setObservations(data.observations);
                setCounts(data.counts);
            }
        } catch (err) {
            console.error('[ObservationsAdmin] Fetch failed:', err);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!selected) return;
        setUpdating(true);
        try {
            const res = await fetch('/api/observations.php?action=update_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    member_id: member.id,
                    observation_id: selected.id,
                    status: newStatus,
                    admin_note: actionNote,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(`Marked as ${newStatus}`);
                setSelected(null);
                setActionNote('');
                fetchObservations();
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            console.error('[ObservationsAdmin] Update failed:', err);
        }
        setUpdating(false);
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="space-y-4">

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Total', value: counts.total || 0, color: 'text-gray-800', bg: 'bg-white' },
                    { label: 'Pending', value: counts.pending || 0, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Reviewed', value: counts.reviewed || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Addressed', value: counts.addressed || 0, color: 'text-green-700', bg: 'bg-green-50' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 shadow-sm p-3 text-center`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {counts.high > 0 && (
                <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    <p className="text-red-700 text-sm font-semibold">
                        {counts.high} high priority {counts.high === 1 ? 'item' : 'items'} need attention
                    </p>
                </div>
            )}

            {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-green-700 text-sm font-semibold">✅ {successMsg}</p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: 'status', options: ['all', 'Pending', 'Reviewed', 'Addressed'] },
                        { key: 'priority', options: ['all', 'High', 'Medium', 'Low'] },
                        { key: 'category', options: ['all', 'Operations', 'Administration', 'Welfare', 'General'] },
                    ].map(f => (
                        <select key={f.key} value={filters[f.key]}
                            onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500 capitalize">
                            {f.options.map(o => (
                                <option key={o} value={o}>{o === 'all' ? `All ${f.key}` : o}</option>
                            ))}
                        </select>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <svg className="animate-spin w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                </div>
            ) : observations.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-gray-400 text-sm">No observations found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-gray-400 text-center">{observations.length} items</p>
                    {observations.map(obs => {
                        const pri = PRIORITY_STYLES[obs.priority] || PRIORITY_STYLES.Low;
                        return (
                            <div key={obs.id}
                                className={`bg-white rounded-xl border border-gray-100 shadow-sm border-l-4 ${pri.border} overflow-hidden`}>
                                <div className="p-4">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-base">{CATEGORY_ICONS[obs.category]}</span>
                                            <span className="text-xs font-bold text-gray-700">{obs.category}</span>
                                            <span className="text-xs text-gray-400">·</span>
                                            <span className="text-xs font-semibold text-gray-600">
                                                {obs.type === 'Observation' ? '👁️' : '💡'} {obs.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${pri.badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                                                {obs.priority}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[obs.status]}`}>
                                                {obs.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{obs.content}</p>

                                    {/* Admin note if exists */}
                                    {obs.admin_note && (
                                        <div className="bg-blue-50 rounded-lg p-2 mb-3">
                                            <p className="text-xs text-blue-600 font-semibold mb-0.5">Admin Note:</p>
                                            <p className="text-xs text-blue-700">{obs.admin_note}</p>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-400">{fmtDate(obs.created_at)}</p>

                                        {obs.status !== 'Addressed' && (
                                            <button
                                                onClick={() => { setSelected(obs); setActionNote(obs.admin_note || ''); }}
                                                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200 transition font-semibold">
                                                Update Status
                                            </button>
                                        )}
                                        {obs.status === 'Addressed' && obs.reviewed_at && (
                                            <p className="text-xs text-green-600">
                                                Addressed {fmtDate(obs.reviewed_at)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Update status modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Update Observation</h3>
                                <button onClick={() => { setSelected(null); setActionNote(''); }}
                                    className="text-gray-400 text-2xl leading-none">&times;</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selected.content}</p>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Admin Note <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea value={actionNote}
                                    onChange={e => setActionNote(e.target.value)}
                                    rows={3}
                                    placeholder="Add a note about actions taken or response..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleUpdateStatus('Reviewed')}
                                    disabled={updating || selected.status === 'Reviewed'}
                                    className="py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition">
                                    {updating ? '...' : '👁 Mark Reviewed'}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('Addressed')}
                                    disabled={updating}
                                    className="py-3 bg-green-700 text-white rounded-xl font-bold text-sm hover:bg-green-800 disabled:opacity-40 transition">
                                    {updating ? '...' : '✅ Mark Addressed'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}