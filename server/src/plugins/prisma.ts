import fp from 'fastify-plugin'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

// Registers prisma as a fastify plugin to make it accessible by all fastify routes

export default fp(async (fastify) => {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    const prisma = new PrismaClient({ adapter })

    await prisma.$connect()

    fastify.decorate('prisma', prisma)

    fastify.addHook('onClose', async () => {
        await prisma.$disconnect()
    })
})

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
    }
}