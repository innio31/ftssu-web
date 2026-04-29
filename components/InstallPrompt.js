import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        // Detect mobile devices
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const android = /Android/.test(navigator.userAgent);
        setIsIOS(ios);
        setIsAndroid(android);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user dismissed recently (7 days)
        const dismissed = localStorage.getItem('installBannerDismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
            return;
        }

        // Show banner after 3 seconds
        setTimeout(() => {
            setShowBanner(true);
        }, 3000);

        // Listen for install prompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            // Chrome/Android with install prompt
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowBanner(false);
                localStorage.removeItem('installBannerDismissed');
            }
            setDeferredPrompt(null);
        } else if (isIOS) {
            // iOS instructions
            alert('📱 To install FTSSU on your iPhone/iPad:\n\n1. Tap the Share button (📤) at the bottom\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right\n\nThe app icon will appear on your home screen!');
        } else if (isAndroid) {
            // Android instructions
            alert('📱 To install FTSSU on your Android:\n\n1. Tap the menu button (⋮) in Chrome\n2. Tap "Install app"\n3. Tap "Install"\n\nThe app will appear on your home screen!');
        } else {
            // Desktop instructions
            alert('💻 To install FTSSU on your computer:\n\n1. Look for the install icon (➕) in the address bar\n2. Click "Install"\n\nThe app will open in its own window!');
        }
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('installBannerDismissed', Date.now().toString());
    };

    if (isInstalled) return null;
    if (!showBanner) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-4 text-white">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold text-xl">FT</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Install FTSSU App</h3>
                                <p className="text-xs text-red-200">Get faster access and better experience</p>
                            </div>
                        </div>
                        <button onClick={handleDismiss} className="text-white/80 hover:text-white text-2xl leading-none">
                            &times;
                        </button>
                    </div>

                    <p className="text-sm text-red-100 mb-4">
                        Install our app for quick access to store, attendance, and announcements - just like a native app!
                    </p>

                    <button
                        onClick={handleInstall}
                        className="w-full bg-white text-red-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">📱</span>
                        {deferredPrompt ? 'Install Now' : (isIOS ? 'Add to Home Screen' : (isAndroid ? 'Install App' : 'Install App'))}
                    </button>

                    <p className="text-xs text-red-200 text-center mt-3">
                        {isIOS ? 'Tap Share → Add to Home Screen' : (isAndroid ? 'Chrome menu → Install app' : 'Look for install icon in address bar')}
                    </p>
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
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
        </div>
    );
}