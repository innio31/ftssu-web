import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        loadCart();
    }, []);

    useEffect(() => {
        setCartCount(getTotalItems());
    }, [cartItems]);

    const loadCart = () => {
        try {
            const saved = localStorage.getItem('ftssu_cart');
            if (saved) {
                setCartItems(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const saveCart = (items) => {
        localStorage.setItem('ftssu_cart', JSON.stringify(items));
    };

    const addToCart = (product, quantity = 1, customAmount = null) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            let newItems;

            if (existing) {
                newItems = prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity, customAmount: customAmount || item.customAmount }
                        : item
                );
            } else {
                newItems = [...prev, { ...product, quantity, customAmount }];
            }

            saveCart(newItems);
            return newItems;
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => {
            const newItems = prev.filter(item => item.id !== productId);
            saveCart(newItems);
            return newItems;
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prev => {
            const newItems = prev.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            );
            saveCart(newItems);
            return newItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        saveCart([]);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((sum, item) => {
            if (item.has_custom_price) {
                return sum + (item.customAmount || 0);
            }
            return sum + (item.price * item.quantity);
        }, 0);
    };

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalPrice,
            getTotalItems,
        }}>
            {children}
        </CartContext.Provider>
    );
};