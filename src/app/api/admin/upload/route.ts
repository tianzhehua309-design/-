import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: Request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: '未选择文件' }, { status: 400 })
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: '仅支持 JPG、PNG、WebP、GIF 格式' }, { status: 400 })
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: '文件大小不能超过 10MB' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // 生成唯一文件名
        const ext = extname(file.name) || '.jpg'
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        const url = `/uploads/${filename}`
        return NextResponse.json({ url }, { status: 201 })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 })
    }
}
