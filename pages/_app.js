import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import InstallPrompt from '../components/InstallPrompt';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }, []);

    return (
        <AuthProvider>
            <CartProvider>
                <Component {...pageProps} />
                <InstallPrompt />
            </CartProvider>
        </AuthProvider>
    );
}

export default MyApp;