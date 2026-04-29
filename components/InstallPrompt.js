import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for beforeinstallprompt event
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted install');
            setShowInstallPrompt(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('installPromptDismissed', Date.now());
    };

    if (!showInstallPrompt || isInstalled) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border-2 border-red-600 z-50 animate-slide-up">
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">FT</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Install FTSSU App</h3>
                            <p className="text-xs text-gray-500">Get a better experience</p>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 text-xl">
                        &times;
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Install our app for quick access to orders, attendance tracking, and announcements.
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={handleInstall}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                    >
                        📱 Install App
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}