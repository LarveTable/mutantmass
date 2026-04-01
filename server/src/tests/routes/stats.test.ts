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
