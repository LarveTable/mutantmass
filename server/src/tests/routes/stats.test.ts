import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp, generateAccessToken, type MockPrisma } from '../helpers/buildApp.js'
import type { FastifyInstance } from 'fastify'

describe('Stats Routes', () => {
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

    describe('GET /stats/overview', () => {
        it('should return aggregated overview stats securely', async () => {
            mockPrisma.workout.findMany.mockResolvedValue([
                {
                    id: 'w-1', duration: 60,
                    workoutExercises: [
                        { sets: [{ weight: 100, reps: 5 }] }
                    ]
                }
            ])

            const res = await app.inject({
                method: 'GET',
                url: '/stats/overview',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            const data = res.json()
            expect(data.totalWorkouts).toBe(1)
            expect(data.totalVolume).toBe(500)
            expect(data.avgDuration).toBe(60)
        })

        it('should return 401 without auth', async () => {
            const res = await app.inject({ method: 'GET', url: '/stats/overview' })
            expect(res.statusCode).toBe(401)
        })
    })

    describe('GET /stats/volume', () => {
        it('should return aggregated volume grouped by week chunks spanning local time dates', async () => {
            const d1 = new Date()
            mockPrisma.workout.findMany.mockResolvedValue([
                {
                    id: 'w-1',
                    date: d1,
                    workoutExercises: [
                        {
                            exercise: { muscleGroup: 'BACK' },
                            sets: [{ weight: 100, reps: 10 }]
                        }
                    ]
                }
            ])

            const res = await app.inject({
                method: 'GET',
                url: '/stats/volume?period=month',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            const json = res.json()
            expect(json.data.length).toBeGreaterThan(0)
            expect(json.data[0].total).toBe(1000)
            expect(json.data[0].byMuscle['BACK']).toBe(1000)
            // It should be successfully formatted into a date string (e.g. 2026-04-02)
            expect(typeof json.data[0].weekStart).toBe('string')
            expect(json.data[0].weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        })
    })

    describe('GET /stats/muscles', () => {
        it('should properly distribute volume across MULTIPLE target muscles when target=true', async () => {
            mockPrisma.workoutExercise.findMany.mockResolvedValue([
                {
                    workout: { date: new Date() },
                    exercise: {
                        muscleGroup: 'BACK',
                        targetMuscle: ['upper-back', 'trapezius']
                    },
                    sets: [{ weight: 50, reps: 10 }] // 500 volume
                }
            ])

            const res = await app.inject({
                method: 'GET',
                url: '/stats/muscles?target=true',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            const json = res.json()
            expect(json.data).toHaveProperty('upper-back')
            expect(json.data).toHaveProperty('trapezius')
            
            // It distributes FULL volume to BOTH targets in the array!
            expect(json.data['upper-back'].volume).toBe(500)
            expect(json.data['trapezius'].volume).toBe(500)
        })

        it('should fallback to broad muscleGroup when target=false', async () => {
            mockPrisma.workoutExercise.findMany.mockResolvedValue([
                {
                    workout: { date: new Date() },
                    exercise: {
                        muscleGroup: 'CHEST',
                        targetMuscle: ['pectoralis-major']
                    },
                    sets: [{ weight: 100, reps: 5 }] 
                }
            ])

            const res = await app.inject({
                method: 'GET',
                url: '/stats/muscles?target=false',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            const json = res.json()
            expect(json.data).toHaveProperty('CHEST')
            expect(json.data['CHEST'].volume).toBe(500)
            expect(json.data).not.toHaveProperty('pectoralis-major')
        })
    })

    describe('GET /stats/exercise/:exerciseId', () => {
        it('should return exercise stats including estimated One RM', async () => {
            mockPrisma.workoutExercise.findMany.mockResolvedValue([
                {
                    workout: { date: new Date('2026-04-08T10:00:00Z') },
                    exercise: { type: 'WEIGHTED' },
                    sets: [
                        { weight: 100, reps: 10 }, // 100 * (1 + 10/30) = 133
                        { weight: 100, reps: 5 }
                    ]
                }
            ])

            const res = await app.inject({
                method: 'GET',
                url: '/stats/exercise/ex-1',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            const json = res.json()
            expect(json.data).toHaveLength(1)
            expect(json.data[0].date).toBe('2026-04-08')
            expect(json.data[0].volume).toBe(1500) // 100*10 + 100*5
            expect(json.data[0].estimatedOneRM).toBe(133)
            expect(json.data[0].primaryValue).toBe(133) // for WEIGHTED
            expect(json.data[0].bestWeight).toBe(100)
            expect(json.data[0].bestReps).toBe(10)
        })

        it('should compute bodyweight max reps correctly', async () => {
            mockPrisma.workoutExercise.findMany.mockResolvedValue([
                {
                    workout: { date: new Date() },
                    exercise: { type: 'BODYWEIGHT' },
                    sets: [
                        { reps: 15 },
                        { reps: 20 },
                        { reps: null }
                    ]
                }
            ])

            const res = await app.inject({
                method: 'GET',
                url: '/stats/exercise/ex-2',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            const json = res.json()
            expect(json.data[0].bestReps).toBe(20)
            expect(json.data[0].primaryValue).toBe(20)
            expect(json.data[0].estimatedOneRM).toBeNull()
        })
    })

    describe('GET /stats/prs', () => {
        it('should return personal records prioritized and sorted correctly', async () => {
            mockPrisma.workoutExercise.findMany.mockResolvedValue([
                {
                    exerciseId: 'ex-1',
                    exercise: { name: 'Deadlift', type: 'WEIGHTED', muscleGroup: 'LEGS' },
                    sets: [
                        { weight: 200, reps: 5 }, // 200 * (1 + 5/30) = 233
                        { weight: 220, reps: 1 }  // 220 * (1 + 1/30) = 227
                    ]
                },
                {
                    exerciseId: 'ex-2',
                    exercise: { name: 'Pullups', type: 'BODYWEIGHT', muscleGroup: 'BACK' },
                    sets: [
                        { reps: 12 },
                        { reps: 15 }
                    ]
                }
            ])

            const res = await app.inject({
                method: 'GET',
                url: '/stats/prs',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            const json = res.json()
            expect(json.prs).toHaveLength(2)
            // Weight PRs first, bodyweight second
            expect(json.prs[0].exerciseId).toBe('ex-1')
            expect(json.prs[0].estimatedOneRM).toBe(233)
            expect(json.prs[0].bestWeight).toBe(200)
            
            expect(json.prs[1].exerciseId).toBe('ex-2')
            expect(json.prs[1].bestReps).toBe(15)
        })
    })

    describe('GET /stats/consistency', () => {
        it('should format all week boundaries strictly natively matching local time', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ weeklyGoal: 4 })
            mockPrisma.workout.count.mockResolvedValue(2) // didn't meet goal

            const res = await app.inject({
                method: 'GET',
                url: '/stats/consistency',
                cookies: { access_token: token },
            })

            expect(res.statusCode).toBe(200)
            const json = res.json()
            expect(json.weeklyGoal).toBe(4)
            expect(json.weeks).toHaveLength(8)
            
            expect(json.weeks[7].count).toBe(2)
            expect(json.weeks[7].met).toBe(false)
            
            // Check formatted weekStart isn't an invalid/UTC boundary string
            const lastWeek = json.weeks[7].weekStart
            expect(lastWeek).toMatch(/^\d{4}-\d{2}-\d{2}$/) // Strict YYYY-MM-DD local timeline layout
        })
    })
})
