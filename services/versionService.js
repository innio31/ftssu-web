const API_BASE_URL = 'https://impactdigitalacademy.com.ng/ftssu/api';

export const versionService = {
    currentVersion: '1.0.0',

    checkForUpdate: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/get_version.php`);
            const data = await response.json();

            if (data.success && data.version !== versionService.currentVersion) {
                return { hasUpdate: true, newVersion: data.version };
            }

            return { hasUpdate: false };
        } catch (error) {
            console.error('Version check failed:', error);
            return { hasUpdate: false };
        }
    },

    registerServiceWorker: async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');

                // Check for updates every hour
                setInterval(() => {
                    registration.update();
                }, 3600000);

                // Listen for new service worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update available
                            if (confirm('New version available! Refresh to update?')) {
                                newWorker.postMessage('skipWaiting');
                                window.location.reload();
                            }
                        }
                    });
                });

            } catch (error) {
                console.error('Service worker registration failed:', error);
            }
        }
    }
};