import { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const { addToast } = useToast();

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('tophits_cart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Erro ao carregar carrinho", e);
            }
        }
    }, []);

    // Update total and localStorage when cart changes
    useEffect(() => {
        const newTotal = cart.reduce((acc, item) => acc + Number(item.price), 0);
        setTotal(newTotal);
        localStorage.setItem('tophits_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        // Check if already in cart
        if (cart.find(item => item.id === product.id)) {
            addToast('Produto já está no carrinho!', 'info');
            return;
        }
        setCart([...cart, product]);
        addToast(`${product.title} adicionado!`, 'success');
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
        addToast('Item removido.', 'info');
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('tophits_cart');
    };

    return (
        <CartContext.Provider value={{ cart, total, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
