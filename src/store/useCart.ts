import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    name: string
    price: number
    imageUrl: string
    unit: string
    quantity: number
}

interface CartState {
    items: Record<string, CartItem>
    addItem: (product: { id: string; name: string; price: number; imageUrl: string; unit: string }) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    getTotal: () => number
    getItemCount: () => number
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: {},
            addItem: (product) => set((state) => {
                const existingItem = state.items[product.id]
                if (existingItem) {
                    return {
                        items: {
                            ...state.items,
                            [product.id]: {
                                ...existingItem,
                                quantity: existingItem.quantity + 1
                            }
                        }
                    }
                }
                return {
                    items: {
                        ...state.items,
                        [product.id]: {
                            ...product,
                            quantity: 1
                        }
                    }
                }
            }),
            removeItem: (id) => set((state) => {
                const newItems = { ...state.items }
                delete newItems[id]
                return { items: newItems }
            }),
            updateQuantity: (id, quantity) => set((state) => {
                if (quantity <= 0) {
                    const newItems = { ...state.items }
                    delete newItems[id]
                    return { items: newItems }
                }
                return {
                    items: {
                        ...state.items,
                        [id]: {
                            ...state.items[id],
                            quantity
                        }
                    }
                }
            }),
            clearCart: () => set({ items: {} }),
            getTotal: () => {
                const items = Object.values(get().items)
                return items.reduce((total, item) => total + item.price * item.quantity, 0)
            },
            getItemCount: () => {
                const items = Object.values(get().items)
                return items.reduce((count, item) => count + item.quantity, 0)
            }
        }),
        {
            name: 'grocery-cart-storage',
        }
    )
)
