import { useState } from 'react';

const CATEGORIES = ['Operations', 'Administration', 'Welfare', 'General'];
const PRIORITIES = [
    { value: 'High', label: 'High', color: 'bg-red-100 text-red-700 border-red-300', dot: 'bg-red-500' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-500' },
    { value: 'Low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-300', dot: 'bg-green-500' },
];
const TYPES = ['Observation', 'Recommendation'];

const CATEGORY_ICONS = {
    Operations: '⚙️',
    Administration: '📋',
    Welfare: '❤️',
    General: '💬',
};

export default function ObservationForm() {
    const [form, setForm] = useState({
        type: '',
        category: '',
        priority: '',
        content: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const charLimit = 2000;

    const handleSubmit = async () => {
        setError('');

        if (!form.type) { setError('Please select a type.'); return; }
        if (!form.category) { setError('Please select a category.'); return; }
        if (!form.priority) { setError('Please select a priority level.'); return; }
        if (form.content.trim().length < 10) {
            setError('Please provide more detail (at least 10 characters).');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/observations.php?action=submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Submission failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        }
        setSubmitting(false);
    };

    const handleReset = () => {
        setForm({ type: '', category: '', priority: '', content: '' });
        setSubmitted(false);
        setError('');
    };

    // Success screen
    if (submitted) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Submitted Successfully</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Your {form.type.toLowerCase()} has been submitted anonymously.
                    Leadership will review it shortly. Thank you for helping us improve.
                </p>
                <button onClick={handleReset}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                    Submit Another
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Anonymous notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <span className="text-2xl flex-shrink-0">🔒</span>
                <div>
                    <p className="font-bold text-blue-800 text-sm">100% Anonymous</p>
                    <p className="text-blue-600 text-xs mt-0.5 leading-relaxed">
                        Your identity is never recorded or attached to your submission.
                        Please feel free to share honestly — your feedback helps us grow.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-5">

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Type */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        What are you submitting? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {TYPES.map(t => (
                            <button key={t} type="button"
                                onClick={() => setForm(f => ({ ...f, type: t }))}
                                className={`py-3 rounded-xl border-2 text-sm font-semibold transition ${form.type === t
                                        ? 'border-red-600 bg-red-50 text-red-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}>
                                {t === 'Observation' ? '👁️' : '💡'} {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map(c => (
                            <button key={c} type="button"
                                onClick={() => setForm(f => ({ ...f, category: c }))}
                                className={`py-3 px-3 rounded-xl border-2 text-sm font-semibold transition text-left flex items-center gap-2 ${form.category === c
                                        ? 'border-red-600 bg-red-50 text-red-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}>
                                <span>{CATEGORY_ICONS[c]}</span>
                                <span>{c}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Priority Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {PRIORITIES.map(p => (
                            <button key={p.value} type="button"
                                onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                                className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition flex items-center justify-center gap-1.5 ${form.priority === p.value
                                        ? `border-current ${p.color}`
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}>
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${form.priority === p.value ? p.dot : 'bg-gray-300'
                                    }`} />
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                        High = urgent issue · Medium = important · Low = general feedback
                    </p>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Your {form.type || 'Observation / Recommendation'} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={form.content}
                        onChange={e => {
                            if (e.target.value.length <= charLimit)
                                setForm(f => ({ ...f, content: e.target.value }))
                        }}
                        rows={5}
                        placeholder="Share your observation or recommendation here. Be as specific as possible — details help leadership take action."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                    />
                    <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-400">Minimum 10 characters</p>
                        <p className={`text-xs ${form.content.length > charLimit * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                            {form.content.length}/{charLimit}
                        </p>
                    </div>
                </div>

                {/* Submit */}
                <button onClick={handleSubmit} disabled={submitting}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                    {submitting ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Submitting...
                        </>
                    ) : '🔒 Submit Anonymously'}
                </button>
            </div>
        </div>
    );
}