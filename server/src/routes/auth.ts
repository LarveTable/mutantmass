import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'
import { authenticate } from '../middleware/authenticate.js'

const SALT_ROUNDS = 12
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
const REFRESH_TOKEN_EXPIRY = '7d'

export default async function authRoutes(app: FastifyInstance) {
    // REGISTER
    app.post('/auth/register', async (request, reply) => {
        // User sends email, pass, name, betaCode
        const { email, password, name, betaCode } = request.body as { email: string; password: string; name: string; betaCode: string }
        
        // Beta Code validation
        const requiredBetaCode = process.env.BETA_CODE
        if (!requiredBetaCode) {
            return reply.status(500).send({ error: 'Server misconfiguration: Beta code not set' })
        }
        if (betaCode !== requiredBetaCode) {
            return reply.status(403).send({ error: 'Invalid beta code' })
        }

        // Check if email already exists
        const existing = await app.prisma.user.findUnique({ where: { email } })
        if (existing) {
            return reply.status(400).send({ error: 'Email already in use' })
        }

        // Hash password
        const hashed = await bcrypt.hash(password, SALT_ROUNDS)
        // Create user
        const user = await app.prisma.user.create({
            data: { email, password: hashed, name }
        })

        // Clean up expired tokens globally
        await app.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        })

        // Generate tokens
        const accessToken = app.jwt.sign(
            { userId: user.id },
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        )
        const refreshToken = app.jwt.sign(
            { userId: user.id },
            { key: process.env.JWT_REFRESH_SECRET!, expiresIn: REFRESH_TOKEN_EXPIRY }
        )

        // Store refresh token in DB
        await app.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS)
            }
        })

        // Set cookies client-side
        reply
            .setCookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Allow only over HTTPS in production, not in dev
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 15 // 15 minutes
            })
            .setCookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
            .send({ user: { id: user.id, email: user.email } })
    })

    // LOGIN
    app.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body as { email: string; password: string }

        // Check if user exists
        const user = await app.prisma.user.findUnique({ where: { email } })
        if (!user) {
            return reply.status(401).send({ error: 'Invalid credentials' })
        }

        // Compare password
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return reply.status(401).send({ error: 'Invalid credentials' })
        }

        // Clean up expired tokens globally
        await app.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        })

        // Generate tokens
        const accessToken = app.jwt.sign(
            { userId: user.id },
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        )
        const refreshToken = app.jwt.sign(
            { userId: user.id },
            { key: process.env.JWT_REFRESH_SECRET!, expiresIn: REFRESH_TOKEN_EXPIRY }
        )

        await app.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS)
            }
        })

        // Set cookies
        reply
            .setCookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 15
            })
            .setCookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })
            .send({ user: { id: user.id, email: user.email } })
    })

    // REFRESH
    app.post('/auth/refresh', async (request, reply) => {
        // Get refresh token from cookie
        const refreshToken = request.cookies.refresh_token
        if (!refreshToken) {
            return reply.status(401).send({ error: 'No refresh token' })
        }

        // Verify refresh token
        let payload: { userId: string }
        try {
            payload = app.jwt.verify(refreshToken, { key: process.env.JWT_REFRESH_SECRET! }) as { userId: string }
        } catch {
            return reply.status(401).send({ error: 'Invalid refresh token' })
        }

        // Check if refresh token exists in DB and is not expired   
        const stored = await app.prisma.refreshToken.findUnique({ where: { token: refreshToken } })
        if (!stored || stored.expiresAt < new Date()) {
            return reply.status(401).send({ error: 'Refresh token expired or not found' })
        }

        // Clean up expired tokens globally to prevent DB bloat
        await app.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        })

        // Generate new access token
        const newAccessToken = app.jwt.sign(
            { userId: payload.userId },
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        )

        // Set new cookies (we only refresh the access token, leaving the refresh token's absolute 7-day expiration ticking)
        reply
            .setCookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 15
            })
            .send({ success: true })
    })

    // LOGOUT
    app.post('/auth/logout', async (request, reply) => {
        // Get refresh token from cookie    
        const refreshToken = request.cookies.refresh_token
        // Delete from db if exists
        if (refreshToken) {
            await app.prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
        }

        // Clear cookies
        reply
            .clearCookie('access_token', { path: '/' })
            .clearCookie('refresh_token', { path: '/' })
            .send({ success: true })
    })

    // ME
    app.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const user = await app.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true }
        })
        if (!user) return reply.status(404).send({ error: 'User not found' })
        return { user }
    })
}