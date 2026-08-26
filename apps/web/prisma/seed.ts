import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@honeychain.gov.in' },
    update: {},
    create: {
      email: 'admin@honeychain.gov.in',
      password: 'password123',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      name: 'Admin Officer (KVIC)',
      role: 'ADMIN',
      phone: '+91 98123 45670',
      isVerified: true,
    },
  })

  const beekeeper = await prisma.user.upsert({
    where: { email: 'ramesh.sonipat@gmail.com' },
    update: {},
    create: {
      email: 'ramesh.sonipat@gmail.com',
      password: 'password123',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      name: 'Ramesh Kumar',
      role: 'BEEKEEPER',
      phone: '+91 98765 43210',
      isVerified: true,
    },
  })

  const processor = await prisma.user.upsert({
    where: { email: 'contact@abchoney.in' },
    update: {},
    create: {
      email: 'contact@abchoney.in',
      password: 'password123',
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      name: 'ABC Honey Processing Unit',
      role: 'PROCESSOR',
      phone: '+91 98222 33445',
      isVerified: true,
    },
  })

  const lab = await prisma.user.upsert({
    where: { email: 'lab.verify@fssai-approved.gov.in' },
    update: {},
    create: {
      email: 'lab.verify@fssai-approved.gov.in',
      password: 'password123',
      walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      name: 'National Quality Testing Lab',
      role: 'LAB',
      phone: '+91 98333 44556',
      isVerified: true,
    },
  })

  const retailer = await prisma.user.upsert({
    where: { email: 'store@freshmart.in' },
    update: {},
    create: {
      email: 'store@freshmart.in',
      password: 'password123',
      walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
      name: 'Fresh Mart Organics Retail',
      role: 'RETAILER',
      phone: '+91 98555 66778',
      isVerified: true,
    },
  })

  const cluster = await prisma.cluster.create({
    data: {
      name: 'Sonipat Honey Cluster',
      district: 'Sonipat',
      state: 'Haryana',
      totalBeekeepers: 84,
      totalHives: 1200,
    },
  })

  const hive = await prisma.hive.create({
    data: {
      hiveCode: 'HIVE-007',
      beekeeperId: beekeeper.id,
      clusterId: cluster.id,
      location: 'Ganaur Field 4, Sonipat, Haryana',
      flowerSource: 'Mustard Flower (Sarson)',
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
