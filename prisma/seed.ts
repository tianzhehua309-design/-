import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = [
    { name: '海天生抽 500ml', price: 9.5, category: '调味品', imageUrl: 'https://images.unsplash.com/photo-1621257913532-616cecb07823?auto=format&fit=crop&q=80&w=400', isAvailable: true },
    { name: '海天老抽 500ml', price: 11.0, category: '调味品', imageUrl: 'https://images.unsplash.com/photo-1621257913532-616cecb07823?auto=format&fit=crop&q=80&w=400', isAvailable: true },
    { name: '中盐 加碘精制盐 400g', price: 2.5, category: '调味品', imageUrl: 'https://images.unsplash.com/photo-1621946399187-57351adacb91?auto=format&fit=crop&q=80&w=400', isAvailable: true },
    { name: '太太乐 鸡精 200g', price: 8.0, category: '调味品', imageUrl: 'https://images.unsplash.com/photo-1596647244583-02f068ee25a4?auto=format&fit=crop&q=80&w=400', isAvailable: true },
    { name: '精选八角 50g', price: 6.0, category: '香料', imageUrl: 'https://plus.unsplash.com/premium_photo-1663953530869-70bd2eb5180f?auto=format&fit=crop&q=80&w=400', isAvailable: true },
    { name: '四川特级大红袍花椒 50g', price: 8.5, category: '香料', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400', isAvailable: true },
    { name: '桂皮 50g', price: 5.0, category: '香料', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400', isAvailable: true },
    { name: '维达 卷纸 10卷装', price: 25.0, category: '生活用品', imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=400', isAvailable: true },
    { name: '蓝月亮 洗衣液 2kg', price: 39.9, category: '生活用品', imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=400', isAvailable: true },
  ]

  for (const p of products) {
    await prisma.product.create({
      data: p,
    })
  }

  // Create an admin password (hashed in real life, but simple for now)
  await prisma.adminSettings.create({
    data: {
      password: 'admin', // Very simple default password
    }
  })

  console.log('Seed data inserted successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
