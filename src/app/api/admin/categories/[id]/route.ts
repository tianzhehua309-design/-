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

        const category = await (prisma.category as any).update({
            where: { id },
            data: {
                name: body.name,
                order: body.order
            }
        })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Update category error:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
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

        // Check if products are using this category
        const productCount = await (prisma.product as any).count({
            where: { categoryId: id }
        })

        if (productCount > 0) {
            return NextResponse.json({ error: '该分类下还有商品，不能删除' }, { status: 400 })
        }

        await (prisma.category as any).delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete category error:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
