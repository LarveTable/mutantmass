import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp, generateAccessToken, type MockPrisma } from '../helpers/buildApp.js'
import FormData from 'form-data'
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

            const call = mockPrisma.exercise.findMany.mock.calls[0]![0] as any
            expect(call.where.OR).toContainEqual({ userId: null })
            expect(call.where.OR).toContainEqual({ isPublic: true })
            expect(call.where.OR).toContainEqual({ userId: 'user-1' })
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
                targetMuscle: [],
                isPublic: false,
                userId: 'user-1',
                imageUrl: null,
            }

            mockPrisma.exercise.create.mockResolvedValue(created)

            const form = new FormData()
            form.append('name', 'Deadlift')
            form.append('type', 'WEIGHTED')
            form.append('muscleGroup', 'BACK')
            form.append('targetMuscle', JSON.stringify(['lower-back']))

            const res = await app.inject({
                method: 'POST',
                url: '/exercises',
                cookies: { access_token: token },
                headers: form.getHeaders(),
                payload: form,
            })

            expect(res.statusCode).toBe(201)
            expect(res.json().exercise).toEqual(created)
        })

        it('should return 400 when required fields are missing', async () => {
            const form = new FormData()
            form.append('name', 'Deadlift')

            const res = await app.inject({
                method: 'POST',
                url: '/exercises',
                cookies: { access_token: token },
                headers: form.getHeaders(),
                payload: form,
            })

            expect(res.statusCode).toBe(400)
            expect(res.json().error).toBe('name, type and muscle group are required')
        })

        it('should return 400 for invalid exercise type', async () => {
            const form = new FormData()
            form.append('name', 'Deadlift')
            form.append('type', 'INVALID_TYPE')
            form.append('muscleGroup', 'BACK')

            const res = await app.inject({
                method: 'POST',
                url: '/exercises',
                cookies: { access_token: token },
                headers: form.getHeaders(),
                payload: form,
            })

            expect(res.statusCode).toBe(400)
            expect(res.json().error).toBe('invalid type')
        })

        it('should return 401 without auth', async () => {
            const form = new FormData()
            form.append('name', 'Deadlift')
            form.append('type', 'WEIGHTED')
            form.append('muscleGroup', 'BACK')

            const res = await app.inject({
                method: 'POST',
                url: '/exercises',
                headers: form.getHeaders(),
                payload: form,
            })

            expect(res.statusCode).toBe(401)
        })
    })

    // ─── PATCH /exercises/:id ────────────────────────────────────
    describe('PATCH /exercises/:id', () => {
        it('should update all fields for private exercises', async () => {
            const exercise = { id: 'ex-1', name: 'Old Name', isPublic: false, userId: 'user-1' }
            mockPrisma.exercise.findFirst.mockResolvedValue(exercise)
            mockPrisma.exercise.update.mockResolvedValue({ ...exercise, name: 'New Name' })

            const form = new FormData()
            form.append('name', 'New Name')

            const res = await app.inject({
                method: 'PATCH',
                url: '/exercises/ex-1',
                cookies: { access_token: token },
                headers: form.getHeaders(),
                payload: form,
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().exercise.name).toBe('New Name')
            expect(mockPrisma.exercise.update).toHaveBeenCalledWith({
                where: { id: 'ex-1' },
                data: expect.objectContaining({ name: 'New Name' }),
            })
        })

        it('should update name for public exercises', async () => {
            const exercise = { id: 'ex-1', name: 'Public Exercise', isPublic: true, userId: 'user-1' }
            mockPrisma.exercise.findFirst.mockResolvedValue(exercise)
            mockPrisma.exercise.update.mockResolvedValue({ ...exercise, name: 'Updated Name' })

            const form = new FormData()
            form.append('name', 'Updated Name')

            const res = await app.inject({
                method: 'PATCH',
                url: '/exercises/ex-1',
                cookies: { access_token: token },
                headers: form.getHeaders(),
                payload: form,
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().exercise.name).toBe('Updated Name')
            const updateCallData = mockPrisma.exercise.update.mock.calls[0]![0].data
            expect(updateCallData.name).toBe('Updated Name')
        })

        it('should remove imageUrl if removeImage is sent', async () => {
            const exercise = { id: 'ex-1', userId: 'user-1', imageUrl: '/some/path.jpg' }
            mockPrisma.exercise.findFirst.mockResolvedValue(exercise)
            mockPrisma.exercise.update.mockResolvedValue({ ...exercise, imageUrl: null })

            const form = new FormData()
            form.append('removeImage', 'true')

            const res = await app.inject({
                method: 'PATCH',
                url: '/exercises/ex-1',
                cookies: { access_token: token },
                headers: form.getHeaders(),
                payload: form,
            })

            expect(res.statusCode).toBe(200)
            const updateCallData = mockPrisma.exercise.update.mock.calls[0]![0].data
            expect(updateCallData.imageUrl).toBeNull()
        })
    })

    // ─── DELETE /exercises/:id ───────────────────────────────────
    describe('DELETE /exercises/:id', () => {
        it('should delete own exercise', async () => {
            mockPrisma.exercise.findFirst.mockResolvedValue({ id: 'ex-1', userId: 'user-1' })
            mockPrisma.exercise.delete.mockResolvedValue({})

            const res = await app.inject({
                method: 'DELETE',
                url: '/exercises/ex-1',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(204)
            expect(mockPrisma.exercise.delete).toHaveBeenCalledWith({ where: { id: 'ex-1' } })
        })

        it('should return 404 for non-existent or other user exercise', async () => {
            mockPrisma.exercise.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'DELETE',
                url: '/exercises/ex-1',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(404)
            expect(mockPrisma.exercise.delete).not.toHaveBeenCalled()
        })
    })
})
