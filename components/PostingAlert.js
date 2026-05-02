import { useEffect, useState, useRef } from 'react';
import {
    getCurrentPeriodIndex,
    getThisSundayInPeriod,
    getDressCode,
    getCommandNumber,
    getCommandLocation,
    isNumericalCommand,
    LOCATIONS,
    ROSTER_PERIODS,
    fmtSunday,
} from '../utils/rosterData';

export default function PostingAlert({ member }) {
    const [info, setInfo] = useState(null);
    const [visible, setVisible] = useState(true);
    const marqueeRef = useRef(null);

    useEffect(() => {
        if (!member?.command) return;

        const periodIdx = getCurrentPeriodIndex();
        if (periodIdx === null) { setVisible(false); return; }

        const sundayNum = getThisSundayInPeriod();
        const period = ROSTER_PERIODS[periodIdx];
        const dress = getDressCode(periodIdx, sundayNum);
        const numerical = isNumericalCommand(member.command);
        const cmdNum = getCommandNumber(member.command);

        if (numerical && cmdNum) {
            const locKey = getCommandLocation(cmdNum, periodIdx);
            const locName = LOCATIONS[locKey] || locKey;
            const nextSunday = sundayNum === 1 ? period.s1 : period.s2;

            setInfo({
                type: 'numerical',
                command: member.command,
                location: locKey,
                locName,
                dress,
                nextSunday,
                sundayNum,
            });
        } else {
            // Special command
            const nextSunday = sundayNum === 1 ? period.s1 : period.s2;
            setInfo({
                type: 'special',
                command: member.command,
                dress,
                nextSunday,
            });
        }
    }, [member]);

    if (!visible || !info) return null;

    const dressText = info.dress
        ? `${info.dress.emoji} Dress Code: ${info.dress.full}`
        : '';

    const alertText = info.type === 'numerical'
        ? `📍 ${info.command} — POSTING: ${info.location}: ${info.locName}  |  📅 Next Sunday: ${fmtSunday(info.nextSunday)}  |  ${dressText}  |  `
        : `🎖️ ${info.command} — You are on Special Command duty. Report to your designated station as directed by the Control Centre.  |  📅 Next Sunday: ${fmtSunday(info.nextSunday)}  |  ${dressText}  |  `;

    const bgColor = info.type === 'numerical' ? 'bg-red-700' : 'bg-green-800';

    return (
        <div className={`${bgColor} text-white overflow-hidden relative`} style={{ height: '36px' }}>
            {/* Close button */}
            <button
                onClick={() => setVisible(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white text-lg leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>

            {/* Marquee */}
            <div className="flex items-center h-full overflow-hidden">
                <div
                    ref={marqueeRef}
                    className="whitespace-nowrap text-sm font-medium pr-10"
                    style={{
                        display: 'inline-block',
                        animation: 'marquee 30s linear infinite',
                    }}
                >
                    {/* Repeat text so loop feels seamless */}
                    {alertText}{alertText}{alertText}
                </div>
            </div>

            <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
}