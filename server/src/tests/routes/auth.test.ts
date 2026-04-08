import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp, generateAccessToken, generateRefreshToken, type MockPrisma } from '../helpers/buildApp.js'
import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'

describe('Auth Routes', () => {
    let app: FastifyInstance
    let mockPrisma: MockPrisma

    beforeAll(async () => {
        const built = await buildApp()
        app = built.app
        mockPrisma = built.mockPrisma
    })

    afterAll(async () => {
        await app.close()
    })

    // Reset all mocks before each test so tests are fully isolated
    beforeEach(() => {
        Object.values(mockPrisma).forEach((model) => {
            Object.values(model).forEach((fn) => (fn as any).mockReset())
        })
    })

    // ─── REGISTER ────────────────────────────────────────────────

    describe('POST /auth/register', () => {
        it('should register a new user and set cookies', async () => {
            const newUser = { id: 'user-1', email: 'test@example.com', password: 'hashed' }

            mockPrisma.user.findUnique.mockResolvedValue(null) // email not taken
            mockPrisma.user.create.mockResolvedValue(newUser)
            mockPrisma.refreshToken.create.mockResolvedValue({})

            const res = await app.inject({
                method: 'POST',
                url: '/auth/register',
                payload: { email: 'test@example.com', password: 'Password123', name: 'Test User', betaCode: 'test-beta-code' },
            })

            expect(res.statusCode).toBe(200)

            const body = res.json()
            expect(body.user).toEqual({ id: 'user-1', email: 'test@example.com' })

            // Should set both cookies
            const cookies = res.cookies as Array<{ name: string; value: string }>
            const cookieNames = cookies.map((c) => c.name)
            expect(cookieNames).toContain('access_token')
            expect(cookieNames).toContain('refresh_token')

            // Prisma should have been called correctly
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            })
            expect(mockPrisma.user.create).toHaveBeenCalledOnce()
            expect(mockPrisma.refreshToken.create).toHaveBeenCalledOnce()
        })

        it('should return 400 if email already exists', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'existing',
                email: 'taken@example.com',
            })

            const res = await app.inject({
                method: 'POST',
                url: '/auth/register',
                payload: { email: 'taken@example.com', password: 'Password123', name: 'Existing User', betaCode: 'test-beta-code' },
            })

            expect(res.statusCode).toBe(400)
            expect(res.json().error).toBe('Email already in use')
            expect(mockPrisma.user.create).not.toHaveBeenCalled()
        })
    })

    // ─── LOGIN ───────────────────────────────────────────────────

    describe('POST /auth/login', () => {
        const hashedPassword = bcrypt.hashSync('CorrectPassword', 1) // low rounds for speed
        const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            password: hashedPassword,
        }

        it('should log in with correct credentials and set cookies', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser)
            mockPrisma.refreshToken.create.mockResolvedValue({})

            const res = await app.inject({
                method: 'POST',
                url: '/auth/login',
                payload: { email: 'test@example.com', password: 'CorrectPassword' },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().user).toEqual({ id: 'user-1', email: 'test@example.com' })

            const cookies = res.cookies as Array<{ name: string; value: string }>
            const cookieNames = cookies.map((c) => c.name)
            expect(cookieNames).toContain('access_token')
            expect(cookieNames).toContain('refresh_token')
        })

        it('should return 401 for non-existent email', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null)

            const res = await app.inject({
                method: 'POST',
                url: '/auth/login',
                payload: { email: 'nobody@example.com', password: 'whatever' },
            })

            expect(res.statusCode).toBe(401)
            expect(res.json().error).toBe('Invalid credentials')
        })

        it('should return 401 for wrong password', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser)

            const res = await app.inject({
                method: 'POST',
                url: '/auth/login',
                payload: { email: 'test@example.com', password: 'WrongPassword' },
            })

            expect(res.statusCode).toBe(401)
            expect(res.json().error).toBe('Invalid credentials')
        })
    })

    // ─── REFRESH ─────────────────────────────────────────────────

    describe('POST /auth/refresh', () => {
        it('should rotate tokens with a valid refresh cookie', async () => {
            const refreshToken = generateRefreshToken(app, 'user-1')

            mockPrisma.refreshToken.findUnique.mockResolvedValue({
                token: refreshToken,
                userId: 'user-1',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
            })
            mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 })

            const res = await app.inject({
                method: 'POST',
                url: '/auth/refresh',
                cookies: { refresh_token: refreshToken },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().success).toBe(true)

            // Should set ONLY the new access cookie (refresh cookie maintains its original absolute expiry)
            const cookies = res.cookies as Array<{ name: string; value: string }>
            const cookieNames = cookies.map((c) => c.name)
            expect(cookieNames).toContain('access_token')
            expect(cookieNames).not.toContain('refresh_token')

            // Expired tokens should be collected globally
            expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: { expiresAt: { lt: expect.any(Date) } },
            })
            // Current token is NOT updated in DB so its expiration remains strictly 7 days from original creation
            expect(mockPrisma.refreshToken.update).not.toHaveBeenCalled()
        })

        it('should return 401 when no refresh cookie is present', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/auth/refresh',
            })

            expect(res.statusCode).toBe(401)
            expect(res.json().error).toBe('No refresh token')
        })

        it('should return 401 when refresh token is expired in DB', async () => {
            const refreshToken = generateRefreshToken(app, 'user-1')

            mockPrisma.refreshToken.findUnique.mockResolvedValue({
                token: refreshToken,
                userId: 'user-1',
                expiresAt: new Date(Date.now() - 1000), // already expired
            })

            const res = await app.inject({
                method: 'POST',
                url: '/auth/refresh',
                cookies: { refresh_token: refreshToken },
            })

            expect(res.statusCode).toBe(401)
            expect(res.json().error).toBe('Refresh token expired or not found')
        })

        it('should return 401 when refresh token is not found in DB', async () => {
            const refreshToken = generateRefreshToken(app, 'user-1')

            mockPrisma.refreshToken.findUnique.mockResolvedValue(null)

            const res = await app.inject({
                method: 'POST',
                url: '/auth/refresh',
                cookies: { refresh_token: refreshToken },
            })

            expect(res.statusCode).toBe(401)
            expect(res.json().error).toBe('Refresh token expired or not found')
        })
    })

    // ─── LOGOUT ──────────────────────────────────────────────────

    describe('POST /auth/logout', () => {
        it('should clear cookies and delete refresh token from DB', async () => {
            const refreshToken = 'some-refresh-token'

            mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 })

            const res = await app.inject({
                method: 'POST',
                url: '/auth/logout',
                cookies: { refresh_token: refreshToken },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().success).toBe(true)

            expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: { token: refreshToken },
            })

            // Cookies should be cleared (set with empty value or past expiry)
            const cookies = res.cookies as Array<{ name: string; value: string }>
            const accessCookie = cookies.find((c) => c.name === 'access_token')
            const refreshCookie = cookies.find((c) => c.name === 'refresh_token')
            expect(accessCookie).toBeDefined()
            expect(refreshCookie).toBeDefined()
        })

        it('should succeed even without a refresh cookie', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/auth/logout',
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().success).toBe(true)
            expect(mockPrisma.refreshToken.deleteMany).not.toHaveBeenCalled()
        })
    })

    // ─── ME ──────────────────────────────────────────────────────

    describe('GET /auth/me', () => {
        it('should return user data with valid access token', async () => {
            const token = generateAccessToken(app, 'user-1')

            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
            })

            const res = await app.inject({
                method: 'GET',
                url: '/auth/me',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().user).toEqual({ id: 'user-1', email: 'test@example.com' })
        })

        it('should return 401 without access token', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/auth/me',
            })

            expect(res.statusCode).toBe(401)
            expect(res.json().error).toBe('Unauthorized')
        })

        it('should return 404 if user no longer exists', async () => {
            const token = generateAccessToken(app, 'deleted-user')

            mockPrisma.user.findUnique.mockResolvedValue(null)

            const res = await app.inject({
                method: 'GET',
                url: '/auth/me',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('User not found')
        })
    })
})
