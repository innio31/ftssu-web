import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import InstallPrompt from '../components/InstallPrompt';
import UpdatePrompt from '../components/UpdatePrompt';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('[App] Service Worker registered, scope:', registration.scope);
                    })
                    .catch(error => {
                        console.error('[App] Service Worker registration failed:', error);
                    });
            });
        }

        // Track visit count
        const visits = parseInt(localStorage.getItem('ftssu_visits') || '0') + 1;
        localStorage.setItem('ftssu_visits', visits.toString());
        console.log('[App] Visit count:', visits);

    }, []);

    return (
        <AuthProvider>
            <CartProvider>
                <Component {...pageProps} />
                <InstallPrompt />
                <UpdatePrompt />
            </CartProvider>
        </AuthProvider>
    );
}

export default MyApp;