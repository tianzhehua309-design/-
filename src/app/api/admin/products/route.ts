import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const products = await prisma.product.findMany({
            include: { categoryRel: true },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        const product = await prisma.product.create({
            data: {
                name: body.name,
                price: parseFloat(body.price),
                category: body.category || '', // Keep for legacy
                categoryId: body.categoryId,
                imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
                unit: body.unit || '个',
                isAvailable: body.isAvailable ?? true,
            }
        })
        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
}
