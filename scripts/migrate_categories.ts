import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Category Migration...')

    // 1. Get all products with null categoryId
    const orphanProducts = await prisma.product.findMany({
        where: {
            categoryId: null
        }
    })

    console.log(`📦 Found ${orphanProducts.length} products to migrate.`)

    if (orphanProducts.length === 0) {
        console.log('✅ No products need migration.')
        return
    }

    // 2. Extract unique category names
    const legacyCategoryNames = Array.from(new Set(orphanProducts.map(p => p.category || '未分类')))
    console.log(`🏷️  Legacy categories identified: ${legacyCategoryNames.join(', ')}`)

    // 3. Ensure each category exists in the Category model
    const categoryMap: Record<string, string> = {}

    for (const name of legacyCategoryNames) {
        let category = await prisma.category.findUnique({
            where: { name }
        })

        if (!category) {
            console.log(`➕ Creating new category: ${name}`)
            category = await prisma.category.create({
                data: { name, order: 99 } // Default high order for legacy
            })
        } else {
            console.log(`🔗 Category already exists: ${name}`)
        }
        categoryMap[name] = category.id
    }

    // 4. Update products with their new categoryId
    let updatedCount = 0
    for (const product of orphanProducts) {
        const catName = product.category || '未分类'
        const targetId = categoryMap[catName]

        await prisma.product.update({
            where: { id: product.id },
            data: { categoryId: targetId }
        })
        updatedCount++
    }

    console.log(`✨ Successfully migrated ${updatedCount} products into categorized entities!`)
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
