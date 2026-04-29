import React, { useState, useEffect } from 'react';

export default function UpdateNotification() {
    const [showUpdate, setShowUpdate] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setShowUpdate(true);
                        }
                    });
                });
            });
        }
    }, []);

    const handleUpdate = () => {
        window.location.reload();
    };

    if (!showUpdate) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-xl shadow-2xl z-50 animate-slide-up">
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">New Update Available!</h3>
                    <button onClick={() => setShowUpdate(false)} className="text-white/80 hover:text-white">
                        ✕
                    </button>
                </div>
                <p className="text-sm text-blue-100 mb-3">
                    A new version of FTSSU is available. Please update for the best experience.
                </p>
                <button
                    onClick={handleUpdate}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 flex items-center gap-2"
                >
                    🔄 Update Now
                </button>
            </div>
        </div>
    );
}