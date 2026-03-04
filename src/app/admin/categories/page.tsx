'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, ChevronLeft, Save, X, Layers, GripVertical } from 'lucide-react'

interface Category {
    id: string
    name: string
    order: number
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({ name: '', order: '0' })
    const router = useRouter()

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/categories')
            if (res.status === 401) {
                router.push('/admin')
                return
            }
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (err) {
            console.error('Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const url = editingCategory
            ? `/api/admin/categories/${editingCategory.id}`
            : '/api/admin/categories'
        const method = editingCategory ? 'PATCH' : 'POST'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    order: parseInt(formData.order)
                })
            })

            if (res.ok) {
                fetchCategories()
                setIsAdding(false)
                setEditingCategory(null)
                setFormData({ name: '', order: '0' })
            } else {
                const error = await res.json()
                alert(error.error || '保存失败')
            }
        } catch (err) {
            alert('网络错误，保存失败')
        }
    }

    const confirmDelete = async () => {
        if (!deletingCategory) return
        try {
            const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchCategories()
                setDeletingCategory(null)
            } else {
                const error = await res.json()
                alert(error.error || '删除失败')
                setDeletingCategory(null)
            }
        } catch (err) {
            alert('网络错误，删除失败')
            setDeletingCategory(null)
        }
    }

    const startEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            order: category.order.toString()
        })
        setIsAdding(true)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.push('/admin/dashboard')} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-slate-800">分类管理</h1>
                </div>

                <button
                    onClick={() => {
                        setIsAdding(true)
                        setEditingCategory(null)
                        setFormData({ name: '', order: categories.length.toString() })
                    }}
                    className="bg-primary text-white p-2 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                </button>
            </header>

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
                {isAdding && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800">{editingCategory ? '编辑分类' : '添加分类'}</h2>
                                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">分类名称</label>
                                    <input required type="text" placeholder="例如：水果、蔬菜" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">显示排序 (数字越小越靠前)</label>
                                    <input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium active:scale-95 transition-all">取消</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <Save size={18} /> 保存
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {deletingCategory && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">确认删除？</h2>
                            <p className="text-sm text-slate-500 mb-6">您确定要删除分类 <span className="font-bold text-slate-800">"{deletingCategory.name}"</span> 吗？此操作不可撤销。</p>

                            <div className="flex gap-3">
                                <button onClick={() => setDeletingCategory(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium active:scale-95 transition-all">取消</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium shadow-lg shadow-red-500/20 active:scale-95 transition-all">确认删除</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3 rounded-xl mb-6 flex items-start gap-2">
                    <Layers size={16} className="mt-0.5 flex-shrink-0" />
                    <p>您可以自由管理商品分类。首页会按照这里设置的“排序”数字由小到大排列分类分区。删除分类前请确保该分类下没有商品。</p>
                </div>

                {loading ? (
                    <p className="text-center py-10 text-slate-400">加载中...</p>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <Layers size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400">暂无分类，请点击右上角添加</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categories.map(category => (
                            <div key={category.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-slate-300">
                                        <GripVertical size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">排序: {category.order}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => startEdit(category)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => setDeletingCategory(category)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
