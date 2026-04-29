import React, { useState, useEffect } from 'react';

export default function InstallButton() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            setShowButton(false);
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            setShowButton(true);
            console.log('Install prompt captured');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Also check if it's already installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowButton(false);
            setInstallPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            // Manual installation instructions for browsers that don't support auto-install
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);

            if (isIOS) {
                alert('📱 To install on iPhone/iPad:\n\n1. Tap the Share button (📤)\n2. Scroll down\n3. Tap "Add to Home Screen"\n4. Tap "Add" in the top right');
            } else if (isAndroid) {
                alert('📱 To install on Android:\n\n1. Tap the Chrome menu (⋮)\n2. Scroll down\n3. Tap "Install app"\n4. Tap "Install"');
            } else {
                alert('💻 To install on Desktop:\n\nLook for the install icon (➕) in the address bar\nor click the menu (⋮) and select "Install..."');
            }
            return;
        }

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setShowButton(false);
            setIsInstalled(true);
        } else {
            console.log('User dismissed the install prompt');
        }

        setInstallPrompt(null);
    };

    if (!showButton || isInstalled) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50">
            <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 animate-bounce"
                style={{ animation: 'bounce 2s infinite' }}
            >
                <span className="text-xl">📱</span>
                <span className="font-semibold">Install App</span>
            </button>

            <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
}