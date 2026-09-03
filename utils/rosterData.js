// ================================================================
// FTSSU Posting Roster Data & Logic
// Roster: 21/06/2026 - 13/12/2026, per-Sunday (source: 'Updated Duty
// Roaster 31-05-26 to 22-11-26.xlsx' -- note the source file's own name
// covers an earlier range than its actual contents; the dates below are
// transcribed from the real table, 21/06/26 through 13/12/26)
// ================================================================

// Each entry: { date: 'YYYY-MM-DD', dress: 'BW'|'BT'|'CO'|'RELAX' }
export const ROSTER_SUNDAYS = [
    { date: "2026-06-21", dress: "CO" },
    { date: "2026-06-28", dress: "RELAX" },
    { date: "2026-07-05", dress: "BW" },
    { date: "2026-07-12", dress: "BT" },
    { date: "2026-07-19", dress: "CO" },
    { date: "2026-07-26", dress: "RELAX" },
    { date: "2026-08-02", dress: "BW" },
    { date: "2026-08-09", dress: "BT" },
    { date: "2026-08-16", dress: "BW" },
    { date: "2026-08-23", dress: "CO" },
    { date: "2026-08-30", dress: "RELAX" },
    { date: "2026-09-06", dress: "BW" },
    { date: "2026-09-13", dress: "BT" },
    { date: "2026-09-20", dress: "CO" },
    { date: "2026-09-27", dress: "RELAX" },
    { date: "2026-10-04", dress: "BW" },
    { date: "2026-10-11", dress: "BT" },
    { date: "2026-10-18", dress: "CO" },
    { date: "2026-10-25", dress: "RELAX" },
    { date: "2026-11-01", dress: "BW" },
    { date: "2026-11-08", dress: "BT" },
    { date: "2026-11-15", dress: "BW" },
    { date: "2026-11-22", dress: "CO" },
    { date: "2026-11-29", dress: "RELAX" },
    { date: "2026-12-06", dress: "BW" },
    { date: "2026-12-13", dress: "BT" },
];

// Roster: location -> command number assigned, one entry per Sunday above (same index)
export const ROSTER = {
    "LOC-1": [13, 13, 8, 8, 19, 19, 15, 15, 18, 18, 20, 20, 16, 16, 3, 3, 17, 17, 10, 10, 21, 21, 12, 12, 1, 1],
    "LOC-2": [2, 2, 16, 16, 17, 17, 4, 4, 8, 8, 14, 14, 21, 21, 6, 6, 7, 7, 15, 15, 22, 22, 11, 11, 5, 5],
    "LOC-3": [22, 22, 11, 11, 1, 1, 20, 20, 9, 9, 21, 21, 2, 2, 19, 19, 5, 5, 13, 13, 18, 18, 14, 14, 12, 12],
    "LOC-4": [18, 18, 20, 20, 5, 5, 11, 11, 12, 12, 3, 3, 17, 17, 18, 18, 13, 13, 7, 7, 14, 14, 4, 4, 8, 8],
    "LOC-5": [1, 1, 6, 6, 7, 7, 14, 14, 3, 3, 22, 22, 15, 15, 4, 4, 12, 12, 19, 19, 2, 2, 17, 17, 21, 21],
    "LOC-6": [16, 16, 10, 10, 8, 8, 21, 21, 14, 14, 1, 1, 7, 7, 10, 10, 9, 9, 12, 12, 11, 11, 22, 22, 4, 4],
    "LOC-7": [4, 4, 15, 15, 20, 20, 19, 19, 10, 10, 8, 8, 11, 11, 7, 7, 2, 2, 17, 17, 13, 13, 3, 3, 6, 6],
    "LOC-8": [3, 3, 18, 18, 21, 21, 7, 7, 1, 1, 6, 6, 12, 12, 16, 16, 4, 4, 20, 20, 15, 15, 8, 8, 10, 10],
    "LOC-9": [7, 7, 9, 9, 6, 6, 10, 10, 16, 16, 5, 5, 22, 22, 8, 8, 11, 11, 1, 1, 4, 4, 20, 20, 13, 13],
    "LOC-10": [19, 19, 17, 17, 13, 13, 22, 22, 15, 15, 7, 7, 9, 9, 21, 21, 14, 14, 16, 16, 10, 10, 6, 6, 2, 2],
    "LOC-11": [21, 21, 12, 12, 18, 18, 16, 16, 17, 17, 10, 10, 14, 14, 1, 1, 20, 20, 22, 22, 3, 3, 9, 9, 19, 19],
    "LOC-12": [5, 5, 4, 4, 22, 22, 3, 3, 6, 6, 11, 11, 19, 19, 9, 9, 21, 21, 2, 2, 7, 7, 1, 1, 18, 18],
    "LOC-13": [12, 12, 2, 2, 4, 4, 6, 6, 13, 13, 16, 16, 3, 3, 5, 5, 18, 18, 5, 5, 17, 17, 21, 21, 14, 14],
    "LOC-14": [9, 9, 7, 7, 14, 14, 17, 17, 20, 20, 15, 15, 18, 18, 12, 12, 19, 19, 4, 4, 8, 8, 5, 5, 22, 22],
    "LOC-15": [10, 10, 14, 14, 12, 12, 2, 2, 22, 22, 9, 9, 4, 4, 15, 15, 3, 3, 11, 11, 16, 16, 18, 18, 20, 20],
    "LOC-16": [15, 15, 21, 21, 9, 9, 13, 13, 19, 19, 17, 17, 5, 5, 14, 14, 8, 8, 6, 6, 1, 1, 16, 16, 11, 11],
    "LOC-17": [8, 8, 3, 3, 2, 2, 5, 5, 21, 21, 12, 12, 13, 13, 22, 22, 10, 10, 14, 14, 19, 19, 15, 15, 7, 7],
    "LOC-18": [14, 14, 22, 22, 11, 11, 1, 1, 4, 4, 18, 18, 20, 20, 2, 2, 6, 6, 9, 9, 5, 5, 10, 10, 17, 17],
    "LOC-19": [11, 11, 19, 19, 10, 10, 12, 12, 7, 7, 4, 4, 6, 6, 17, 17, 1, 1, 3, 3, 20, 20, 13, 13, 9, 9],
    "LOC-20": [17, 17, 1, 1, 3, 3, 9, 9, 5, 5, 2, 2, 8, 8, 13, 13, 16, 16, 18, 18, 6, 6, 2, 2, 3, 3],
    "LOC-21": [20, 20, 5, 5, 15, 15, 18, 18, 2, 2, 19, 19, 1, 1, 11, 11, 15, 15, 8, 8, 9, 9, 19, 19, 16, 16],
    "LOC-22": [6, 6, 13, 13, 16, 16, 8, 8, 11, 11, 13, 13, 10, 10, 20, 20, 22, 22, 21, 21, 12, 12, 7, 7, 15, 15],
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

// Note: if a month has 5 Sundays, the 3rd Sunday's uniform is B/W with
// scarf/long tie regardless of what the rotation would otherwise say --
// per the source roster's footnote. Special-event dress codes are
// communicated separately and aren't modeled here.

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
// Get the index into ROSTER_SUNDAYS for "this Sunday" -- the roster
// week runs Monday through Sunday, so any day Mon-Sun of a given week
// resolves to that week's Sunday entry.
// ----------------------------------------------------------------
export function getCurrentSundayIndex(refDate = new Date()) {
    const today = new Date(refDate);
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < ROSTER_SUNDAYS.length; i++) {
        const sunday = new Date(ROSTER_SUNDAYS[i].date);
        const monday = new Date(sunday);
        monday.setDate(sunday.getDate() - 6); // Monday of that week
        if (today >= monday && today <= sunday) return i;
    }
    return null; // Outside roster range
}

// ----------------------------------------------------------------
// Get dress code info for a specific Sunday index
// ----------------------------------------------------------------
export function getDressCode(sundayIdx) {
    const sunday = ROSTER_SUNDAYS[sundayIdx];
    if (!sunday) return null;
    return DRESS_LABELS[sunday.dress] || null;
}

// ----------------------------------------------------------------
// Get a command's location for a given Sunday index
// ----------------------------------------------------------------
export function getCommandLocation(commandNumber, sundayIdx) {
    for (const [loc, commands] of Object.entries(ROSTER)) {
        if (commands[sundayIdx] === commandNumber) return loc;
    }
    return null;
}

// ----------------------------------------------------------------
// Get all roster info for a command number across every Sunday
// ----------------------------------------------------------------
export function getCommandFullRoster(commandNumber) {
    return ROSTER_SUNDAYS.map((sunday, idx) => {
        const loc = getCommandLocation(commandNumber, idx);
        return {
            sundayIdx: idx,
            date: sunday.date,
            location: loc,
            locationName: LOCATIONS[loc] || loc,
            dress: DRESS_LABELS[sunday.dress],
            dressCode: sunday.dress,
        };
    });
}

// ----------------------------------------------------------------
// Get which command is at a location for a given Sunday index
// ----------------------------------------------------------------
export function getLocationCommand(locKey, sundayIdx) {
    const commands = ROSTER[locKey];
    if (!commands) return null;
    return commands[sundayIdx] || null;
}

// ----------------------------------------------------------------
// Format date for display: "Sun, 21 Jun 2026"
// ----------------------------------------------------------------
export function fmtSunday(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-NG", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric"
    });
}
