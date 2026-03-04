import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { password } = await req.json()

        // In a real app, this should be a hashed password comparison
        const admin = await prisma.adminSettings.findFirst()

        if (admin && admin.password === password) {
            // Set a simple cookie for authentication (in a real app, use JWT)
            const cookieStore = await cookies()
            cookieStore.set('admin_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: '密码错误' }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: '登录失败' }, { status: 500 })
    }
}
