'use client'

import { useCart } from '@/store/useCart'
import { Plus } from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    category: string
    imageUrl: string
    unit: string
    isAvailable: boolean
}

export function ProductCard({ product }: { product: Product }) {
    const addItem = useCart((state) => state.addItem)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative transition-transform hover:-translate-y-1">
            <div className="relative w-full aspect-square bg-slate-100">
                <img
                    src={product.imageUrl}
                    alt=""
                    className="object-cover w-full h-full"
                />
                {!product.isAvailable && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-medium">暂时缺货</span>
                    </div>
                )}
            </div>

            <div className="p-3 flex flex-col flex-1 justify-between">
                <div>
                    <h3 className="font-medium text-slate-800 text-sm mb-2 line-clamp-2 leading-tight">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold">
                        <span className="text-xs">¥</span>{product.price.toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">/ {product.unit || '个'}</span>
                    </span>
                    <button
                        onClick={() => addItem(product)}
                        disabled={!product.isAvailable}
                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
