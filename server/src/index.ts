import 'dotenv/config'
import Fastify from 'fastify'
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from './generated/prisma/client.js'

const app = Fastify({ logger: true })
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.get('/health', async () => {
  const userCount = await prisma.user.count()
  return { status: 'ok', users: userCount }
})

app.listen({ port: 3000 }, (err) => {
  if (err) process.exit(1)
})