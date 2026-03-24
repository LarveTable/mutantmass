import 'dotenv/config'
import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import prismaPlugin from './plugins/prisma.js'
import authRoutes from './routes/auth.js'
import { authenticate } from './middleware/authenticate.js'
import cors from '@fastify/cors'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: process.env.CORS_ORIGIN!, // set the env variable to the url of the client
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

app.register(fastifyCookie)
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
  cookie: {
    cookieName: 'access_token',
    signed: false,
  }
})

app.register(prismaPlugin)
app.register(authRoutes)

// Health check route
app.get('/health', async () => {
  const userCount = await app.prisma.user.count()
  return { status: 'ok', users: userCount }
})

// Auth test route
app.get('/protected', { preHandler: authenticate }, async (request) => {
  const { userId } = request.user as { userId: string }
  return { message: `Hello user ${userId}` }
})

app.listen({ port: 3000 }, (err) => {
  if (err) process.exit(1)
})