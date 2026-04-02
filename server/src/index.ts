import 'dotenv/config'
import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import prismaPlugin from './plugins/prisma.js'
import authRoutes from './routes/auth.js'
import cors from '@fastify/cors'
import exerciseRoutes from './routes/exercises.js'
import workoutRoutes from './routes/workouts.js'
import setRoutes from './routes/sets.js'
import statsRoutes from './routes/stats.js'
import profileRoutes from './routes/profile.js'
import fastifyStatic from '@fastify/static'
import fastifyMultipart from '@fastify/multipart'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = Fastify({ logger: true })

// CORS
app.register(cors, {
  origin: (origin, cb) => {
    const allowed = (process.env.CORS_ORIGIN ?? '').split(',').map(o => o.trim())
    if (!origin || allowed.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'), false)
    }
  },
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

// Exercises images
app.register(fastifyStatic, {
  root: join(__dirname, '../uploads'),
  prefix: '/uploads/',
})

app.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
})

app.register(prismaPlugin)
// Auth routes
app.register(authRoutes)

// Exercises routes
app.register(exerciseRoutes)

// Workout routes
app.register(workoutRoutes)

// Sets routes
app.register(setRoutes)

// Stats routes
app.register(statsRoutes)

// Profile routes
app.register(profileRoutes)

app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) process.exit(1)
})