import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { customerInfo, items, totalAmount } = body

        if (!customerInfo || !items || !totalAmount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const order = await prisma.order.create({
            data: {
                customerInfo,
                items: JSON.stringify(items),
                totalAmount,
                status: '待处理',
            },
        })

        return NextResponse.json(order, { status: 201 })
    } catch (error) {
        console.error('Failed to create order:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(orders)
    } catch (error) {
        console.error('Failed to fetch orders:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
