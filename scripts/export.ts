import { PrismaClient } from "@prisma/client"
import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient({ datasourceUrl: "file:./prisma/dev.db" })

async function main() {
  const [products, categories, brands, subcategories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, brand: true, subcategory: true },
      where: { active: true },
    }),
    prisma.category.findMany(),
    prisma.brand.findMany(),
    prisma.subcategory.findMany(),
  ])

  const data = { products, categories, brands, subcategories }
  const outDir = join(import.meta.dirname, "..", "public")
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, "data.json"), JSON.stringify(data, null, 2))
  console.log(`Exportados ${products.length} productos a public/data.json`)
  await prisma.$disconnect()
  console.log(JSON.stringify(data, null, 2).length, "bytes")
}

main()
