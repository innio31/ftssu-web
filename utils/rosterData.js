// ================================================================
// FTSSU Posting Roster Data & Logic
// Roster: 21/12/2025 - 14/06/2026 (bi-weekly periods)
// ================================================================

// Each period: [sunday1_date, sunday2_date, dress_code_sunday1, dress_code_sunday2]
export const ROSTER_PERIODS = [
    { s1: "2025-12-21", s2: "2025-12-28", d1: "BW", d2: "RELAX" },
    { s1: "2026-01-04", s2: "2026-01-11", d1: "BW", d2: "BT" },
    { s1: "2026-01-18", s2: "2026-01-25", d1: "CO", d2: "RELAX" },
    { s1: "2026-02-01", s2: "2026-02-08", d1: "BW", d2: "BT" },
    { s1: "2026-02-15", s2: "2026-02-22", d1: "CO", d2: "RELAX" },
    { s1: "2026-03-01", s2: "2026-03-08", d1: "BW", d2: "BT" },
    { s1: "2026-03-15", s2: "2026-03-22", d1: "BW", d2: "CO" },
    { s1: "2026-03-29", s2: "2026-04-05", d1: "RELAX", d2: "BW" },
    { s1: "2026-04-12", s2: "2026-04-19", d1: "BT", d2: "CO" },
    { s1: "2026-04-26", s2: "2026-05-03", d1: "RELAX", d2: "BW" },
    { s1: "2026-05-10", s2: "2026-05-17", d1: "BT", d2: "BW" },
    { s1: "2026-05-24", s2: "2026-05-31", d1: "CO", d2: "RELAX" },
    { s1: "2026-06-07", s2: "2026-06-14", d1: "BW", d2: "BT" },
];

// Roster: location -> [command numbers per period index]
export const ROSTER = {
    "LOC-1": [11, 19, 10, 12, 7, 4, 6, 17, 1, 3, 20, 13, 9],
    "LOC-2": [17, 1, 3, 9, 5, 2, 8, 13, 16, 18, 6, 2, 3],
    "LOC-3": [20, 5, 15, 18, 2, 19, 1, 11, 15, 8, 9, 19, 16],
    "LOC-4": [6, 13, 16, 8, 11, 14, 10, 20, 22, 21, 12, 7, 15],
    "LOC-5": [12, 2, 4, 6, 13, 16, 3, 5, 7, 10, 17, 21, 14],
    "LOC-6": [9, 7, 14, 17, 20, 15, 18, 12, 19, 4, 8, 5, 22],
    "LOC-7": [10, 14, 12, 2, 22, 9, 4, 15, 3, 11, 16, 18, 20],
    "LOC-8": [18, 21, 9, 13, 19, 17, 5, 14, 8, 6, 1, 16, 11],
    "LOC-9": [8, 3, 2, 5, 21, 12, 13, 22, 10, 14, 19, 15, 7],
    "LOC-10": [14, 22, 11, 1, 4, 18, 20, 2, 6, 9, 5, 10, 17],
    "LOC-11": [4, 15, 20, 19, 10, 8, 11, 7, 2, 17, 13, 3, 6],
    "LOC-12": [3, 18, 17, 7, 1, 6, 12, 16, 4, 20, 15, 8, 10],
    "LOC-13": [7, 9, 6, 10, 16, 5, 22, 8, 11, 1, 4, 20, 13],
    "LOC-14": [19, 17, 13, 22, 15, 7, 9, 21, 14, 16, 10, 6, 2],
    "LOC-15": [21, 12, 18, 16, 17, 10, 14, 6, 20, 22, 3, 9, 19],
    "LOC-16": [5, 4, 22, 3, 6, 11, 19, 9, 21, 2, 7, 1, 18],
    "LOC-17": [13, 8, 19, 15, 18, 20, 16, 3, 17, 5, 21, 12, 1],
    "LOC-18": [2, 16, 21, 4, 8, 13, 17, 1, 18, 15, 22, 11, 5],
    "LOC-19": [22, 11, 1, 20, 9, 21, 2, 19, 5, 13, 18, 14, 12],
    "LOC-20": [15, 20, 5, 11, 12, 3, 21, 18, 13, 7, 14, 4, 8],
    "LOC-21": [1, 6, 7, 14, 3, 22, 15, 4, 12, 19, 2, 17, 21],
    "LOC-22": [16, 10, 8, 21, 14, 1, 7, 10, 9, 12, 11, 22, 4],
};

// Location full names
export const LOCATIONS = {
    "LOC-1": "HOPE DOWN & SURROUNDING CORRIDORS",
    "LOC-2": "LOVE DOWN & SURROUNDING CORRIDORS",
    "LOC-3": "FAITH DOWN & SURROUNDING CORRIDORS",
    "LOC-4": "HOPE WING GALLERY",
    "LOC-5": "LOVE WING GALLERY",
    "LOC-6": "FAITH WING GALLERY",
    "LOC-7": "CAR PARK IN FRONT OF HOPE WING ENTRANCE & OVERFLOW",
    "LOC-8": "BETWEEN HOPE - OVERFLOW, HONOUR INTERCEPTION",
    "LOC-9": "BETWEEN LOVE - OVERFLOW, HONOUR INTERCEPTION",
    "LOC-10": "FAITH WING OF CAR PARKS INTERCEPTION GLORY",
    "LOC-11": "HOPE WING OF CAR PARKS INTERCEPTION GLORY",
    "LOC-12": "FAITH OVERFLOW INTERCESSION GRACE",
    "LOC-13": "LOVE OVERFLOW INTERCESSION GRACE",
    "LOC-14": "WOFBI COMPLEX & CAR PARK BETWEEN MISSION LODGE & SECRETARIAT (C1/C2)",
    "LOC-15": "FRONT/SIDE GREEN PASTURE / CAR PARK D",
    "LOC-16": "SECRETARIAT, SURROUNDING CAR PARKS I",
    "LOC-17": "SECRETARIAT, CAR PARK II BEHIND YOUTH CHAPEL + MEDICAL INTERCEPTION CU GATE",
    "LOC-18": "CAR PARK H1 - CAR PARK BESIDE COVENANT UNIVERSITY GATE",
    "LOC-19": "CAR PARK H2 - BESIDE THE MAIN ENTRANCE GATE",
    "LOC-20": "SHOPPING COMPLEX & SURROUNDING CAR PARKS",
    "LOC-21": "CLMT CAR PARK - CAR PARK G1",
    "LOC-22": "CUSS",
};

// Dress code full descriptions
export const DRESS_LABELS = {
    BW: { short: "B/W + Long Tie", full: "Black Suit & White Shirt with Long Tie", emoji: "🎩" },
    BT: { short: "B/W + Bow Tie", full: "Black Suit & White Shirt with Bow Tie", emoji: "🎩" },
    CO: { short: "Corporate", full: "Corporate Attire with Tie", emoji: "👔" },
    RELAX: { short: "Smart Relax", full: "Smart Relaxed Attire", emoji: "👕" },
};

// Numerical commands (1-22)
export const NUMERICAL_COMMANDS = Array.from({ length: 22 }, (_, i) => `COMMAND ${i + 1}`);

// Special/fixed commands
export const SPECIAL_COMMANDS = [
    "SPECIAL DUTY 1", "SPECIAL DUTY 2", "SPECIAL DUTY 3", "SPECIAL DUTY 4", "SPECIAL DUTY 5",
    "VETERAN", "KHMS", "COVENANT DAY", "YOUTH", "RECRUITMENT & TRAINING", "HONOUR",
    "G & G", "GOSHEN", "CODE & ETHICS", "IID", "SID", "PATROL", "UPPER ROOM",
    "OPERATION", "IRS", "FORENSIC", "FRENCH", "SECURITY MEDICAL", "SALES MONITORING",
];

// ----------------------------------------------------------------
// Get the command number from a command name string
// e.g. "COMMAND 7" -> 7
// ----------------------------------------------------------------
export function getCommandNumber(commandName) {
    if (!commandName) return null;
    const match = commandName.match(/^COMMAND\s+(\d+)$/i);
    return match ? parseInt(match[1]) : null;
}

// ----------------------------------------------------------------
// Check if a command is numerical
// ----------------------------------------------------------------
export function isNumericalCommand(commandName) {
    return getCommandNumber(commandName) !== null;
}

// ----------------------------------------------------------------
// Get the current active period index based on today's date
// Period is active from Monday before sunday1 through the end of sunday2's week
// ----------------------------------------------------------------
export function getCurrentPeriodIndex(refDate = new Date()) {
    const today = new Date(refDate);
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < ROSTER_PERIODS.length; i++) {
        const { s1, s2 } = ROSTER_PERIODS[i];
        // Period starts on the Monday before s1 (alert shows from Monday)
        const sunday1 = new Date(s1);
        const monday = new Date(sunday1);
        monday.setDate(sunday1.getDate() - 6); // Monday before s1

        // Period ends on Saturday after s2
        const sunday2 = new Date(s2);
        const endSat = new Date(sunday2);
        endSat.setDate(sunday2.getDate() + 6);

        if (today >= monday && today <= endSat) return i;
    }
    return null; // Outside roster range
}

// ----------------------------------------------------------------
// Get the specific Sunday in the current period (1st or 2nd)
// Used to determine which dress code applies THIS Sunday
// ----------------------------------------------------------------
export function getThisSundayInPeriod(refDate = new Date()) {
    const today = new Date(refDate);
    today.setHours(0, 0, 0, 0);
    const periodIdx = getCurrentPeriodIndex(refDate);
    if (periodIdx === null) return null;

    const { s1, s2 } = ROSTER_PERIODS[periodIdx];
    const sunday1 = new Date(s1);
    const sunday2 = new Date(s2);

    // Mon-Sat before s1: upcoming is s1 (1st Sunday of period)
    // s1 itself or Mon after s1 up to s2: 1st sunday passed, next is s2
    if (today <= sunday1) return 1; // Still before or on s1
    return 2; // s1 passed, next is s2
}

// ----------------------------------------------------------------
// Get dress code for a specific Sunday in a period
// Accounts for 4 vs 5 Sunday months using the roster's pre-set codes
// ----------------------------------------------------------------
export function getDressCode(periodIdx, sundayNum) {
    const period = ROSTER_PERIODS[periodIdx];
    if (!period) return null;
    const code = sundayNum === 1 ? period.d1 : period.d2;
    return DRESS_LABELS[code] || null;
}

// ----------------------------------------------------------------
// Get a command's location for a given period index
// ----------------------------------------------------------------
export function getCommandLocation(commandNumber, periodIdx) {
    for (const [loc, commands] of Object.entries(ROSTER)) {
        if (commands[periodIdx] === commandNumber) return loc;
    }
    return null;
}

// ----------------------------------------------------------------
// Get all roster info for a command number across all periods
// ----------------------------------------------------------------
export function getCommandFullRoster(commandNumber) {
    return ROSTER_PERIODS.map((period, idx) => {
        const loc = getCommandLocation(commandNumber, idx);
        return {
            periodIdx: idx,
            sunday1: period.s1,
            sunday2: period.s2,
            location: loc,
            locationName: LOCATIONS[loc] || loc,
            dress1: DRESS_LABELS[period.d1],
            dress2: DRESS_LABELS[period.d2],
            dressCode1: period.d1,
            dressCode2: period.d2,
        };
    });
}

// ----------------------------------------------------------------
// Get which command is at a location for a given period
// ----------------------------------------------------------------
export function getLocationCommand(locKey, periodIdx) {
    const commands = ROSTER[locKey];
    if (!commands) return null;
    return commands[periodIdx] || null;
}

// ----------------------------------------------------------------
// Format date for display: "Sun, 04 Jan 2026"
// ----------------------------------------------------------------
export function fmtSunday(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-NG", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric"
    });
}