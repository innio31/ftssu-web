import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import InstallPrompt from '../components/InstallPrompt';
import UpdateNotification from '../components/UpdateNotification';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    return (
        <AuthProvider>
            <CartProvider>
                <Component {...pageProps} />
                <InstallPrompt />
                <UpdateNotification />
            </CartProvider>
        </AuthProvider>
    );
}

export default MyApp;