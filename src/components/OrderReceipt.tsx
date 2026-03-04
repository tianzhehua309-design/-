'use client'

interface OrderItem {
    name: string
    quantity: number
    price: number
    unit?: string
}

interface ReceiptProps {
    order: {
        id: string
        customerInfo: string
        items: string
        totalAmount: number
        status: string
        createdAt: string
    }
}

export function OrderReceipt({ order }: ReceiptProps) {
    let items: OrderItem[] = []
    try {
        items = JSON.parse(order.items)
    } catch {
        items = []
    }

    const date = new Date(order.createdAt)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

    return (
        <div id="print-receipt" className="hidden print:block font-mono text-black bg-white p-4" style={{ width: '72mm', fontSize: '12px', lineHeight: '1.6' }}>
            {/* Store Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>老邻居杂货铺</div>
                <div style={{ fontSize: '10px', color: '#555' }}>线上下单，到店自提</div>
            </div>

            {/* Order Meta */}
            <div style={{ marginBottom: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>单号</span>
                    <span>#{order.id.slice(-8).toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>日期</span>
                    <span>{dateStr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>时间</span>
                    <span>{timeStr}</span>
                </div>
            </div>

            {/* Customer Info */}
            <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', marginBottom: '8px', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>顾客信息</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{order.customerInfo}</div>
            </div>

            {/* Items */}
            <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>商品明细</div>
                {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                            <span>{item.name}</span>
                            <span style={{ color: '#555', marginLeft: '4px' }}>×{item.quantity}{item.unit || '个'}</span>
                        </div>
                        <span>¥{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div style={{ borderTop: '1px solid #000', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                <span>合计</span>
                <span>¥{order.totalAmount.toFixed(2)}</span>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px dashed #000', marginTop: '8px', paddingTop: '8px', textAlign: 'center', fontSize: '10px', color: '#555' }}>
                <div>感谢您的惠顾！</div>
                <div>欢迎再次光临</div>
            </div>
        </div>
    )
}
