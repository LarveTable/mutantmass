import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp, generateAccessToken, type MockPrisma } from '../helpers/buildApp.js'
import type { FastifyInstance } from 'fastify'

describe('Workout Routes', () => {
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

    // ─── GET /workouts ───────────────────────────────────────────

    describe('GET /workouts', () => {
        it('should list workouts for the authenticated user', async () => {
            const workouts = [
                { id: 'w-1', userId: 'user-1', name: 'Morning Push', workoutExercises: [] },
                { id: 'w-2', userId: 'user-1', name: 'Evening Pull', workoutExercises: [] },
            ]

            mockPrisma.workout.findMany.mockResolvedValue(workouts)

            const res = await app.inject({
                method: 'GET',
                url: '/workouts',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().workouts).toHaveLength(2)

            // Should scope query to current user
            const call = mockPrisma.workout.findMany.mock.calls[0]![0] as any
            expect(call.where.userId).toBe('user-1')
        })

        it('should return 401 without auth', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/workouts',
            })

            expect(res.statusCode).toBe(401)
        })

        it('should filter workouts by start and end date range', async () => {
            mockPrisma.workout.findMany.mockResolvedValue([])

            const startStr = '2026-04-01T00:00:00Z'
            const endStr = '2026-04-30T23:59:59Z'

            const res = await app.inject({
                method: 'GET',
                url: `/workouts?start=${startStr}&end=${endStr}`,
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)

            const call = mockPrisma.workout.findMany.mock.calls[0]![0] as any
            expect(call.where.date.gte.toISOString()).toBe(new Date(startStr).toISOString())
            expect(call.where.date.lt.toISOString()).toBe(new Date(endStr).toISOString())
        })

        it('should filter workouts using different timezones correctly', async () => {
            mockPrisma.workout.findMany.mockResolvedValue([])

            // Europe/Paris (CET)
            const startStr = encodeURIComponent('2026-04-01T00:00:00+02:00')
            // America/New_York (EST)
            const endStr = encodeURIComponent('2026-04-30T23:59:59-05:00')

            const res = await app.inject({
                method: 'GET',
                url: `/workouts?start=${startStr}&end=${endStr}`,
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)

            const call = mockPrisma.workout.findMany.mock.calls[0]![0] as any
            // The boundaries should correctly parse to their absolute UTC equivalent
            expect(call.where.date.gte.toISOString()).toBe('2026-03-31T22:00:00.000Z')
            expect(call.where.date.lt.toISOString()).toBe('2026-05-01T04:59:59.000Z')
        })
    })

    // ─── GET /workouts/:id ───────────────────────────────────────

    describe('GET /workouts/:id', () => {
        it('should return a single workout with exercises and sets', async () => {
            const workout = {
                id: 'w-1',
                userId: 'user-1',
                name: 'Push Day',
                workoutExercises: [
                    {
                        id: 'we-1',
                        exercise: { id: 'ex-1', name: 'Bench Press' },
                        sets: [{ id: 's-1', reps: 10, weight: 60 }],
                    },
                ],
            }

            mockPrisma.workout.findFirst.mockResolvedValue(workout)

            const res = await app.inject({
                method: 'GET',
                url: '/workouts/w-1',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().workout.id).toBe('w-1')
            expect(res.json().workout.workoutExercises).toHaveLength(1)
        })

        it('should return 404 for non-existent workout', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'GET',
                url: '/workouts/nonexistent',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Workout not found')
        })
    })

    // ─── POST /workouts ──────────────────────────────────────────

    describe('POST /workouts', () => {
        it('should create a new workout', async () => {
            const created = {
                id: 'w-new',
                userId: 'user-1',
                name: 'Leg Day',
                note: null,
                date: new Date().toISOString(),
            }

            mockPrisma.workout.create.mockResolvedValue(created)

            const res = await app.inject({
                method: 'POST',
                url: '/workouts',
                cookies: { access_token: token },
                payload: { name: 'Leg Day' },
            })

            expect(res.statusCode).toBe(201)
            expect(res.json().workout.name).toBe('Leg Day')
        })

        it('should create a workout with no name (defaults)', async () => {
            const created = {
                id: 'w-new',
                userId: 'user-1',
                name: null,
                note: null,
                date: new Date().toISOString(),
            }

            mockPrisma.workout.create.mockResolvedValue(created)

            const before = Date.now()
            const res = await app.inject({
                method: 'POST',
                url: '/workouts',
                cookies: { access_token: token },
                payload: {},
            })
            const after = Date.now()

            expect(res.statusCode).toBe(201)

            // Should fallback to Date.now() internally
            const call = mockPrisma.workout.create.mock.calls[0]![0] as any
            const insertedDate = new Date(call.data.date).getTime()
            expect(insertedDate).toBeGreaterThanOrEqual(before)
            expect(insertedDate).toBeLessThanOrEqual(after)
        })

        it('should create a workout using a specific timezone date', async () => {
            mockPrisma.workout.create.mockResolvedValue({ id: 'w-1', date: new Date() })

            await app.inject({
                method: 'POST',
                url: '/workouts',
                cookies: { access_token: token },
                payload: { name: 'Late TZ Workout', date: '2026-04-15T23:00:00-08:00' }, // PST
            })

            const call = mockPrisma.workout.create.mock.calls[0]![0] as any
            expect(call.data.date.toISOString()).toBe('2026-04-16T07:00:00.000Z') // +8h in UTC
        })

        it('should return 401 without auth', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/workouts',
                payload: { name: 'Leg Day' },
            })

            expect(res.statusCode).toBe(401)
        })
    })

    // ─── PATCH /workouts/:id ─────────────────────────────────────

    describe('PATCH /workouts/:id', () => {
        it('should update workout fields', async () => {
            const existing = { id: 'w-1', userId: 'user-1', name: 'Old Name' }
            const updated = { ...existing, name: 'New Name' }

            mockPrisma.workout.findFirst.mockResolvedValue(existing)
            mockPrisma.workout.update.mockResolvedValue(updated)

            const res = await app.inject({
                method: 'PATCH',
                url: '/workouts/w-1',
                cookies: { access_token: token },
                payload: { name: 'New Name' },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().workout.name).toBe('New Name')
        })

        it('should return 404 for non-existent workout', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'PATCH',
                url: '/workouts/nonexistent',
                cookies: { access_token: token },
                payload: { name: 'Updated' },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Workout not found')
        })
    })

    // ─── DELETE /workouts/:id ────────────────────────────────────

    describe('DELETE /workouts/:id', () => {
        it('should delete the workout', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.workout.delete.mockResolvedValue({})

            const res = await app.inject({
                method: 'DELETE',
                url: '/workouts/w-1',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(204)
            expect(mockPrisma.workout.delete).toHaveBeenCalledWith({ where: { id: 'w-1' } })
        })

        it('should return 404 for non-existent workout', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'DELETE',
                url: '/workouts/nonexistent',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Workout not found')
        })
    })
})
