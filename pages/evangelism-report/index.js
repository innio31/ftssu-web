import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

// -------------------------------------------------------
// Access control constants
// -------------------------------------------------------
const FULL_ACCESS = ['IT Admin', 'Alpha Gulf Serial', 'Gulf Serial'];
const RT_LIMITED = ['Senior Commander I', 'Senior Commander II', 'Secretary'];
const RT_COMMAND = 'RECRUITMENT & TRAINING';

function hasAccess(member) {
    if (!member) return false;
    if (FULL_ACCESS.includes(member.role)) return true;
    if (RT_LIMITED.includes(member.role) && member.command === RT_COMMAND) return true;
    return false;
}

function isFullAccess(member) {
    return member && FULL_ACCESS.includes(member.role);
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
const STATUS_COLORS = {
    recruit: 'bg-blue-100 text-blue-700',
    training: 'bg-yellow-100 text-yellow-700',
    deployed: 'bg-green-100 text-green-700',
    dropped: 'bg-red-100 text-red-700',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

// -------------------------------------------------------
// API helper
// -------------------------------------------------------
async function api(member_id, action, extra = '') {
    const res = await fetch(`/api/get_evangelism_report.php?member_id=${member_id}&action=${action}${extra}`);
    return res.json();
}

// -------------------------------------------------------
// Main Page
// -------------------------------------------------------
export default function EvangelismReport() {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [denied, setDenied] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member');
        if (!stored) { router.push('/'); return; }
        const m = JSON.parse(stored);
        if (!hasAccess(m)) { setDenied(true); setLoading(false); return; }
        setMember(m);
        setLoading(false);
    }, []);

    // Available tabs based on role
    const tabs = member ? [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', always: true },
        { id: 'recruits', label: 'Manage Recruits', icon: '👥', always: true },
        { id: 'attendance', label: 'Training Attendance', icon: '🎓', always: true },
        { id: 'reports', label: 'Generate Reports', icon: '📄', fullOnly: true },
        { id: 'commands', label: 'Command Stats', icon: '🎖️', fullOnly: true },
        { id: 'training', label: 'Training Status', icon: '📈', fullOnly: true },
    ].filter(t => t.always || (t.fullOnly && isFullAccess(member))) : [];

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <svg className="animate-spin w-10 h-10 text-green-700 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-gray-500 mt-3">Loading...</p>
            </div>
        </div>
    );

    if (denied) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm">
                <p className="text-5xl mb-4">🚫</p>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
                <p className="text-gray-500 text-sm mb-6">You don't have permission to view evangelism reports.</p>
                <button onClick={() => router.push('/dashboard')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-800 to-green-700 text-white px-4 py-4 sticky top-0 z-40 shadow">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/dashboard')}
                            className="p-1 rounded-lg hover:bg-white/20 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="font-bold text-base">Evangelism Reports</h1>
                            <p className="text-green-200 text-xs">{member?.role} · {member?.command}</p>
                        </div>
                    </div>
                    <span className="text-2xl">✝️</span>
                </div>

                {/* Tab bar - horizontal scroll */}
                <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === t.id
                                    ? 'bg-white text-green-800'
                                    : 'text-green-100 hover:bg-white/20'
                                }`}>
                            <span>{t.icon}</span>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 max-w-4xl mx-auto">
                {activeTab === 'dashboard' && <DashboardTab member={member} />}
                {activeTab === 'recruits' && <RecruitsTab member={member} />}
                {activeTab === 'attendance' && <AttendanceTab member={member} />}
                {activeTab === 'reports' && isFullAccess(member) && <ReportsTab member={member} />}
                {activeTab === 'commands' && isFullAccess(member) && <CommandsTab member={member} />}
                {activeTab === 'training' && isFullAccess(member) && <TrainingTab member={member} />}
            </div>
        </div>
    );
}

// -------------------------------------------------------
// DASHBOARD TAB
// -------------------------------------------------------
function DashboardTab({ member }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api(member.id, 'dashboard').then(d => { setData(d); setLoading(false); });
    }, []);

    if (loading) return <Spinner />;

    const statCards = [
        { label: 'Total Contacts', value: data?.total || 0, icon: '👥', color: 'text-green-700' },
        { label: 'Today', value: data?.today || 0, icon: '📅', color: 'text-blue-600' },
        { label: 'This Month', value: data?.this_month || 0, icon: '📆', color: 'text-purple-600' },
        { label: 'Deployed', value: data?.by_status?.deployed || 0, icon: '✅', color: 'text-emerald-600' },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {statCards.map(s => (
                    <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                            </div>
                            <span className="text-2xl opacity-60">{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">Status Breakdown</h3>
                <div className="space-y-2">
                    {['recruit', 'training', 'deployed', 'dropped'].map(s => (
                        <div key={s} className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[s]}`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </span>
                            <span className="font-bold text-gray-700">{data?.by_status?.[s] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent submissions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">Recent Submissions</h3>
                {(data?.recent || []).length === 0
                    ? <p className="text-gray-400 text-sm text-center py-4">No submissions yet</p>
                    : (data.recent).map((r, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{r.full_name}</p>
                                <p className="text-xs text-gray-400">{r.command_name}</p>
                            </div>
                            <p className="text-xs text-gray-400">{fmtDate(r.registration_date)}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

// -------------------------------------------------------
// RECRUITS TAB
// -------------------------------------------------------
function RecruitsTab({ member }) {
    const [data, setData] = useState({ recruits: [], total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [updating, setUpdating] = useState(null);
    const full = isFullAccess(member);

    const load = useCallback(async () => {
        setLoading(true);
        const params = `&search=${encodeURIComponent(search)}&status=${status}&page=${page}`;
        const d = await api(member.id, 'recruits', params);
        if (d.success) setData(d);
        setLoading(false);
    }, [search, status, page]);

    useEffect(() => { load(); }, [load]);

    const updateStatus = async (recruit_id, newStatus) => {
        setUpdating(recruit_id);
        const res = await fetch('/api/get_evangelism_report.php?action=update_status&member_id=' + member.id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recruit_id, status: newStatus })
        });
        const result = await res.json();
        if (result.success) load();
        setUpdating(null);
    };

    return (
        <div className="space-y-3">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2">
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search name or phone..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="all">All Statuses</option>
                    <option value="recruit">Recruit</option>
                    <option value="training">Training</option>
                    <option value="deployed">Deployed</option>
                    <option value="dropped">Dropped</option>
                </select>
            </div>

            <p className="text-xs text-gray-400 text-center">{data.total} records found</p>

            {loading ? <Spinner /> : data.recruits.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-gray-400 text-sm">No recruits found</p>
                </div>
            ) : (
                <>
                    {data.recruits.map(r => (
                        <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="font-bold text-gray-800 truncate">{r.full_name}</p>
                                    <p className="text-sm text-gray-500">{r.phone_number}</p>
                                    {r.alternative_phone && <p className="text-xs text-gray-400">{r.alternative_phone}</p>}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${STATUS_COLORS[r.status]}`}>
                                    {r.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">🎖️ {r.command_name}</p>
                            {r.address && <p className="text-xs text-gray-400 mb-1">📍 {r.address}</p>}
                            {r.notes && <p className="text-xs text-gray-400 italic mb-2">"{r.notes}"</p>}

                            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                <p className="text-xs text-gray-400">{fmtDate(r.registration_date)}</p>
                                {/* Status update dropdown */}
                                <select disabled={updating === r.id} value={r.status}
                                    onChange={e => updateStatus(r.id, e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500">
                                    <option value="recruit">Recruit</option>
                                    <option value="training">Training</option>
                                    <option value="deployed">Deployed</option>
                                    <option value="dropped">Dropped</option>
                                </select>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {data.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-40">← Prev</button>
                            <span className="px-3 py-1 text-sm text-gray-500">{page} / {data.pages}</span>
                            <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-40">Next →</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// -------------------------------------------------------
// TRAINING ATTENDANCE TAB (accessible to all)
// -------------------------------------------------------
function AttendanceTab({ member }) {
    const [recruits, setRecruits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState({}); // { id: true/false }
    const [saved, setSaved] = useState(false);
    const full = isFullAccess(member);

    useEffect(() => {
        const extra = full ? '' : `&command=${encodeURIComponent(member.command)}`;
        api(member.id, 'training_status', extra).then(d => {
            if (d.success) {
                const trainees = d.recruits.filter(r => r.status === 'training');
                setRecruits(trainees);
                // Init all as absent
                const init = {};
                trainees.forEach(r => init[r.id] = false);
                setAttendance(init);
            }
            setLoading(false);
        });
    }, []);

    const toggle = (id) => setAttendance(a => ({ ...a, [id]: !a[id] }));

    const presentCount = Object.values(attendance).filter(Boolean).length;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700">Training Attendance</h3>
                    <span className="text-xs text-gray-400">{fmtDate(new Date().toISOString())}</span>
                </div>
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-700">{presentCount}</p>
                        <p className="text-xs text-gray-500">Present</p>
                    </div>
                    <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{recruits.length - presentCount}</p>
                        <p className="text-xs text-gray-500">Absent</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-700">{recruits.length}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                </div>

                {loading ? <Spinner /> : recruits.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-6">No trainees currently in training</p>
                ) : (
                    <div className="space-y-2">
                        {recruits.map(r => (
                            <div key={r.id} onClick={() => toggle(r.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${attendance[r.id]
                                        ? 'bg-green-50 border-green-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${attendance[r.id] ? 'bg-green-600' : 'bg-gray-300'
                                    }`}>
                                    {attendance[r.id] && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{r.full_name}</p>
                                    <p className="text-xs text-gray-400">{r.command_name}</p>
                                </div>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                    {attendance[r.id] ? '✅ Present' : '❌ Absent'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && recruits.length > 0 && (
                    <button onClick={() => setSaved(true)}
                        className="w-full mt-4 bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-800 transition">
                        {saved ? '✅ Attendance Saved' : 'Save Attendance'}
                    </button>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------
// GENERATE REPORTS TAB (full access only)
// -------------------------------------------------------
function ReportsTab({ member }) {
    const [form, setForm] = useState({ start: firstOfMonth(), end: today(), command: 'all', type: 'summary' });
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        const extra = `&start=${form.start}&end=${form.end}&command=${encodeURIComponent(form.command)}&type=${form.type}`;
        const d = await api(member.id, 'generate_report', extra);
        if (d.success) setReport(d);
        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                <h3 className="font-bold text-gray-700">Generate Report</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Start Date</label>
                        <input type="date" value={form.start} max={today()}
                            onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">End Date</label>
                        <input type="date" value={form.end} max={today()}
                            onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Report Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="summary">Summary Only</option>
                        <option value="detailed">Detailed (with contacts)</option>
                    </select>
                </div>
                <button onClick={generate} disabled={loading}
                    className="w-full bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-800 disabled:opacity-50 transition">
                    {loading ? 'Generating...' : '📄 Generate Report'}
                </button>
            </div>

            {report && (
                <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4 space-y-4">
                    {/* Report header */}
                    <div className="text-center border-b border-gray-200 pb-3">
                        <p className="text-xs font-bold text-green-800">🛡️ FAITH TABERNACLE SECURITY SERVICE UNIT</p>
                        <p className="text-sm font-bold text-gray-700 mt-1">EVANGELISM DRIVE RECRUITMENT REPORT</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {report.meta.command} · {fmtDate(report.meta.start)} – {fmtDate(report.meta.end)}
                        </p>
                        <p className="text-xs text-gray-400">Generated: {report.meta.generated}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Total', value: report.stats.total, color: 'text-gray-800' },
                            { label: 'Recruit', value: report.stats.recruit_count, color: 'text-blue-600' },
                            { label: 'Training', value: report.stats.training_count, color: 'text-yellow-600' },
                            { label: 'Deployed', value: report.stats.deployed_count, color: 'text-green-700' },
                        ].map(s => (
                            <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value || 0}</p>
                                <p className="text-xs text-gray-500">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed records */}
                    {report.meta.type === 'detailed' && report.records.length > 0 && (
                        <div>
                            <h4 className="font-bold text-gray-700 text-sm mb-2">Contact List ({report.records.length})</h4>
                            <div className="space-y-2">
                                {report.records.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{r.full_name}</p>
                                            <p className="text-xs text-gray-400">{r.phone_number} · {r.command_name}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${STATUS_COLORS[r.status]}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} Faith Tabernacle Security Service Unit</p>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------
// COMMAND STATS TAB (full access only)
// -------------------------------------------------------
function CommandsTab({ member }) {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api(member.id, 'command_stats').then(d => {
            if (d.success) setStats(d.stats);
            setLoading(false);
        });
    }, []);

    const filtered = stats.filter(s =>
        s.command_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-3">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search command..."
                className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm" />

            {loading ? <Spinner /> : filtered.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-gray-400 text-sm">No data yet</p>
                </div>
            ) : (
                filtered.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-gray-800 text-sm">{s.command_name}</p>
                            <span className="text-lg font-bold text-green-700">{s.total}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center">
                            {[
                                { label: 'Recruit', value: s.recruit_count, color: 'text-blue-600' },
                                { label: 'Training', value: s.training_count, color: 'text-yellow-600' },
                                { label: 'Deployed', value: s.deployed_count, color: 'text-green-700' },
                                { label: 'Dropped', value: s.dropped_count, color: 'text-red-600' },
                            ].map(st => (
                                <div key={st.label}>
                                    <p className={`text-sm font-bold ${st.color}`}>{st.value || 0}</p>
                                    <p className="text-xs text-gray-400">{st.label}</p>
                                </div>
                            ))}
                        </div>
                        {s.last_submission && (
                            <p className="text-xs text-gray-400 mt-2">Last: {fmtDate(s.last_submission)}</p>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

// -------------------------------------------------------
// TRAINING STATUS TAB (full access only)
// -------------------------------------------------------
function TrainingTab({ member }) {
    const [recruits, setRecruits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        api(member.id, 'training_status').then(d => {
            if (d.success) setRecruits(d.recruits);
            setLoading(false);
        });
    }, []);

    const filtered = filter === 'all' ? recruits : recruits.filter(r => r.status === filter);

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                {['all', 'recruit', 'training'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === f ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200'
                            }`}>
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
                <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} people</span>
            </div>

            {loading ? <Spinner /> : filtered.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-gray-400 text-sm">No records</p>
                </div>
            ) : (
                filtered.map(r => (
                    <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="font-bold text-gray-800 truncate">{r.full_name}</p>
                                <p className="text-xs text-gray-500">{r.command_name}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Registered: {fmtDate(r.registration_date)}
                                </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${STATUS_COLORS[r.status]}`}>
                                {r.status}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// -------------------------------------------------------
// Shared spinner
// -------------------------------------------------------
function Spinner() {
    return (
        <div className="flex justify-center py-10">
            <svg className="animate-spin w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    );
}