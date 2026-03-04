import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
