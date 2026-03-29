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

const app = Fastify({ logger: true })

// CORS
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

app.listen({ port: 3000 }, (err) => {
  if (err) process.exit(1)
})