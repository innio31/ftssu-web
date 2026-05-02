import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    ROSTER_PERIODS,
    ROSTER,
    LOCATIONS,
    DRESS_LABELS,
    getCurrentPeriodIndex,
    getCommandNumber,
    getCommandLocation,
    getCommandFullRoster,
    getLocationCommand,
    isNumericalCommand,
    fmtSunday,
} from '../../utils/rosterData';

// Admin roles that can see location lookup
const ADMIN_ROLES = ['IT Admin', 'Admin', 'Alpha Gulf Serial', 'Gulf Serial', 'Senior Commander I', 'Senior Commander II'];

export default function RosterPage() {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [activeTab, setActiveTab] = useState('myRoster');
    const currentPeriodIdx = getCurrentPeriodIndex();

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
                    {currentPeriodIdx !== null && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            Period {currentPeriodIdx + 1} Active
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
                {activeTab === 'myRoster' && <MyRosterTab member={member} cmdNum={cmdNum} isNumerical={isNumerical} currentPeriodIdx={currentPeriodIdx} />}
                {activeTab === 'fullRoster' && <FullRosterTab member={member} cmdNum={cmdNum} isNumerical={isNumerical} currentPeriodIdx={currentPeriodIdx} />}
                {activeTab === 'dressCode' && <DressCodeTab currentPeriodIdx={currentPeriodIdx} />}
                {activeTab === 'lookup' && isAdmin && <LocationLookupTab currentPeriodIdx={currentPeriodIdx} />}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------
// MY ROSTER TAB — personalised schedule for logged-in member
// ----------------------------------------------------------------
function MyRosterTab({ member, cmdNum, isNumerical, currentPeriodIdx }) {
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
                <DressCodeTab currentPeriodIdx={currentPeriodIdx} />
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
                const isCurrent = idx === currentPeriodIdx;
                return (
                    <div key={idx}
                        className={`rounded-xl border shadow-sm overflow-hidden ${isCurrent ? 'border-red-400 ring-2 ring-red-300' : 'border-gray-100 bg-white'
                            }`}>
                        {isCurrent && (
                            <div className="bg-red-600 px-3 py-1 text-center">
                                <span className="text-white text-xs font-bold">📍 CURRENT POSTING</span>
                            </div>
                        )}
                        <div className={`p-4 ${isCurrent ? 'bg-red-50' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xs text-gray-400">Period {idx + 1}</p>
                                    <p className="text-xs font-semibold text-gray-600">
                                        {fmtSunday(row.sunday1)} & {fmtSunday(row.sunday2)}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isCurrent ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {row.location}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-800 leading-tight">{row.locationName}</p>
                            <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
                                <div className="flex-1 text-center">
                                    <p className="text-xs text-gray-400">1st Sunday</p>
                                    <p className="text-xs font-semibold text-gray-700">
                                        {DRESS_LABELS[row.dressCode1]?.emoji} {DRESS_LABELS[row.dressCode1]?.short}
                                    </p>
                                </div>
                                <div className="w-px bg-gray-200" />
                                <div className="flex-1 text-center">
                                    <p className="text-xs text-gray-400">2nd Sunday</p>
                                    <p className="text-xs font-semibold text-gray-700">
                                        {DRESS_LABELS[row.dressCode2]?.emoji} {DRESS_LABELS[row.dressCode2]?.short}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ----------------------------------------------------------------
// FULL ROSTER TAB — all commands, all periods
// ----------------------------------------------------------------
function FullRosterTab({ cmdNum, isNumerical, currentPeriodIdx }) {
    const [selectedPeriod, setSelectedPeriod] = useState(
        currentPeriodIdx !== null ? currentPeriodIdx : 0
    );
    const period = ROSTER_PERIODS[selectedPeriod];

    return (
        <div className="space-y-3">
            {/* Period selector */}
            <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Select Period</label>
                <select value={selectedPeriod} onChange={e => setSelectedPeriod(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm">
                    {ROSTER_PERIODS.map((p, idx) => (
                        <option key={idx} value={idx}>
                            Period {idx + 1}: {fmtSunday(p.s1)} & {fmtSunday(p.s2)}
                            {idx === currentPeriodIdx ? ' ← Current' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Dress codes for selected period */}
            <div className="bg-gray-800 text-white rounded-xl p-3 flex gap-3">
                <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400">1st Sunday</p>
                    <p className="text-sm font-bold">{DRESS_LABELS[period.d1]?.emoji} {DRESS_LABELS[period.d1]?.short}</p>
                </div>
                <div className="w-px bg-gray-600" />
                <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400">2nd Sunday</p>
                    <p className="text-sm font-bold">{DRESS_LABELS[period.d2]?.emoji} {DRESS_LABELS[period.d2]?.short}</p>
                </div>
            </div>

            {/* Location list for this period */}
            <p className="text-xs text-gray-400 text-center">All 22 locations for this period</p>
            {Object.entries(ROSTER).map(([loc, commands]) => {
                const cmdInLoc = commands[selectedPeriod];
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
// DRESS CODE TAB — all periods dress code calendar
// ----------------------------------------------------------------
function DressCodeTab({ currentPeriodIdx }) {
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
                        <strong>Note:</strong> In months with 5 Sundays, the 3rd Sunday uniform is B/W (Black Suit & White Shirt with Long Tie/Scarf).
                    </p>
                </div>
            </div>

            {/* Full dress code schedule */}
            <p className="text-xs text-gray-400 text-center font-semibold uppercase tracking-wide">
                Full Dress Code Schedule
            </p>
            {ROSTER_PERIODS.map((period, idx) => {
                const isCurrent = idx === currentPeriodIdx;
                return (
                    <div key={idx}
                        className={`rounded-xl border shadow-sm overflow-hidden ${isCurrent ? 'border-red-400 ring-2 ring-red-300' : 'border-gray-100 bg-white'
                            }`}>
                        {isCurrent && (
                            <div className="bg-red-600 px-3 py-1 text-center">
                                <span className="text-white text-xs font-bold">CURRENT PERIOD</span>
                            </div>
                        )}
                        <div className={`p-3 ${isCurrent ? 'bg-red-50' : ''}`}>
                            <p className="text-xs text-gray-500 mb-2">
                                Period {idx + 1} · {fmtSunday(period.s1)} & {fmtSunday(period.s2)}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className={`rounded-lg p-2 text-center ${isCurrent ? 'bg-white' : 'bg-gray-50'}`}>
                                    <p className="text-xs text-gray-400 mb-1">1st Sunday</p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {DRESS_LABELS[period.d1]?.emoji} {DRESS_LABELS[period.d1]?.short}
                                    </p>
                                </div>
                                <div className={`rounded-lg p-2 text-center ${isCurrent ? 'bg-white' : 'bg-gray-50'}`}>
                                    <p className="text-xs text-gray-400 mb-1">2nd Sunday</p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {DRESS_LABELS[period.d2]?.emoji} {DRESS_LABELS[period.d2]?.short}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ----------------------------------------------------------------
// LOCATION LOOKUP TAB — admin: pick location, see all periods
// ----------------------------------------------------------------
function LocationLookupTab({ currentPeriodIdx }) {
    const [selectedLoc, setSelectedLoc] = useState('LOC-1');
    const [selectedPeriod, setSelectedPeriod] = useState(
        currentPeriodIdx !== null ? currentPeriodIdx : 0
    );
    const [viewMode, setViewMode] = useState('byLocation'); // 'byLocation' | 'byPeriod'

    const commands = ROSTER[selectedLoc] || [];
    const period = ROSTER_PERIODS[selectedPeriod];

    return (
        <div className="space-y-3">
            {/* Mode toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
                {[
                    { id: 'byLocation', label: '📍 By Location' },
                    { id: 'byPeriod', label: '📅 By Period' },
                ].map(m => (
                    <button key={m.id} onClick={() => setViewMode(m.id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${viewMode === m.id ? 'bg-white text-red-700 shadow' : 'text-gray-500'
                            }`}>
                        {m.label}
                    </button>
                ))}
            </div>

            {/* BY LOCATION: pick a location, see all periods */}
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
                    {ROSTER_PERIODS.map((p, idx) => {
                        const cmd = commands[idx];
                        const isCurrent = idx === currentPeriodIdx;
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
                                        <span className="text-xs text-gray-500">Period {idx + 1}</span>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {fmtSunday(p.s1)} & {fmtSunday(p.s2)}
                                        </p>
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

            {/* BY PERIOD: pick a period, see all locations */}
            {viewMode === 'byPeriod' && (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Select Period</label>
                        <select value={selectedPeriod} onChange={e => setSelectedPeriod(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm">
                            {ROSTER_PERIODS.map((p, idx) => (
                                <option key={idx} value={idx}>
                                    Period {idx + 1}: {fmtSunday(p.s1)} & {fmtSunday(p.s2)}
                                    {idx === currentPeriodIdx ? ' ← Current' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-gray-800 text-white rounded-xl p-3 text-center text-sm">
                        <p className="text-xs text-gray-400 mb-1">Dress Code for Period {selectedPeriod + 1}</p>
                        <p className="font-semibold">
                            1st: {DRESS_LABELS[period.d1]?.emoji} {DRESS_LABELS[period.d1]?.short}
                            &nbsp;·&nbsp;
                            2nd: {DRESS_LABELS[period.d2]?.emoji} {DRESS_LABELS[period.d2]?.short}
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
                                <p className="text-lg font-bold text-gray-800 flex-shrink-0">CMD {cmds[selectedPeriod]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}