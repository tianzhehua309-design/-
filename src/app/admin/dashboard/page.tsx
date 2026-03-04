'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Store, LogOut, CheckCircle2, Clock, XCircle, RefreshCw, Volume2, VolumeX, Plus, Package, Layers, Printer } from 'lucide-react'
import { OrderReceipt } from '@/components/OrderReceipt'

interface Order {
    id: string
    customerInfo: string
    items: string
    totalAmount: number
    status: string
    createdAt: string
}

export default function AdminDashboard() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [soundEnabled, setSoundEnabled] = useState(false)
    const [printingOrder, setPrintingOrder] = useState<Order | null>(null)
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Track the ID of the most recent order we've seen
    const [lastSeenOrderId, setLastSeenOrderId] = useState<string | null>(null)

    const fetchOrders = async (isBackground = false) => {
        if (!isBackground) setLoading(true)
        try {
            const res = await fetch('/api/admin/orders')
            if (res.status === 401) {
                router.push('/admin')
                return
            }
            if (res.ok) {
                const data = await res.json()

                // Handle new order sound alert
                if (data.length > 0) {
                    const newestOrder = data[0]

                    // If we have a previous order ID, and the newest one is different, AND it's a new order (待处理)
                    if (lastSeenOrderId && newestOrder.id !== lastSeenOrderId && newestOrder.status === '待处理') {
                        if (soundEnabled && audioRef.current) {
                            audioRef.current.play().catch(e => console.log('Audio play failed:', e))
                        }
                    }

                    if (!lastSeenOrderId || newestOrder.id !== lastSeenOrderId) {
                        setLastSeenOrderId(newestOrder.id)
                    }
                }

                setOrders(data)
            }
        } catch (err) {
            console.error('Failed to fetch orders')
        } finally {
            if (!isBackground) setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()

        // Create audio element for notifications
        audioRef.current = new Audio('/sounds/new-order.ogg')

        // Poll for new orders every 10 seconds
        const interval = setInterval(() => fetchOrders(true), 10000)
        return () => clearInterval(interval)
    }, [lastSeenOrderId, soundEnabled]) // Re-bind interval when deps change to get fresh state

    const updateOrderStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                // Optimistic UI update
                setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
            }
        } catch (err) {
            alert('操作失败，请重试')
        }
    }

    const handleLogout = async () => {
        // A simple hack to clear the cookie from client side
        document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        router.push('/admin')
    }

    const handlePrint = (order: Order) => {
        let items: any[] = []
        try { items = JSON.parse(order.items) } catch { }
        const date = new Date(order.createdAt)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
        const itemRows = items.map(item => `
            <tr>
                <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:16px;">${item.name}</td>
                <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;font-size:16px;">×${item.quantity} ${item.unit || '个'}</td>
                <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-size:16px;">¥${item.price.toFixed(2)}</td>
                <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;font-size:16px;">¥${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`).join('')

        const receiptHtml = `<!DOCTYPE html><html><head>
            <meta charset="utf-8"/>
            <title>订单 #${order.id.slice(-8).toUpperCase()}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: Arial, sans-serif; padding: 40px; color: #111; font-size: 16px; }
                h1 { font-size: 32px; text-align: center; margin-bottom: 6px; }
                .subtitle { text-align: center; color: #666; margin-bottom: 28px; font-size: 15px; }
                .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
                .meta-box { background: #f5f5f5; padding: 16px 20px; border-radius: 8px; }
                .meta-box .label { font-size: 13px; color: #888; margin-bottom: 6px; }
                .meta-box .value { font-size: 18px; font-weight: bold; }
                .section-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; }
                .customer-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin-bottom: 24px; white-space: pre-wrap; line-height: 2; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
                thead th { background: #222; color: #fff; padding: 14px 8px; font-size: 15px; }
                thead th:first-child { text-align: left; }
                thead th:not(:first-child) { text-align: right; }
                thead th:nth-child(2) { text-align: center; }
                .total-row { display: flex; justify-content: flex-end; align-items: center; gap: 24px; padding: 20px; background: #f5f5f5; border-radius: 8px; margin-top: 12px; }
                .total-label { font-size: 22px; }
                .total-amount { font-size: 36px; font-weight: bold; }
                .footer { text-align: center; margin-top: 48px; color: #aaa; font-size: 14px; border-top: 1px dashed #ccc; padding-top: 20px; }
                hr.solid { border: none; border-top: 2px solid #333; margin: 24px 0; }
                hr.dash { border: none; border-top: 2px dashed #ccc; margin: 24px 0; }
                @media print { @page { size: A4; margin: 15mm; } body { padding: 0; } }
            </style>
        </head><body>
            <h1>老邻居杂货铺</h1>
            <div class="subtitle">线上下单，到店自提</div>
            <hr class="solid"/>
            <div class="meta-grid">
                <div class="meta-box"><div class="label">订单号</div><div class="value">#${order.id.slice(-8).toUpperCase()}</div></div>
                <div class="meta-box"><div class="label">日期</div><div class="value">${dateStr}</div></div>
                <div class="meta-box"><div class="label">时间</div><div class="value">${timeStr}</div></div>
            </div>
            <div class="section-title">顾客信息</div>
            <div class="customer-box">${order.customerInfo}</div>
            <div class="section-title">商品明细</div>
            <table>
                <thead><tr>
                    <th>商品名称</th>
                    <th style="text-align:center;">数量</th>
                    <th style="text-align:right;">单价</th>
                    <th style="text-align:right;">小计</th>
                </tr></thead>
                <tbody>${itemRows}</tbody>
            </table>
            <div class="total-row">
                <span class="total-label">合计：</span>
                <span class="total-amount">¥${order.totalAmount.toFixed(2)}</span>
            </div>
            <div class="footer">感谢您的惠顾！欢迎再次光临 · 老邻居杂货铺</div>
        </body></html>`

        const win = window.open('', '_blank', 'width=900,height=750')
        if (win) {
            win.document.write(receiptHtml)
            win.document.close()
            win.focus()
            setTimeout(() => {
                win.print()
                win.close()
            }, 300)
        }
    }

    // Parse items safely
    const parseItems = (itemsStr: string) => {
        try {
            return JSON.parse(itemsStr)
        } catch {
            return []
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case '待处理': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case '已完成': return 'bg-green-100 text-green-700 border-green-200'
            case '已取消': return 'bg-slate-100 text-slate-500 border-slate-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Store size={18} className="text-primary" />
                    </div>
                    <h1 className="font-bold text-slate-800">店主收银台</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 group"
                        title="商品管理"
                    >
                        <Package size={20} className="group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium mr-1 hidden sm:inline">商品管理</span>
                    </button>

                    <button
                        onClick={() => router.push('/admin/categories')}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 group"
                        title="分类管理"
                    >
                        <Layers size={20} className="group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium mr-1 hidden sm:inline">分类管理</span>
                    </button>

                    <button
                        onClick={() => {
                            if (!soundEnabled) {
                                // User interaction required to play audio first time in browsers
                                audioRef.current?.play().catch(() => { }).then(() => {
                                    if (audioRef.current) {
                                        audioRef.current.pause()
                                        audioRef.current.currentTime = 0
                                    }
                                })
                            }
                            setSoundEnabled(!soundEnabled)
                        }}
                        className={`p-2 rounded-full transition-colors ${soundEnabled ? 'text-primary bg-primary/10' : 'text-slate-400 bg-slate-100'}`}
                        title={soundEnabled ? '声音提醒已开' : '点击开启新订单声音提醒'}
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>

                    <button
                        onClick={() => fetchOrders()}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
                {!soundEnabled && (
                    <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm p-3 rounded-xl mb-4 flex items-start gap-2">
                        <VolumeX size={16} className="mt-0.5 flex-shrink-0" />
                        <p><strong>建议您开启声音提醒:</strong> 点击右上角的喇叭图标。当有新订单时，手机会自动发出“滴”声提醒您接单。</p>
                    </div>
                )}

                <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                    <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 flex-1 min-w-[120px]">
                        <div className="text-sm text-slate-500 mb-1">今日待处理</div>
                        <div className="text-2xl font-bold text-slate-800">
                            {orders.filter(o => o.status === '待处理').length}
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 flex-1 min-w-[120px]">
                        <div className="text-sm text-slate-500 mb-1">今日已完成</div>
                        <div className="text-2xl font-bold text-slate-800">
                            {orders.filter(o => o.status === '已完成').length}
                        </div>
                    </div>
                </div>

                <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 px-1">
                    <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                    订单列表
                </h2>

                {loading && orders.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">加载中...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        暂无订单
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const items = parseItems(order.items)
                            const date = new Date(order.createdAt)
                            const timeString = `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                    {/* Order Header */}
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-md border font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <span className="text-xs text-slate-400">{timeString}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-800">¥{order.totalAmount.toFixed(2)}</span>
                                            <button
                                                onClick={() => handlePrint(order)}
                                                title="打印小票"
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 font-mono text-sm">
                                        <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                                            {order.customerInfo}
                                        </pre>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4">
                                        <div className="space-y-3">
                                            {items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                    <div className="flex gap-2 text-slate-700 max-w-[70%]">
                                                        <span className="text-slate-400 font-mono">x{item.quantity}</span>
                                                        <span className="line-clamp-2">{item.name}</span>
                                                        <span className="text-[10px] text-slate-400 mt-0.5">/ {item.unit || '个'}</span>
                                                    </div>
                                                    <span className="font-medium text-slate-600">¥{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {order.status === '待处理' && (
                                        <div className="p-4 pt-0 flex gap-3">
                                            <button
                                                onClick={() => updateOrderStatus(order.id, '已取消')}
                                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1 text-sm"
                                            >
                                                <XCircle size={16} /> 退单/取消
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, '已完成')}
                                                className="flex-[2] py-2.5 rounded-xl bg-primary text-white font-medium shadow-md shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle2 size={18} /> 标记为已完成
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Hidden print receipt - only visible during print */}
            {printingOrder && <OrderReceipt order={printingOrder} />}
        </div>
    )
}
