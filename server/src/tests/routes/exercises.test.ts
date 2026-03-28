import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp, generateAccessToken, type MockPrisma } from '../helpers/buildApp.js'
import type { FastifyInstance } from 'fastify'

describe('Exercise Routes', () => {
    let app: FastifyInstance
    let mockPrisma: MockPrisma
    let token: string

    beforeAll(async () => {
        const built = await buildApp()
        app = built.app
        mockPrisma = built.mockPrisma
        token = generateAccessToken(app, 'user-1')
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        Object.values(mockPrisma).forEach((model) => {
            Object.values(model).forEach((fn) => (fn as any).mockReset())
        })
    })

    // ─── GET /exercises ──────────────────────────────────────────

    describe('GET /exercises', () => {
        it('should return exercises for authenticated user', async () => {
            const exercises = [
                { id: 'ex-1', name: 'Bench Press', type: 'WEIGHTED', muscleGroup: 'CHEST', userId: null },
                { id: 'ex-2', name: 'Push Up', type: 'BODYWEIGHT', muscleGroup: 'CHEST', userId: 'user-1' },
            ]

            mockPrisma.exercise.findMany.mockResolvedValue(exercises)

            const res = await app.inject({
                method: 'GET',
                url: '/exercises',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().exercises).toHaveLength(2)
            expect(mockPrisma.exercise.findMany).toHaveBeenCalledOnce()
        })

        it('should pass query filters to Prisma', async () => {
            mockPrisma.exercise.findMany.mockResolvedValue([])

            const res = await app.inject({
                method: 'GET',
                url: '/exercises?type=WEIGHTED&muscleGroup=CHEST',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)

            const call = mockPrisma.exercise.findMany.mock.calls[0]![0] as any
            expect(call.where.type).toBe('WEIGHTED')
            expect(call.where.muscleGroup).toBe('CHEST')
        })

        it('should return 401 without auth', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/exercises',
            })

            expect(res.statusCode).toBe(401)
        })
    })

    // ─── POST /exercises ─────────────────────────────────────────

    describe('POST /exercises', () => {
        it('should create an exercise with valid data', async () => {
            const created = {
                id: 'ex-new',
                name: 'Deadlift',
                type: 'WEIGHTED',
                muscleGroup: 'BACK',
                isPublic: false,
                userId: 'user-1',
                imageUrl: null,
            }

            mockPrisma.exercise.create.mockResolvedValue(created)

            const res = await app.inject({
                method: 'POST',
                url: '/exercises',
                cookies: { access_token: token },
                payload: {
                    name: 'Deadlift',
                    type: 'WEIGHTED',
                    muscleGroup: 'BACK',
                },
            })

            expect(res.statusCode).toBe(201)
            expect(res.json().exercise).toEqual(created)
        })

        it('should return 400 when required fields are missing', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/exercises',
                cookies: { access_token: token },
                payload: { name: 'Deadlift' }, // missing type and muscleGroup
            })

            expect(res.statusCode).toBe(400)
            expect(res.json().error).toBe('name, type and muscle group are required')
        })

        it('should return 400 for invalid exercise type', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/exercises',
                cookies: { access_token: token },
                payload: {
                    name: 'Deadlift',
                    type: 'INVALID_TYPE',
                    muscleGroup: 'BACK',
                },
            })

            expect(res.statusCode).toBe(400)
            expect(res.json().error).toBe('invalid type')
        })

        it('should return 401 without auth', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/exercises',
                payload: { name: 'Deadlift', type: 'WEIGHTED', muscleGroup: 'BACK' },
            })

            expect(res.statusCode).toBe(401)
        })
    })
})
