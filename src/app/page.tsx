import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { CartDrawer } from '@/components/CartDrawer'

export default async function Home() {
  // 1. Fetch categories with their products (only those with at least one available product)
  const categories = await (prisma.category as any).findMany({
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { order: 'asc' }
  })

  // 2. We show all categories now so the user can see new categories immediately
  const activeCategories = (categories as any[]).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    products: cat.products
  }))

  return (
    <main className="min-h-screen pb-32 flex flex-col pt-0">
      <header className="px-5 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">老邻居杂货铺</h1>
        <p className="text-sm text-slate-500 mt-1">线上下单，到店自提</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Category Sidebar - Sticky on mobile */}
        <div className="w-24 flex-shrink-0 border-r border-slate-100 bg-slate-50 overflow-y-auto no-scrollbar pb-24">
          <ul className="flex flex-col">
            {activeCategories.map((category: any, index: any) => (
              <li key={category.id} className="w-full">
                <a
                  href={`#category-${index}`}
                  className="block py-4 px-2 text-center text-sm font-medium text-slate-600 active:bg-white active:text-primary transition-colors border-l-4 border-transparent hover:border-slate-200"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Product List */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 scroll-smooth">
          {activeCategories.map((category: any, index: any) => {
            return (
              <div key={category.id} id={`category-${index}`} className="mb-8 scroll-mt-6">
                <div className="grid grid-cols-2 gap-3">
                  {category.products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <CartDrawer />
    </main>
  )
}
