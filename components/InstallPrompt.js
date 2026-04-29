import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            setShowInstallButton(false);
            return;
        }

        // Check if dismissed before (store in localStorage)
        const dismissed = localStorage.getItem('installPromptDismissed');
        const dismissedDate = dismissed ? parseInt(dismissed) : 0;
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (dismissed && (Date.now() - dismissedDate) < oneWeek) {
            setShowInstallButton(false);
            return;
        }

        // Listen for beforeinstallprompt event
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // If no deferred prompt, show instructions
            showManualInstructions();
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted install');
            setShowInstallButton(false);
        }

        setDeferredPrompt(null);
    };

    const showManualInstructions = () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
            alert('To install on iOS:\n\n1. Tap the Share button (📤)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"');
        } else if (/Android/.test(navigator.userAgent)) {
            alert('To install on Android:\n\n1. Tap the menu (three dots ⋮)\n2. Tap "Install app"\n3. Tap "Install"');
        } else {
            alert('To install on Desktop:\n\n1. Look for the install icon (➕) in the address bar\n2. Click "Install"');
        }
    };

    const handleDismiss = () => {
        setShowInstallButton(false);
        localStorage.setItem('installPromptDismissed', Date.now().toString());
    };

    if (isInstalled) return null;
    if (!showInstallButton) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-2xl z-50 animate-slide-up">
            <div className="p-4 text-white">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-bold text-lg">FT</span>
                        </div>
                        <div>
                            <h3 className="font-bold">Install FTSSU App</h3>
                            <p className="text-xs text-red-200">Get app-like experience</p>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="text-white/80 hover:text-white text-xl">
                        &times;
                    </button>
                </div>

                <p className="text-sm text-red-100 mb-4">
                    Install our app for faster access, offline support, and push notifications.
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={handleInstall}
                        className="flex-1 bg-white text-red-600 py-2 rounded-lg font-semibold hover:bg-gray-100"
                    >
                        📱 Install App
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="flex-1 bg-red-800 text-white py-2 rounded-lg font-semibold hover:bg-red-900"
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