'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Lock } from 'lucide-react'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            if (res.ok) {
                router.push('/admin/dashboard')
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.error || '登录失败')
            }
        } catch (err) {
            setError('网络错误，请稍后重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 w-full max-w-sm p-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Store size={32} className="text-primary" />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">掌柜后台</h1>
                <p className="text-sm text-slate-500 mb-8">请输入密码管理您的店铺</p>

                <form onSubmit={handleLogin} className="w-full space-y-4">
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="初次密码是: admin"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-primary text-white font-medium py-3.5 rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none mt-2"
                    >
                        {loading ? '登录中...' : '进入后台'}
                    </button>
                </form>
            </div>
        </div>
    )
}
