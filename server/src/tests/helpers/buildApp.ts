import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import authRoutes from '../../routes/auth.js'
import exerciseRoutes from '../../routes/exercises.js'
import workoutRoutes from '../../routes/workouts.js'
import setRoutes from '../../routes/sets.js'
import statsRoutes from '../../routes/stats.js'
import { type Mock, vi } from 'vitest'

const JWT_SECRET = 'test-jwt-secret'
const JWT_REFRESH_SECRET = 'test-jwt-refresh-secret'

/**
 * Creates a mock Prisma client where every model method is a vi.fn().
 * You can override return values per-test with mockResolvedValue / mockResolvedValueOnce.
 */
interface MockModel {
    findUnique: Mock
    findFirst: Mock
    findMany: Mock
    create: Mock
    update: Mock
    delete: Mock
    count: Mock
    [key: string]: Mock
}

export interface MockPrisma {
    user: MockModel
    refreshToken: MockModel & { deleteMany: Mock }
    exercise: MockModel
    workout: MockModel
    workoutExercise: MockModel
    set: MockModel
}

export function createMockPrisma(): MockPrisma {
    return {
        user: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        refreshToken: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
            deleteMany: vi.fn(),
        },
        exercise: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        workout: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        workoutExercise: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        set: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
    }
}

/**
 * Builds a Fastify app configured identically to production,
 * but with a mocked Prisma client and deterministic JWT secrets.
 */
export async function buildApp(): Promise<{ app: FastifyInstance; mockPrisma: MockPrisma }> {
    // Set env vars the routes expect
    process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET
    process.env.NODE_ENV = 'test'

    const app = Fastify({ logger: false })
    const mockPrisma = createMockPrisma()

    app.register(fastifyCookie)
    app.register(fastifyJwt, {
        secret: JWT_SECRET,
        cookie: {
            cookieName: 'access_token',
            signed: false,
        },
    })
    
    app.register(fastifyMultipart)

    // Decorate with mock prisma instead of the real plugin
    app.decorate('prisma', mockPrisma as any)

    // Register all route plugins
    app.register(authRoutes)
    app.register(exerciseRoutes)
    app.register(workoutRoutes)
    app.register(setRoutes)
    app.register(statsRoutes)

    await app.ready()

    return { app, mockPrisma }
}

/**
 * Generates a valid access token for a given userId.
 * Use this to set the `access_token` cookie in authenticated requests.
 */
export function generateAccessToken(app: ReturnType<typeof Fastify>, userId: string) {
    return app.jwt.sign({ userId }, { expiresIn: '15m' })
}

/**
 * Generates a valid refresh token for a given userId.
 */
export function generateRefreshToken(app: ReturnType<typeof Fastify>, userId: string) {
    return app.jwt.sign({ userId }, { key: JWT_REFRESH_SECRET, expiresIn: '7d' })
}
