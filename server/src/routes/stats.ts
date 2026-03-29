import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'

function getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date()
    const start = new Date()
    if (period === 'week') start.setDate(start.getDate() - 7)
    else if (period === 'month') start.setMonth(start.getMonth() - 1)
    else if (period === '3months') start.setMonth(start.getMonth() - 3)
    else start.setFullYear(2000) // all time
    return { start, end }
}

function estimateOneRM(weight: number, reps: number): number {
    return Math.round(weight * (1 + reps / 30))
}

export default async function statsRoutes(app: FastifyInstance) {
    // GET /stats/overview
    app.get('/stats/overview', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const { period = 'month' } = request.query as { period?: string }
        const { start, end } = getDateRange(period)

        const workouts = await app.prisma.workout.findMany({
            where: { userId, date: { gte: start, lte: end } },
            include: {
                workoutExercises: {
                    include: { sets: true }
                }
            }
        })

        const totalWorkouts = workouts.length
        const totalSets = workouts.reduce((t, w) =>
            t + w.workoutExercises.reduce((t2, we) => t2 + we.sets.length, 0), 0)
        const totalVolume = workouts.reduce((t, w) =>
            t + w.workoutExercises.reduce((t2, we) =>
                t2 + we.sets.reduce((t3, s) =>
                    t3 + (s.weight && s.reps ? s.weight * s.reps : 0), 0), 0), 0)
        const avgDuration = workouts.length > 0
            ? Math.round(workouts.reduce((t, w) => t + (w.duration ?? 0), 0) / workouts.length)
            : 0

        return { totalWorkouts, totalSets, totalVolume, avgDuration }
    })

    // GET /stats/volume
    app.get('/stats/volume', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const { period = 'month' } = request.query as { period?: string }
        const { start, end } = getDateRange(period)

        const workouts = await app.prisma.workout.findMany({
            where: { userId, date: { gte: start, lte: end } },
            orderBy: { date: 'asc' },
            include: {
                workoutExercises: {
                    include: {
                        exercise: true,
                        sets: true,
                    }
                }
            }
        })

        // Group by week (Monday as start)
        const weekMap = new Map<string, {
            weekStart: string
            total: number
            byMuscle: Record<string, number>
        }>()

        for (const workout of workouts) {
            const date = new Date(workout.date)
            const day = date.getDay()
            const diff = day === 0 ? -6 : 1 - day
            const monday = new Date(date)
            monday.setDate(date.getDate() + diff)
            monday.setHours(0, 0, 0, 0)

            const y = monday.getFullYear()
            const m = String(monday.getMonth() + 1).padStart(2, '0')
            const d = String(monday.getDate()).padStart(2, '0')
            const weekKey = `${y}-${m}-${d}`

            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, { weekStart: weekKey, total: 0, byMuscle: {} })
            }

            const week = weekMap.get(weekKey)!

            for (const we of workout.workoutExercises) {
                const muscle = we.exercise.muscleGroup ?? 'FULL_BODY'
                const volume = we.sets.reduce((t, s) =>
                    t + (s.weight && s.reps ? s.weight * s.reps : 0), 0)

                week.total += volume
                week.byMuscle[muscle] = (week.byMuscle[muscle] ?? 0) + volume
            }
        }

        const data = Array.from(weekMap.values()).sort((a, b) =>
            a.weekStart.localeCompare(b.weekStart)
        )

        // Compute 4-week rolling average
        const dataWithAvg = data.map((week, i) => {
            const slice = data.slice(Math.max(0, i - 3), i + 1)
            const avg = Math.round(slice.reduce((t, w) => t + w.total, 0) / slice.length)
            return { ...week, rollingAvg: avg }
        })

        return { data: dataWithAvg }
    })

    // GET /stats/exercise/:exerciseId
    app.get('/stats/exercise/:exerciseId', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const { exerciseId } = request.params as { exerciseId: string }
        const { period = 'month' } = request.query as { period?: string }
        const { start, end } = getDateRange(period)

        const workoutExercises = await app.prisma.workoutExercise.findMany({
            where: {
                exerciseId,
                workout: { userId, date: { gte: start, lte: end } }
            },
            include: {
                sets: true,
                workout: true,
            },
            orderBy: { workout: { date: 'asc' } }
        })

        const data = workoutExercises.map(we => {
            const weightedSets = we.sets.filter(s => s.weight && s.reps)
            const bestSet = weightedSets.reduce((best, s) => {
                const orm = estimateOneRM(s.weight!, s.reps!)
                const bestOrm = best ? estimateOneRM(best.weight!, best.reps!) : 0
                return orm > bestOrm ? s : best
            }, weightedSets[0])

            return {
                date: we.workout.date.toISOString().split('T')[0],
                bestWeight: bestSet?.weight ?? null,
                bestReps: bestSet?.reps ?? null,
                estimatedOneRM: bestSet ? estimateOneRM(bestSet.weight!, bestSet.reps!) : null,
                volume: we.sets.reduce((t, s) =>
                    t + (s.weight && s.reps ? s.weight * s.reps : 0), 0),
            }
        })

        return { data }
    })

    // GET /stats/prs
    app.get('/stats/prs', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }

        const workoutExercises = await app.prisma.workoutExercise.findMany({
            where: { workout: { userId } },
            include: {
                sets: true,
                exercise: true,
            }
        })

        const prMap = new Map<string, {
            exerciseId: string
            exerciseName: string
            bestWeight: number
            bestReps: number
            estimatedOneRM: number
            muscleGroup: string
        }>()

        for (const we of workoutExercises) {
            for (const set of we.sets) {
                if (!set.weight || !set.reps) continue
                const orm = estimateOneRM(set.weight, set.reps)
                const existing = prMap.get(we.exerciseId)
                if (!existing || orm > existing.estimatedOneRM) {
                    prMap.set(we.exerciseId, {
                        exerciseId: we.exerciseId,
                        exerciseName: we.exercise.name,
                        bestWeight: set.weight,
                        bestReps: set.reps,
                        estimatedOneRM: orm,
                        muscleGroup: we.exercise.muscleGroup,
                    })
                }
            }
        }

        const prs = Array.from(prMap.values())
            .sort((a, b) => b.estimatedOneRM - a.estimatedOneRM)

        return { prs }
    })

    // GET /stats/muscles
    app.get('/stats/muscles', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const { period = 'month' } = request.query as { period?: string }
        const { start, end } = getDateRange(period)

        const workoutExercises = await app.prisma.workoutExercise.findMany({
            where: { workout: { userId, date: { gte: start, lte: end } } },
            include: {
                sets: true,
                exercise: true,
            }
        })

        const muscleVolume: Record<string, number> = {}

        for (const we of workoutExercises) {
            const muscle = we.exercise.muscleGroup
            const volume = we.sets.reduce((t, s) =>
                t + (s.weight && s.reps ? s.weight * s.reps : 0), 0)
            muscleVolume[muscle] = (muscleVolume[muscle] ?? 0) + volume
        }

        return { data: muscleVolume }
    })

    // GET /stats/frequency
    app.get('/stats/frequency', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }

        const start = new Date()
        start.setFullYear(start.getFullYear() - 1)

        const workouts = await app.prisma.workout.findMany({
            where: { userId, date: { gte: start } },
            select: { date: true },
            orderBy: { date: 'asc' }
        })

        const countMap: Record<string, number> = {}
        for (const w of workouts) {
            const d = w.date.toISOString().split('T')[0]!
            countMap[d] = (countMap[d] ?? 0) + 1
        }

        return { data: countMap }
    })

    // GET /stats/consistency
    app.get('/stats/consistency', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }

        const user = await app.prisma.user.findUnique({
            where: { id: userId },
            select: { weeklyGoal: true }
        })

        // Get last 8 weeks
        const weeks: { weekStart: string; count: number; goal: number; met: boolean }[] = []
        const now = new Date()

        for (let i = 7; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i * 7)

            const day = date.getDay()
            const diff = day === 0 ? -6 : 1 - day
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() + diff)
            weekStart.setHours(0, 0, 0, 0)

            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekEnd.getDate() + 7)

            const count = await app.prisma.workout.count({
                where: { userId, date: { gte: weekStart, lt: weekEnd } }
            })

            weeks.push({
                weekStart: weekStart.toISOString().split('T')[0]!,
                count,
                goal: user?.weeklyGoal ?? 3,
                met: count >= (user?.weeklyGoal ?? 3),
            })
        }

        return { weeks, weeklyGoal: user?.weeklyGoal ?? 3 }
    })

    // PATCH /stats/goal - update weekly goal
    app.patch('/stats/goal', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const { weeklyGoal } = request.body as { weeklyGoal: number }

        const user = await app.prisma.user.update({
            where: { id: userId },
            data: { weeklyGoal },
            select: { weeklyGoal: true }
        })

        return { weeklyGoal: user.weeklyGoal }
    })
}