'use client'

import { useCart } from '@/store/useCart'
import { ClientOnly } from '@/components/ClientOnly'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'


export default function CheckoutPage() {
    const router = useRouter()
    const { items, getTotal, clearCart } = useCart()
    const cartItems = Object.values(items)
    const total = getTotal()

    const [contactName, setContactName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [address, setAddress] = useState('')
    const [remark, setRemark] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cartItems.length === 0) return
        setIsSubmitting(true)

        const customerInfo = `称呼: ${contactName}\n电话: ${phoneNumber}\n地址/自提: ${address}\n备注: ${remark}`

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerInfo,
                    items: cartItems,
                    totalAmount: total
                })
            })

            if (res.ok) {
                clearCart()
                router.push('/success')
            } else {
                alert('提交订单失败，请稍后重试')
            }
        } catch (error) {
            console.error(error)
            alert('网络错误，请稍后重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-10 flex items-center justify-between">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-semibold text-lg text-slate-800 absolute left-1/2 -translate-x-1/2">确认订单</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            <main className="flex-1 p-4 pb-32 overflow-y-auto">
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-slate-100">
                    <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                        购物清单
                    </h2>
                    <ClientOnly>
                        {cartItems.length === 0 ? (
                            <p className="text-center text-slate-400 py-4 text-sm">暂无商品</p>
                        ) : (
                            <div className="space-y-3">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                                            <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">数量: {item.quantity}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-semibold text-slate-800">¥{(item.price * item.quantity).toFixed(2)}</span>
                                            <span className="text-[10px] text-slate-400">¥{item.price.toFixed(2)} / {item.unit || '个'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ClientOnly>
                </div>

                <form id="checkout-form" onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
                    <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                        收货信息
                    </h2>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">怎么称呼您 <span className="text-slate-400">(选填)</span></label>
                        <input
                            type="text"
                            placeholder="例如：张先生 / 李姐"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={contactName}
                            onChange={e => setContactName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">联系电话 <span className="text-red-400">*</span></label>
                        <input
                            required
                            type="tel"
                            placeholder="方便老板联系您（必填）"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">送货地址 / 自提说明 <span className="text-slate-400">(选填)</span></label>
                        <input
                            type="text"
                            placeholder="例如：3栋2单元501 / 晚8点到店自提"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">备注说明 (选填)</label>
                        <textarea
                            rows={2}
                            placeholder="例如：麻烦帮我挑两根新鲜的葱"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            value={remark}
                            onChange={e => setRemark(e.target.value)}
                        />
                    </div>
                </form>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe flex items-center justify-between z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <ClientOnly>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-0.5">共 {cartItems.length} 件商品</span>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-bold text-slate-800 leading-none">¥{total.toFixed(2)}</span>
                        </div>
                    </div>
                </ClientOnly>
                <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting || cartItems.length === 0}
                    className="bg-primary text-white font-medium py-3 px-8 rounded-full shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none min-w-[120px]"
                >
                    {isSubmitting ? '提交中...' : '提交订单'}
                </button>
            </div>
        </div>
    )
}
