import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const resolvedParams = await params
        const id = resolvedParams.id
        const body = await req.json()

        const updateData: any = {}
        if (body.name !== undefined) updateData.name = body.name
        if (body.price !== undefined) updateData.price = parseFloat(body.price)
        if (body.category !== undefined) updateData.category = body.category
        if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
        if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
        if (body.unit !== undefined) updateData.unit = body.unit
        if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable

        const product = await prisma.product.update({
            where: { id },
            data: updateData
        })
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const resolvedParams = await params
        const id = resolvedParams.id
        await prisma.product.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}
