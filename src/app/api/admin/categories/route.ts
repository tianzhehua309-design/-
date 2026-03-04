import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const categories = await prisma.category.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(categories)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

        const category = await prisma.category.create({
            data: {
                name: body.name,
                order: body.order || 0
            }
        })
        return NextResponse.json(category, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: '分类名称已存在' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}
