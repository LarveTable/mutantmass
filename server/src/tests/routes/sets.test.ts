import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp, generateAccessToken, type MockPrisma } from '../helpers/buildApp.js'
import type { FastifyInstance } from 'fastify'

describe('Set Routes', () => {
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

    // ─── POST /workouts/:workoutId/exercises ─────────────────────

    describe('POST /workouts/:workoutId/exercises', () => {
        it('should add an exercise to a workout', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.exercise.findFirst.mockResolvedValue({ id: 'ex-1', name: 'Bench Press' })
            mockPrisma.workoutExercise.findFirst.mockResolvedValue(null) // no existing exercises
            mockPrisma.workoutExercise.create.mockResolvedValue({
                id: 'we-1',
                workoutId: 'w-1',
                exerciseId: 'ex-1',
                order: 0,
                exercise: { id: 'ex-1', name: 'Bench Press' },
                sets: [],
            })

            const res = await app.inject({
                method: 'POST',
                url: '/workouts/w-1/exercises',
                cookies: { access_token: token },
                payload: { exerciseId: 'ex-1' },
            })

            expect(res.statusCode).toBe(201)
            expect(res.json().workoutExercise.exerciseId).toBe('ex-1')
        })

        it('should return 404 if workout not found', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'POST',
                url: '/workouts/nonexistent/exercises',
                cookies: { access_token: token },
                payload: { exerciseId: 'ex-1' },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Workout not found')
        })

        it('should return 404 if exercise not found', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.exercise.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'POST',
                url: '/workouts/w-1/exercises',
                cookies: { access_token: token },
                payload: { exerciseId: 'nonexistent' },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Exercise not found')
        })

        it('should return 401 without auth', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/workouts/w-1/exercises',
                payload: { exerciseId: 'ex-1' },
            })

            expect(res.statusCode).toBe(401)
        })
    })

    // ─── DELETE /workouts/:workoutId/exercises/:workoutExerciseId

    describe('DELETE /workouts/:workoutId/exercises/:workoutExerciseId', () => {
        it('should remove an exercise from a workout', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.workoutExercise.findFirst.mockResolvedValue({ id: 'we-1', workoutId: 'w-1' })
            mockPrisma.workoutExercise.delete.mockResolvedValue({})

            const res = await app.inject({
                method: 'DELETE',
                url: '/workouts/w-1/exercises/we-1',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(204)
            expect(mockPrisma.workoutExercise.delete).toHaveBeenCalledWith({ where: { id: 'we-1' } })
        })

        it('should return 404 if workout not found', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'DELETE',
                url: '/workouts/nonexistent/exercises/we-1',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Workout not found')
        })

        it('should return 404 if exercise not in workout', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.workoutExercise.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'DELETE',
                url: '/workouts/w-1/exercises/nonexistent',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Exercise not found in workout')
        })
    })

    // ─── POST .../sets ───────────────────────────────────────────

    describe('POST /workouts/:workoutId/exercises/:workoutExerciseId/sets', () => {
        it('should add a set to a workout exercise', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.workoutExercise.findFirst.mockResolvedValue({ id: 'we-1', workoutId: 'w-1' })
            mockPrisma.set.findFirst.mockResolvedValue(null) // no existing sets
            mockPrisma.set.create.mockResolvedValue({
                id: 's-1',
                workoutExerciseId: 'we-1',
                order: 0,
                reps: 10,
                weight: 60,
                duration: null,
                distance: null,
                restTime: null,
            })

            const res = await app.inject({
                method: 'POST',
                url: '/workouts/w-1/exercises/we-1/sets',
                cookies: { access_token: token },
                payload: { reps: 10, weight: 60 },
            })

            expect(res.statusCode).toBe(201)
            expect(res.json().set.reps).toBe(10)
            expect(res.json().set.weight).toBe(60)
        })

        it('should return 404 if workout not found', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'POST',
                url: '/workouts/nonexistent/exercises/we-1/sets',
                cookies: { access_token: token },
                payload: { reps: 10 },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Workout not found')
        })

        it('should return 404 if exercise not in workout', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.workoutExercise.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'POST',
                url: '/workouts/w-1/exercises/nonexistent/sets',
                cookies: { access_token: token },
                payload: { reps: 10 },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Exercise not found in workout')
        })
    })

    // ─── PATCH .../sets/:setId ───────────────────────────────────

    describe('PATCH /workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId', () => {
        it('should update a set', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.set.findFirst.mockResolvedValue({
                id: 's-1',
                workoutExerciseId: 'we-1',
                reps: 10,
                weight: 60,
            })
            mockPrisma.set.update.mockResolvedValue({
                id: 's-1',
                workoutExerciseId: 'we-1',
                reps: 12,
                weight: 65,
            })

            const res = await app.inject({
                method: 'PATCH',
                url: '/workouts/w-1/exercises/we-1/sets/s-1',
                cookies: { access_token: token },
                payload: { reps: 12, weight: 65 },
            })

            expect(res.statusCode).toBe(200)
            expect(res.json().set.reps).toBe(12)
            expect(res.json().set.weight).toBe(65)
        })

        it('should return 404 if set not found', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.set.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'PATCH',
                url: '/workouts/w-1/exercises/we-1/sets/nonexistent',
                cookies: { access_token: token },
                payload: { reps: 12 },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Set not found')
        })
    })

    // ─── DELETE .../sets/:setId ──────────────────────────────────

    describe('DELETE /workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId', () => {
        it('should delete a set', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.set.findFirst.mockResolvedValue({ id: 's-1', workoutExerciseId: 'we-1' })
            mockPrisma.set.delete.mockResolvedValue({})

            const res = await app.inject({
                method: 'DELETE',
                url: '/workouts/w-1/exercises/we-1/sets/s-1',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(204)
            expect(mockPrisma.set.delete).toHaveBeenCalledWith({ where: { id: 's-1' } })
        })

        it('should return 404 if set not found', async () => {
            mockPrisma.workout.findFirst.mockResolvedValue({ id: 'w-1', userId: 'user-1' })
            mockPrisma.set.findFirst.mockResolvedValue(null)

            const res = await app.inject({
                method: 'DELETE',
                url: '/workouts/w-1/exercises/we-1/sets/nonexistent',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(404)
            expect(res.json().error).toBe('Set not found')
        })

        it('should return 401 without auth', async () => {
            const res = await app.inject({
                method: 'DELETE',
                url: '/workouts/w-1/exercises/we-1/sets/s-1',
            })

            expect(res.statusCode).toBe(401)
        })
    })
})
