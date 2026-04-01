import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'

function toLocalDateString(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date()
    // Limit to the end of the current day (no future bleeding)
    end.setHours(23, 59, 59, 999)

    const start = new Date()
    start.setHours(0, 0, 0, 0)
    
    if (period === 'thisWeek') {
        const day = start.getDay()
        const diff = day === 0 ? -6 : 1 - day
        start.setDate(start.getDate() + diff)
    } else if (period === 'week') {
        start.setDate(start.getDate() - 7)
    } else if (period === 'month') {
        start.setDate(start.getDate() - 30)
    } else if (period === '3months') {
        start.setDate(start.getDate() - 90)
    } else {
        start.setFullYear(2000) // all time
    }
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
        const totalDuration = workouts.reduce((t, w) => t + (w.duration ?? 0), 0)

        return { totalWorkouts, totalSets, totalVolume, avgDuration, totalDuration }
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

            const weekKey = toLocalDateString(monday)

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
                exercise: true,
            },
            orderBy: { workout: { date: 'asc' } }
        })

        const data = workoutExercises.map(we => {
            const type = we.exercise.type
            let bestSet = null

            if (we.sets.length > 0) {
                if (type === 'WEIGHTED') {
                    const valid = we.sets.filter(s => s.weight && s.reps)
                    if (valid.length > 0) {
                        bestSet = valid.reduce((best, s) => {
                            const orm = estimateOneRM(s.weight!, s.reps!)
                            const bestOrm = best ? estimateOneRM(best.weight!, best.reps!) : 0
                            return orm > bestOrm ? s : best
                        }, valid[0])
                    }
                } else if (type === 'BODYWEIGHT') {
                    const valid = we.sets.filter(s => s.reps)
                    if (valid.length > 0) bestSet = valid.reduce((best, s) => s.reps! > (best?.reps ?? 0) ? s : best, valid[0])
                } else if (type === 'CARDIO') {
                    bestSet = we.sets.reduce((best, s) => {
                        const d1 = s.distance ?? 0; const d2 = best?.distance ?? 0
                        if (d1 > d2) return s
                        if (d1 === d2 && (s.duration ?? 0) > (best?.duration ?? 0)) return s
                        return best
                    }, we.sets[0])
                }
            }

            const primaryValue = type === 'WEIGHTED' && bestSet ? estimateOneRM(bestSet.weight!, bestSet.reps!)
                : type === 'BODYWEIGHT' && bestSet ? bestSet.reps
                    : type === 'CARDIO' && bestSet ? (bestSet.distance || null)
                        : null

            return {
                date: toLocalDateString(we.workout.date),
                type,
                bestWeight: bestSet?.weight ?? null,
                bestReps: bestSet?.reps ?? null,
                bestDistance: bestSet?.distance ?? null,
                bestDuration: bestSet?.duration ?? null,
                estimatedOneRM: type === 'WEIGHTED' && bestSet ? primaryValue : null,
                primaryValue,
                volume: we.sets.reduce((t, s) => t + (s.weight && s.reps ? s.weight * s.reps : 0), 0),
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
            type: string
            bestWeight: number | null
            bestReps: number | null
            bestDistance: number | null
            bestDuration: number | null
            estimatedOneRM: number | null
            muscleGroup: string
        }>()

        for (const we of workoutExercises) {
            for (const set of we.sets) {
                const type = we.exercise.type
                let isBetter = false
                const orm = (set.weight && set.reps) ? estimateOneRM(set.weight, set.reps) : 0
                const reps = set.reps ?? 0
                const distance = set.distance ?? 0
                const duration = set.duration ?? 0

                const existing = prMap.get(we.exerciseId)

                if (!existing) {
                    isBetter = true
                } else {
                    if (type === 'WEIGHTED') {
                        isBetter = orm > (existing.estimatedOneRM ?? 0)
                    } else if (type === 'BODYWEIGHT') {
                        isBetter = reps > (existing.bestReps ?? 0)
                    } else if (type === 'CARDIO') {
                        // Better is more distance, or more duration if distance is same
                        isBetter = distance > (existing.bestDistance ?? 0) || (distance === (existing.bestDistance ?? 0) && duration > (existing.bestDuration ?? 0))
                    }
                }

                if (isBetter) {
                    prMap.set(we.exerciseId, {
                        exerciseId: we.exerciseId,
                        exerciseName: we.exercise.name,
                        type,
                        bestWeight: set.weight ?? null,
                        bestReps: set.reps ?? null,
                        bestDistance: set.distance ?? null,
                        bestDuration: set.duration ?? null,
                        estimatedOneRM: type === 'WEIGHTED' ? orm : null,
                        muscleGroup: we.exercise.muscleGroup,
                    })
                }
            }
        }

        const prs = Array.from(prMap.values())
            .sort((a, b) => {
                const priority: Record<string, number> = { WEIGHTED: 0, BODYWEIGHT: 1, CARDIO: 2 }
                const pA = priority[a.type] ?? 99
                const pB = priority[b.type] ?? 99
                return pA - pB || a.exerciseName.localeCompare(b.exerciseName)
            })
            .slice(0, 10)

        return { prs }
    })

    // GET /stats/muscles
    app.get('/stats/muscles', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const { period = 'month', target } = request.query as { period?: string, target?: string }
        const { start, end } = getDateRange(period)

        const workoutExercises = await app.prisma.workoutExercise.findMany({
            where: { workout: { userId, date: { gte: start, lte: end } } },
            include: {
                sets: true,
                exercise: true,
            }
        })

        const muscleStats: Record<string, { volume: number; reps: number; duration: number }> = {}

        for (const we of workoutExercises) {
            const muscles = target === 'true' && we.exercise.targetMuscle.length > 0 
                ? we.exercise.targetMuscle 
                : [we.exercise.muscleGroup]

            const stats = we.sets.reduce((acc, s) => {
                acc.volume += (s.weight && s.reps ? s.weight * s.reps : 0)
                acc.reps += (s.reps ?? 0)
                acc.duration += (s.duration ?? 0)
                return acc
            }, { volume: 0, reps: 0, duration: 0 })

            for (const muscle of muscles) {
                if (!muscleStats[muscle]) {
                    muscleStats[muscle] = { volume: 0, reps: 0, duration: 0 }
                }

                muscleStats[muscle].volume += stats.volume
                muscleStats[muscle].reps += stats.reps
                muscleStats[muscle].duration += stats.duration
            }
        }

        return { data: muscleStats }
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
                weekStart: toLocalDateString(weekStart),
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