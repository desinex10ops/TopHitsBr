import * as React from 'react';
import { useToast } from '@/contexts/ToastContext';

const CartContext = React.createContext();

export const useCart = () => React.useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const { addToast } = useToast();

    const [coupon, setCoupon] = React.useState(null);
    const [discount, setDiscount] = React.useState(0);

    // Load cart and coupon from localStorage on mount
    React.useEffect(() => {
        const storedCart = localStorage.getItem('tophits_cart');
        const storedCoupon = localStorage.getItem('tophits_coupon');

        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) { console.error("Erro ao carregar carrinho", e); }
        }
        if (storedCoupon) {
            try {
                setCoupon(JSON.parse(storedCoupon));
            } catch (e) { console.error("Erro ao carregar cupom", e); }
        }
    }, []);

    // Update total and localStorage when cart or coupon changes
    React.useEffect(() => {
        let subtotal = cart.reduce((acc, item) => acc + Number(item.price), 0);
        let discVal = 0;

        if (coupon) {
            // Calculate discount based on coupon rules
            // If coupon has producerId, only apply to items from that producer
            // If coupon has productId, only apply to that product

            cart.forEach(item => {
                let applies = false;

                // Rule 1: Specific Product
                if (coupon.productId && Number(coupon.productId) === Number(item.id)) {
                    applies = true;
                }
                // Rule 2: Specific Producer (and not specific product restricted, or matches)
                else if (coupon.producerId && !coupon.productId) {
                    if (item.Producer?.id === coupon.producerId || item.producerId === coupon.producerId) {
                        applies = true;
                    }
                }
                // Rule 3: Global (no producerId, no productId) - Applies to all? 
                // Currently our admin logic creates null/null for global.
                else if (!coupon.producerId && !coupon.productId) {
                    applies = true;
                }

                if (applies) {
                    const itemPrice = Number(item.price);
                    const itemDiscount = (itemPrice * coupon.discountPercentage) / 100;
                    discVal += itemDiscount;
                }
            });
        }

        setDiscount(discVal);
        setTotal(Math.max(0, subtotal - discVal));

        localStorage.setItem('tophits_cart', JSON.stringify(cart));
        if (coupon) {
            localStorage.setItem('tophits_coupon', JSON.stringify(coupon));
        } else {
            localStorage.removeItem('tophits_coupon');
        }
    }, [cart, coupon]);

    const addToCart = (product) => {
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
        setCoupon(null);
        setDiscount(0);
        localStorage.removeItem('tophits_cart');
        localStorage.removeItem('tophits_coupon');
    };

    const applyCoupon = async (code) => {
        try {
            // We need to import api here, or pass it? Contexts usually import services.
            // Let's assume we can import api from services.
            // But we need to make sure we don't have circular dep if api uses context (unlikely).
            const { default: api } = await import('../services/api');

            const response = await api.post('/marketing/coupons/validate', {
                code,
                totalValue: cart.reduce((acc, item) => acc + Number(item.price), 0)
            });

            if (response.data.valid) {
                setCoupon(response.data); // data contains discountPercentage, producerId, etc.
                addToast(`Cupom de ${response.data.discountPercentage}% aplicado!`, 'success');
                return true;
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || 'Cupom inválido.';
            addToast(msg, 'error');
            setCoupon(null);
            return false;
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
        addToast('Cupom removido.', 'info');
    };

    return (
        <CartContext.Provider value={{ cart, total, discount, coupon, addToCart, removeFromCart, clearCart, applyCoupon, removeCoupon }}>
            {children}
        </CartContext.Provider>
    );
};
