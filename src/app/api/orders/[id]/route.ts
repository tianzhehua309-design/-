import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_token')

        if (!token) {
            return NextResponse.json({ error: '未授权' }, { status: 401 })
        }

        const resolvedParams = await params // Await the promise in Next.js 15
        const id = resolvedParams.id

        const body = await req.json()
        const { status } = body

        const order = await prisma.order.update({
            where: { id },
            data: { status },
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error('Failed to update order:', error)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }
}
