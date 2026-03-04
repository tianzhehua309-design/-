import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { password } = await req.json()

        // 1. 优先检查环境变量中的密码（推荐线上环境使用）
        const envPassword = process.env.ADMIN_PASSWORD
        if (envPassword && envPassword === password) {
            return setAuthCookie()
        }

        // 2. 检查数据库中的设置（向后兼容）
        const admin = await prisma.adminSettings.findFirst()
        if (admin && admin.password === password) {
            return setAuthCookie()
        }

        // 3. 本地环境默认密码（仅限未设置环境变量且数据库为空时）
        if (!envPassword && !admin && password === 'admin') {
            return setAuthCookie()
        }

        return NextResponse.json({ error: '密码错误' }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: '登录失败' }, { status: 500 })
    }
}

async function setAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return NextResponse.json({ success: true })
}
