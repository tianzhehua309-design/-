import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const products = await prisma.product.findMany()
    const categories = await prisma.category.findMany()
    console.log('Total Products:', products.length)
    console.log('Products:', JSON.stringify(products, null, 2))
    console.log('Total Categories:', categories.length)
    console.log('Categories:', JSON.stringify(categories, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
