import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    ROSTER_SUNDAYS,
    ROSTER,
    LOCATIONS,
    DRESS_LABELS,
    getCurrentSundayIndex,
    getCommandNumber,
    getCommandFullRoster,
    isNumericalCommand,
    fmtSunday,
} from '../../utils/rosterData';

// Admin roles that can see location lookup
const ADMIN_ROLES = ['IT Admin', 'Admin', 'Alpha Gulf Serial', 'Gulf Serial', 'Senior Commander I', 'Senior Commander II'];

export default function RosterPage() {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [activeTab, setActiveTab] = useState('myRoster');
    const currentSundayIdx = getCurrentSundayIndex();

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member');
        if (!stored) { router.push('/'); return; }
        setMember(JSON.parse(stored));
    }, []);

    if (!member) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
        </div>
    );

    const isAdmin = ADMIN_ROLES.includes(member.role);
    const cmdNum = getCommandNumber(member.command);
    const isNumerical = isNumericalCommand(member.command);

    const tabs = [
        { id: 'myRoster', label: '📋 My Roster', show: true },
        { id: 'fullRoster', label: '📅 Full Roster', show: true },
        { id: 'dressCode', label: '👔 Dress Codes', show: true },
        { id: 'lookup', label: '🔍 Location Lookup', show: isAdmin },
    ].filter(t => t.show);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-600 text-white px-4 py-4 sticky top-0 z-40 shadow">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/dashboard')}
                            className="p-1 rounded-lg hover:bg-white/20 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="font-bold text-base">Posting Roster</h1>
                            <p className="text-red-200 text-xs">{member.command}</p>
                        </div>
                    </div>
                    {currentSundayIdx !== null && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            This Sunday Active
                        </span>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === t.id ? 'bg-white text-red-700' : 'text-red-100 hover:bg-white/20'
                                }`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 max-w-2xl mx-auto">
                {activeTab === 'myRoster' && <MyRosterTab member={member} cmdNum={cmdNum} isNumerical={isNumerical} currentSundayIdx={currentSundayIdx} />}
                {activeTab === 'fullRoster' && <FullRosterTab cmdNum={cmdNum} isNumerical={isNumerical} currentSundayIdx={currentSundayIdx} />}
                {activeTab === 'dressCode' && <DressCodeTab currentSundayIdx={currentSundayIdx} />}
                {activeTab === 'lookup' && isAdmin && <LocationLookupTab currentSundayIdx={currentSundayIdx} />}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------
// MY ROSTER TAB — personalised schedule for logged-in member
// ----------------------------------------------------------------
function MyRosterTab({ member, cmdNum, isNumerical, currentSundayIdx }) {
    if (!isNumerical) {
        return (
            <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                    <p className="text-4xl mb-3">🎖️</p>
                    <h2 className="font-bold text-green-800 text-lg mb-2">Special Command</h2>
                    <p className="text-green-700 text-sm leading-relaxed">
                        <strong>{member.command}</strong> is a Special Command with a permanent designated station.
                    </p>
                    <p className="text-green-600 text-sm mt-2">
                        Report to your designated station as directed by the Control Centre.
                    </p>
                </div>
                <DressCodeTab currentSundayIdx={currentSundayIdx} />
            </div>
        );
    }

    const schedule = getCommandFullRoster(cmdNum);

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-400 text-center font-semibold uppercase tracking-wide">
                COMMAND {cmdNum} — Full Posting Schedule
            </p>

            {schedule.map((row, idx) => {
                const isCurrent = idx === currentSundayIdx;
                return (
                    <div key={idx}
                        className={`rounded-xl border shadow-sm overflow-hidden ${isCurrent ? 'border-red-400 ring-2 ring-red-300' : 'border-gray-100 bg-white'
                            }`}>
                        {isCurrent && (
                            <div className="bg-red-600 px-3 py-1 text-center">
                                <span className="text-white text-xs font-bold">📍 THIS SUNDAY</span>
                            </div>
                        )}
                        <div className={`p-4 ${isCurrent ? 'bg-red-50' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xs font-semibold text-gray-600">
                                        {fmtSunday(row.date)}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isCurrent ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {row.location}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-800 leading-tight">{row.locationName}</p>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                <span className="text-lg">{row.dress?.emoji}</span>
                                <p className="text-xs font-semibold text-gray-700">{row.dress?.short}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ----------------------------------------------------------------
// FULL ROSTER TAB — all commands, all Sundays
// ----------------------------------------------------------------
function FullRosterTab({ cmdNum, isNumerical, currentSundayIdx }) {
    const [selectedSunday, setSelectedSunday] = useState(
        currentSundayIdx !== null ? currentSundayIdx : 0
    );
    const sunday = ROSTER_SUNDAYS[selectedSunday];

    return (
        <div className="space-y-3">
            {/* Sunday selector */}
            <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Select Sunday</label>
                <select value={selectedSunday} onChange={e => setSelectedSunday(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm">
                    {ROSTER_SUNDAYS.map((s, idx) => (
                        <option key={idx} value={idx}>
                            {fmtSunday(s.date)}
                            {idx === currentSundayIdx ? ' ← This Sunday' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Dress code for selected Sunday */}
            <div className="bg-gray-800 text-white rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Dress Code</p>
                <p className="text-sm font-bold">{DRESS_LABELS[sunday.dress]?.emoji} {DRESS_LABELS[sunday.dress]?.short}</p>
            </div>

            {/* Location list for this Sunday */}
            <p className="text-xs text-gray-400 text-center">All 22 locations for this Sunday</p>
            {Object.entries(ROSTER).map(([loc, commands]) => {
                const cmdInLoc = commands[selectedSunday];
                const isMyCommand = isNumerical && cmdNum === cmdInLoc;
                return (
                    <div key={loc}
                        className={`bg-white rounded-xl border shadow-sm p-3 ${isMyCommand ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-100'
                            }`}>
                        <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-red-600 flex-shrink-0">{loc}</span>
                                    {isMyCommand && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                            YOUR COMMAND
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5 leading-tight">{LOCATIONS[loc]}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className="text-lg font-bold text-gray-800">CMD {cmdInLoc}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ----------------------------------------------------------------
// DRESS CODE TAB — all Sundays dress code calendar
// ----------------------------------------------------------------
function DressCodeTab({ currentSundayIdx }) {
    return (
        <div className="space-y-3">
            {/* Legend */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-bold text-gray-700 text-sm mb-3">Dress Code Key</h3>
                <div className="space-y-2">
                    {Object.entries(DRESS_LABELS).map(([code, info]) => (
                        <div key={code} className="flex items-center gap-3">
                            <span className="text-xl">{info.emoji}</span>
                            <div>
                                <span className="text-xs font-bold text-gray-800">{code} — </span>
                                <span className="text-xs text-gray-600">{info.full}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        <strong>Note:</strong> In months with 5 Sundays, the 3rd Sunday uniform is B/W (Black Suit & White Shirt with Long Tie/Scarf). Dress code for special events will be communicated separately.
                    </p>
                </div>
            </div>

            {/* Full dress code schedule */}
            <p className="text-xs text-gray-400 text-center font-semibold uppercase tracking-wide">
                Full Dress Code Schedule
            </p>
            {ROSTER_SUNDAYS.map((sunday, idx) => {
                const isCurrent = idx === currentSundayIdx;
                return (
                    <div key={idx}
                        className={`rounded-xl border shadow-sm overflow-hidden ${isCurrent ? 'border-red-400 ring-2 ring-red-300' : 'border-gray-100 bg-white'
                            }`}>
                        {isCurrent && (
                            <div className="bg-red-600 px-3 py-1 text-center">
                                <span className="text-white text-xs font-bold">THIS SUNDAY</span>
                            </div>
                        )}
                        <div className={`p-3 flex items-center justify-between ${isCurrent ? 'bg-red-50' : ''}`}>
                            <p className="text-xs text-gray-500">{fmtSunday(sunday.date)}</p>
                            <div className={`rounded-lg px-3 py-1.5 ${isCurrent ? 'bg-white' : 'bg-gray-50'}`}>
                                <p className="text-sm font-bold text-gray-800">
                                    {DRESS_LABELS[sunday.dress]?.emoji} {DRESS_LABELS[sunday.dress]?.short}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ----------------------------------------------------------------
// LOCATION LOOKUP TAB — admin: pick location, see all Sundays
// ----------------------------------------------------------------
function LocationLookupTab({ currentSundayIdx }) {
    const [selectedLoc, setSelectedLoc] = useState('LOC-1');
    const [selectedSunday, setSelectedSunday] = useState(
        currentSundayIdx !== null ? currentSundayIdx : 0
    );
    const [viewMode, setViewMode] = useState('byLocation'); // 'byLocation' | 'bySunday'

    const commands = ROSTER[selectedLoc] || [];
    const sunday = ROSTER_SUNDAYS[selectedSunday];

    return (
        <div className="space-y-3">
            {/* Mode toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
                {[
                    { id: 'byLocation', label: '📍 By Location' },
                    { id: 'bySunday', label: '📅 By Sunday' },
                ].map(m => (
                    <button key={m.id} onClick={() => setViewMode(m.id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${viewMode === m.id ? 'bg-white text-red-700 shadow' : 'text-gray-500'
                            }`}>
                        {m.label}
                    </button>
                ))}
            </div>

            {/* BY LOCATION: pick a location, see all Sundays */}
            {viewMode === 'byLocation' && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Select Location</label>
                        <select value={selectedLoc} onChange={e => setSelectedLoc(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm">
                            {Object.entries(LOCATIONS).map(([key, name]) => (
                                <option key={key} value={key}>{key} — {name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-red-700 mb-1">{selectedLoc}</p>
                        <p className="text-xs text-red-600">{LOCATIONS[selectedLoc]}</p>
                    </div>

                    <p className="text-xs text-gray-400 text-center">Commands serving at this location</p>
                    {ROSTER_SUNDAYS.map((s, idx) => {
                        const cmd = commands[idx];
                        const isCurrent = idx === currentSundayIdx;
                        return (
                            <div key={idx}
                                className={`bg-white rounded-xl border shadow-sm p-3 ${isCurrent ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-100'
                                    }`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        {isCurrent && (
                                            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold mr-2">
                                                NOW
                                            </span>
                                        )}
                                        <p className="text-xs text-gray-400 mt-0.5">{fmtSunday(s.date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-red-700">CMD {cmd}</p>
                                        <p className="text-xs text-gray-400">COMMAND {cmd}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* BY SUNDAY: pick a Sunday, see all locations */}
            {viewMode === 'bySunday' && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Select Sunday</label>
                        <select value={selectedSunday} onChange={e => setSelectedSunday(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm">
                            {ROSTER_SUNDAYS.map((s, idx) => (
                                <option key={idx} value={idx}>
                                    {fmtSunday(s.date)}
                                    {idx === currentSundayIdx ? ' ← This Sunday' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-gray-800 text-white rounded-xl p-3 text-center text-sm">
                        <p className="text-xs text-gray-400 mb-1">Dress Code for {fmtSunday(sunday.date)}</p>
                        <p className="font-semibold">
                            {DRESS_LABELS[sunday.dress]?.emoji} {DRESS_LABELS[sunday.dress]?.short}
                        </p>
                    </div>

                    <p className="text-xs text-gray-400 text-center">All locations & assigned commands</p>
                    {Object.entries(ROSTER).map(([loc, cmds]) => (
                        <div key={loc} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0 pr-2">
                                    <span className="text-xs font-bold text-red-600">{loc}</span>
                                    <p className="text-xs text-gray-600 mt-0.5 leading-tight">{LOCATIONS[loc]}</p>
                                </div>
                                <p className="text-lg font-bold text-gray-800 flex-shrink-0">CMD {cmds[selectedSunday]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
