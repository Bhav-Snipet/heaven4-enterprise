import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    isReward?: boolean; // Flag for reward redemptions — never sent to backend
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (menuItemId: number) => void;
    updateQuantity: (menuItemId: number, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (newItem: CartItem) => {
        setItems(current => {
            const existing = current.find(i => i.menuItemId === newItem.menuItemId);
            if (existing) {
                return current.map(i => i.menuItemId === newItem.menuItemId 
                    ? { ...i, quantity: i.quantity + newItem.quantity } 
                    : i);
            }
            return [...current, newItem];
        });
    };

    const removeFromCart = (menuItemId: number) => {
        setItems(current => current.filter(i => i.menuItemId !== menuItemId));
    };

    const updateQuantity = (menuItemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(menuItemId);
            return;
        }
        setItems(current => current.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i));
    };

    const clearCart = () => setItems([]);

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
