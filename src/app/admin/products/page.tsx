'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, ChevronLeft, Save, X, ImagePlus, Loader2 } from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    category: string
    categoryId: string | null
    categoryRel?: { name: string }
    imageUrl: string
    unit: string
    isAvailable: boolean
}

interface Category {
    id: string
    name: string
}

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        categoryId: '',
        imageUrl: '',
        unit: '个',
        isAvailable: true
    })
    const [categories, setCategories] = useState<Category[]>([])
    const [imagePreview, setImagePreview] = useState<string>('')
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/products')
            if (res.status === 401) {
                router.push('/admin')
                return
            }
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (err) {
            console.error('Failed to fetch products')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories')
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (err) {
            console.error('Failed to fetch categories')
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 本地预览
        const objectUrl = URL.createObjectURL(file)
        setImagePreview(objectUrl)
        setUploadError('')
        setUploading(true)

        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: fd,
            })
            const data = await res.json()
            if (!res.ok) {
                setUploadError(data.error || '上传失败')
                setImagePreview('')
            } else {
                setFormData(prev => ({ ...prev, imageUrl: data.url }))
            }
        } catch {
            setUploadError('网络错误，上传失败')
            setImagePreview('')
        } finally {
            setUploading(false)
            // 重置 input 以允许重复选同一张图
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const url = editingProduct
            ? `/api/admin/products/${editingProduct.id}`
            : '/api/admin/products'
        const method = editingProduct ? 'PATCH' : 'POST'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                fetchProducts()
                closeForm()
            }
        } catch (err) {
            alert('保存失败')
        }
    }

    const closeForm = () => {
        setIsAdding(false)
        setEditingProduct(null)
        setFormData({ name: '', price: '', category: '', categoryId: '', imageUrl: '', unit: '个', isAvailable: true })
        setImagePreview('')
        setUploadError('')
    }

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除这个商品吗？')) return
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
            if (res.ok) fetchProducts()
        } catch (err) {
            alert('删除失败')
        }
    }

    const toggleAvailability = async (product: Product) => {
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !product.isAvailable })
            })
            if (res.ok) fetchProducts()
        } catch (err) {
            alert('操作失败')
        }
    }

    const startEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            price: product.price.toString(),
            category: product.category,
            categoryId: product.categoryId || '',
            imageUrl: product.imageUrl,
            unit: product.unit || '个',
            isAvailable: product.isAvailable
        })
        setImagePreview(product.imageUrl)
        setIsAdding(true)
    }

    // 当前显示的图片（预览优先，其次是 URL）
    const displayImage = imagePreview || formData.imageUrl

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.push('/admin/dashboard')} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-slate-800">商品管理</h1>
                </div>

                <button
                    onClick={() => {
                        setIsAdding(true)
                        setEditingProduct(null)
                        setFormData({ name: '', price: '', category: '', categoryId: '', imageUrl: '', unit: '个', isAvailable: true })
                        setImagePreview('')
                    }}
                    className="bg-primary text-white p-2 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                </button>
            </header>

            <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
                {isAdding && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center">
                        <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800">{editingProduct ? '编辑商品' : '添加新商品'}</h2>
                                <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                {/* 图片上传区域 */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">商品图片</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageSelect}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary/40 transition-all overflow-hidden relative flex items-center justify-center active:scale-[0.98]"
                                    >
                                        {displayImage ? (
                                            <>
                                                <img
                                                    src={displayImage}
                                                    alt="预览"
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                                {/* 悬浮替换提示 */}
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
                                                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1.5 rounded-full">
                                                        点击更换图片
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <ImagePlus size={32} strokeWidth={1.5} />
                                                <span className="text-sm font-medium">点击从相册选择图片</span>
                                                <span className="text-xs">支持 JPG、PNG、WebP，最大 10MB</span>
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                                                <Loader2 size={28} className="animate-spin text-primary" />
                                                <span className="text-sm text-slate-500">上传中...</span>
                                            </div>
                                        )}
                                    </button>
                                    {uploadError && (
                                        <p className="text-xs text-red-500 mt-1.5 ml-1">{uploadError}</p>
                                    )}
                                    {/* 备用 URL 输入 */}
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="或直接粘贴图片链接..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={formData.imageUrl}
                                            onChange={e => {
                                                setFormData({ ...formData, imageUrl: e.target.value })
                                                setImagePreview(e.target.value)
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">商品名称</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">价格 (元)</label>
                                        <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                                            <input required type="number" step="0.01" className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">单位</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        >
                                            <option value="个">个</option>
                                            <option value="袋">袋</option>
                                            <option value="瓶">瓶</option>
                                            <option value="两">两</option>
                                            <option value="斤">斤</option>
                                            <option value="盒">盒</option>
                                            <option value="根">根</option>
                                            <option value="件">件</option>
                                            <option value="提">提</option>
                                            <option value="箱">箱</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">分类</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                        value={formData.categoryId}
                                        onChange={e => {
                                            const cat = categories.find(c => c.id === e.target.value)
                                            setFormData({
                                                ...formData,
                                                categoryId: e.target.value,
                                                category: cat ? cat.name : ''
                                            })
                                        }}
                                    >
                                        <option value="">请选择分类...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={closeForm} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium active:scale-95 transition-all">取消</button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 py-3 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        <Save size={18} /> 保存
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {loading ? (
                    <p className="text-center py-10 text-slate-400">加载中...</p>
                ) : (
                    <div className="grid gap-4">
                        {products.map(product => (
                            <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                    <img src={product.imageUrl} alt={product.name} className={`object-cover w-full h-full ${!product.isAvailable ? 'grayscale' : ''}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-800 text-sm truncate">{product.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-primary font-bold text-sm">¥{product.price.toFixed(2)}</span>
                                        <span className="text-slate-400 text-xs">/ {product.unit || '个'}</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase ml-1">
                                            {product.categoryRel?.name || product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleAvailability(product)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${product.isAvailable ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                                    >
                                        {product.isAvailable ? '有货' : '无货'}
                                    </button>
                                    <button onClick={() => startEdit(product)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
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
