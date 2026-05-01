import { useState, useEffect } from 'react';

export default function UpdatePrompt() {
    const [showUpdate, setShowUpdate] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState(null);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleSWUpdate = (registration) => {
            // A new SW is waiting to activate
            if (registration.waiting) {
                setWaitingWorker(registration.waiting);
                setShowUpdate(true);
            }
        };

        navigator.serviceWorker.ready.then(registration => {
            // Check if there's already a waiting SW on load
            if (registration.waiting) {
                setWaitingWorker(registration.waiting);
                setShowUpdate(true);
            }

            // Listen for new SW found
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (
                        newWorker.state === 'installed' &&
                        navigator.serviceWorker.controller
                    ) {
                        // New SW installed and waiting
                        setWaitingWorker(newWorker);
                        setShowUpdate(true);
                        console.log('[UpdatePrompt] New version available');
                    }
                });
            });
        });

        // When SW activates (after skipWaiting), reload the page
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                console.log('[UpdatePrompt] New SW activated, reloading...');
                window.location.reload();
            }
        });

    }, []);

    const handleUpdate = () => {
        if (!waitingWorker) return;
        // Tell the waiting SW to skip waiting and activate immediately
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        setShowUpdate(false);
    };

    const handleDismiss = () => {
        setShowUpdate(false);
    };

    if (!showUpdate) return null;

    return (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
            <div className="bg-white border-l-4 border-red-600 rounded-xl shadow-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔄</span>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Update Available</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                A new version of FTSSU is ready.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
                    >
                        &times;
                    </button>
                </div>

                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 py-2 px-3 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="flex-1 py-2 px-3 text-xs bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Update Now
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-down {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-down {
                    animation: slide-down 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}