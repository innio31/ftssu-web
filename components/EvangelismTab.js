import { useState, useEffect } from 'react';

export default function EvangelismTab({ member }) {
    const [activeView, setActiveView] = useState('form');
    const [recruits, setRecruits] = useState([]);
    const [summary, setSummary] = useState({ total: 0, today: 0 });
    const [submitting, setSubmitting] = useState(false);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [duplicateMsg, setDuplicateMsg] = useState('');
    const [phoneWarning, setPhoneWarning] = useState('');
    const [checkingPhone, setCheckingPhone] = useState(false);
    const [phoneCheckTimeout, setPhoneCheckTimeout] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    const emptyForm = {
        full_name: '', phone_number: '', alternative_phone: '',
        email: '', address: '', notes: '', registration_date: today,
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        if (activeView === 'records') fetchRecords();
    }, [activeView]);

    const fetchRecords = async () => {
        setLoadingRecords(true);
        try {
            const res = await fetch(
                `/api/get_recruits.php?member_id=${member.id}&command_name=${encodeURIComponent(member.command)}`
            );
            const data = await res.json();
            if (data.success) {
                setRecruits(data.recruits);
                setSummary(data.summary);
            }
        } catch (err) {
            console.error('[Evangelism] Failed to load records:', err);
        }
        setLoadingRecords(false);
    };

    const handlePhoneChange = (value) => {
        setForm(f => ({ ...f, phone_number: value }));
        setPhoneWarning('');
        if (phoneCheckTimeout) clearTimeout(phoneCheckTimeout);

        if (value.length >= 10) {
            setCheckingPhone(true);
            const t = setTimeout(async () => {
                try {
                    const res = await fetch('/api/check_recruit_phone.php?phone=' + encodeURIComponent(value));
                    const data = await res.json();
                    if (data.exists) setPhoneWarning(data.message);
                } catch (_) { }
                setCheckingPhone(false);
            }, 600);
            setPhoneCheckTimeout(t);
        }
    };

    const handleSubmit = async () => {
        setErrorMsg(''); setSuccessMsg(''); setDuplicateMsg('');

        if (!form.full_name.trim()) { setErrorMsg('Full name is required.'); return; }
        if (!form.phone_number.trim() || form.phone_number.length < 10) {
            setErrorMsg('A valid phone number is required.'); return;
        }
        if (phoneWarning) { setErrorMsg('Please resolve the duplicate phone number.'); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/submit_recruit.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    member_id: member.id,
                    command_name: member.command,
                    submitted_by_name: `${member.designation} ${member.first_name} ${member.last_name}`,
                })
            });
            const data = await res.json();

            if (data.success) {
                setSuccessMsg(`✅ ${form.full_name} submitted successfully!`);
                setForm(emptyForm);
                setPhoneWarning('');
                fetchRecords();
                setTimeout(() => setActiveView('records'), 1200);
            } else if (data.duplicate) {
                setDuplicateMsg(data.message);
            } else {
                setErrorMsg(data.message || 'Submission failed. Please try again.');
            }
        } catch (err) {
            setErrorMsg('Network error. Please check your connection.');
        }
        setSubmitting(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusColor = (status) => ({
        recruit: 'bg-blue-100 text-blue-700',
        training: 'bg-yellow-100 text-yellow-700',
        deployed: 'bg-green-100 text-green-700',
        dropped: 'bg-red-100 text-red-700',
    }[status] || 'bg-gray-100 text-gray-600');

    return (
        <div className="space-y-4">

            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">✝️</span>
                    <div>
                        <h2 className="font-bold text-lg">Evangelism Drive</h2>
                        <p className="text-green-100 text-sm">Command: <strong>{member.command}</strong></p>
                    </div>
                </div>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
                {['form', 'records'].map(v => (
                    <button key={v} onClick={() => setActiveView(v)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${activeView === v ? 'bg-white text-green-700 shadow' : 'text-gray-500'
                            }`}>
                        {v === 'form' ? '📝 New Contact' : '📋 Records'}
                    </button>
                ))}
            </div>

            {/* ---- FORM VIEW ---- */}
            {activeView === 'form' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">

                    {successMsg && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-700 text-sm font-semibold">{successMsg}</p>
                        </div>
                    )}
                    {errorMsg && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{errorMsg}</p>
                        </div>
                    )}
                    {duplicateMsg && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                            <p className="text-yellow-800 text-sm font-semibold">⚠️ Duplicate Detected</p>
                            <p className="text-yellow-700 text-xs mt-1">{duplicateMsg}</p>
                        </div>
                    )}

                    {/* Registration Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Registration Date <span className="text-red-500">*</span>
                        </label>
                        <input type="date" value={form.registration_date} max={today}
                            onChange={e => setForm(f => ({ ...f, registration_date: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input type="text" value={form.full_name} placeholder="Enter full name"
                            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input type="tel" value={form.phone_number} placeholder="080XXXXXXXX"
                            onChange={e => handlePhoneChange(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${phoneWarning ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                                }`} />
                        {checkingPhone && <p className="text-xs text-gray-400 mt-1">Checking...</p>}
                        {phoneWarning && (
                            <p className="text-xs text-yellow-700 mt-1 bg-yellow-50 p-2 rounded">⚠️ {phoneWarning}</p>
                        )}
                    </div>

                    {/* Alt Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Alternative Phone <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input type="tel" value={form.alternative_phone} placeholder="Optional"
                            onChange={e => setForm(f => ({ ...f, alternative_phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Email <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input type="email" value={form.email} placeholder="Optional"
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Address <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input type="text" value={form.address} placeholder="Optional"
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Notes <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea value={form.notes} rows={3} placeholder="Any additional information..."
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
                    </div>

                    <button onClick={handleSubmit} disabled={submitting || !!phoneWarning}
                        className="w-full bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-800 disabled:opacity-50 transition flex items-center justify-center gap-2">
                        {submitting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Submitting...
                            </>
                        ) : '✝️ Submit Contact'}
                    </button>
                </div>
            )}

            {/* ---- RECORDS VIEW ---- */}
            {activeView === 'records' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                            <p className="text-3xl font-bold text-green-700">{summary.total || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Total Contacts</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{summary.today || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Submitted Today</p>
                        </div>
                    </div>

                    {loadingRecords ? (
                        <div className="text-center py-10">
                            <svg className="animate-spin w-8 h-8 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <p className="text-gray-400 text-sm mt-2">Loading records...</p>
                        </div>
                    ) : recruits.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                            <p className="text-4xl mb-2">📭</p>
                            <p className="text-gray-500 text-sm">No contacts submitted yet for {member.command}</p>
                            <button onClick={() => setActiveView('form')}
                                className="mt-3 text-green-600 text-sm font-semibold">
                                Submit your first contact →
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-gray-400 text-center">Last 20 records — {member.command}</p>
                            {recruits.map(r => (
                                <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="font-bold text-gray-800 truncate">{r.full_name}</p>
                                            <p className="text-sm text-gray-500">{r.phone_number}</p>
                                            {r.alternative_phone && (
                                                <p className="text-xs text-gray-400">{r.alternative_phone}</p>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${getStatusColor(r.status)}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                    {r.address && <p className="text-xs text-gray-500 mt-1">📍 {r.address}</p>}
                                    {r.notes && <p className="text-xs text-gray-400 italic mt-1">"{r.notes}"</p>}
                                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-50">
                                        <p className="text-xs text-gray-400 truncate">{r.submitted_by_name}</p>
                                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(r.registration_date)}</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}