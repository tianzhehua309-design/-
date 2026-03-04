'use client'

import { useCart } from '@/store/useCart'
import { ClientOnly } from '@/components/ClientOnly'
import { ShoppingCart, X, Plus, Minus } from 'lucide-react'
import { useState } from 'react'

export function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCart()

    const cartItems = Object.values(items)
    const total = getTotal()
    const itemCount = getItemCount()

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-slate-800 text-white shadow-xl shadow-slate-800/20 rounded-full py-3 px-6 flex items-center justify-between transition-transform active:scale-95"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ShoppingCart size={20} />
                            <ClientOnly>
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                        {itemCount}
                                    </span>
                                )}
                            </ClientOnly>
                        </div>
                        <span className="font-medium text-sm">购物车</span>
                    </div>
                    <ClientOnly>
                        {itemCount > 0 ? (
                            <span className="font-bold">¥{total.toFixed(2)}</span>
                        ) : (
                            <span className="opacity-70 text-sm">空空如也</span>
                        )}
                    </ClientOnly>
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-md h-[85vh] mt-auto bg-white rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <h2 className="font-semibold text-lg text-slate-800">已选商品</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
                            <ClientOnly>
                                {cartItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <ShoppingCart size={48} className="mb-4 opacity-20" />
                                        <p>购物车还没有商品哦</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-3">
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                                                    <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <h4 className="text-sm font-medium text-slate-800 line-clamp-1">{item.name}</h4>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-primary font-bold">¥{item.price.toFixed(2)}</span>
                                                            <span className="text-[10px] text-slate-400">/ {item.unit || '个'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:bg-slate-50"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white active:bg-primary-dark shadow-sm shadow-primary/30"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ClientOnly>
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-white">
                            <ClientOnly>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-500">合计</span>
                                    <span className="text-2xl font-bold text-slate-800">¥{total.toFixed(2)}</span>
                                </div>
                                <button
                                    disabled={itemCount === 0}
                                    onClick={() => {
                                        setIsOpen(false)
                                        window.location.href = '/checkout'
                                    }}
                                    className="w-full py-3.5 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/25 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-[0.98]"
                                >
                                    去结算
                                </button>
                            </ClientOnly>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
