import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import InstallButton from '../components/InstallButton';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered');
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }

        // Simulate user engagement to trigger install prompt faster
        // Track page views and clicks
        if (!localStorage.getItem('ftssu_visits')) {
            localStorage.setItem('ftssu_visits', '1');
        } else {
            let visits = parseInt(localStorage.getItem('ftssu_visits'));
            visits++;
            localStorage.setItem('ftssu_visits', visits.toString());
        }

        // Log visit for debugging
        console.log('Visit count:', localStorage.getItem('ftssu_visits'));

    }, []);

    return (
        <AuthProvider>
            <CartProvider>
                <Component {...pageProps} />
                <InstallButton />
            </CartProvider>
        </AuthProvider>
    );
}

export default MyApp;