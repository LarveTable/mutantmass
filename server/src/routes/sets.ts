import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'

export default async function setRoutes(app: FastifyInstance) {
    // POST /workouts/:workoutId/exercises - add an exercise to a workout
    app.post('/workouts/:workoutId/exercises', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { workoutId } = request.params as { workoutId: string }
        const { exerciseId, supersetGroup } = request.body as {
            exerciseId: string
            supersetGroup?: number
        }

        const workout = await app.prisma.workout.findFirst({ where: { id: workoutId, userId } })
        if (!workout) return reply.status(404).send({ error: 'Workout not found' })

        const exercise = await app.prisma.exercise.findFirst({
            where: {
                id: exerciseId,
                OR: [
                    { userId: null },
                    { isPublic: true },
                    { userId },
                ],
            },
        })
        if (!exercise) return reply.status(404).send({ error: 'Exercise not found' })

        // Determine the next order value
        const last = await app.prisma.workoutExercise.findFirst({
            where: { workoutId },
            orderBy: { order: 'desc' },
        })

        const workoutExercise = await app.prisma.workoutExercise.create({
            data: {
                workoutId,
                exerciseId,
                order: last ? last.order + 1 : 0,
                supersetGroup: supersetGroup ?? null,
            },
            include: { exercise: true, sets: true },
        })

        return reply.status(201).send({ workoutExercise })
    })

    // DELETE /workouts/:workoutId/exercises/:workoutExerciseId - remove an exercise from a workout
    app.delete('/workouts/:workoutId/exercises/:workoutExerciseId', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { workoutId, workoutExerciseId } = request.params as {
            workoutId: string
            workoutExerciseId: string
        }

        const workout = await app.prisma.workout.findFirst({ where: { id: workoutId, userId } })
        if (!workout) return reply.status(404).send({ error: 'Workout not found' })

        const workoutExercise = await app.prisma.workoutExercise.findFirst({
            where: { id: workoutExerciseId, workoutId },
        })
        if (!workoutExercise) return reply.status(404).send({ error: 'Exercise not found in workout' })

        await app.prisma.workoutExercise.delete({ where: { id: workoutExerciseId } })

        return reply.status(204).send()
    })

    // POST /workouts/:workoutId/exercises/:workoutExerciseId/sets - add a set
    app.post('/workouts/:workoutId/exercises/:workoutExerciseId/sets', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { workoutId, workoutExerciseId } = request.params as {
            workoutId: string
            workoutExerciseId: string
        }
        const { reps, weight, duration, distance, restTime } = request.body as {
            reps?: number
            weight?: number
            duration?: number
            distance?: number
            restTime?: number
        }

        const workout = await app.prisma.workout.findFirst({ where: { id: workoutId, userId } })
        if (!workout) return reply.status(404).send({ error: 'Workout not found' })

        const workoutExercise = await app.prisma.workoutExercise.findFirst({
            where: { id: workoutExerciseId, workoutId },
        })
        if (!workoutExercise) return reply.status(404).send({ error: 'Exercise not found in workout' })

        // Determine the next order value
        const last = await app.prisma.set.findFirst({
            where: { workoutExerciseId },
            orderBy: { order: 'desc' },
        })

        const set = await app.prisma.set.create({
            data: {
                workoutExerciseId,
                order: last ? last.order + 1 : 0,
                reps: reps ?? null,
                weight: weight ?? null,
                duration: duration ?? null,
                distance: distance ?? null,
                restTime: restTime ?? null,
            },
        })

        return reply.status(201).send({ set })
    })

    // PATCH /workouts/:workoutId/exercises/:workoutExerciseId - update exercise note (in a workout)
    app.patch('/workouts/:workoutId/exercises/:workoutExerciseId', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { workoutId, workoutExerciseId } = request.params as {
            workoutId: string
            workoutExerciseId: string
        }
        const { note } = request.body as { note: string }

        const workout = await app.prisma.workout.findFirst({ where: { id: workoutId, userId } })
        if (!workout) return reply.status(404).send({ error: 'Workout not found' })

        const workoutExercise = await app.prisma.workoutExercise.update({
            where: { id: workoutExerciseId },
            data: { note },
        })

        return { workoutExercise }
    })

    // PATCH /workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId - update a set
    app.patch('/workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { workoutId, workoutExerciseId, setId } = request.params as {
            workoutId: string
            workoutExerciseId: string
            setId: string
        }
        const { reps, weight, duration, distance, restTime } = request.body as {
            reps?: number
            weight?: number
            duration?: number
            distance?: number
            restTime?: number
        }

        const workout = await app.prisma.workout.findFirst({ where: { id: workoutId, userId } })
        if (!workout) return reply.status(404).send({ error: 'Workout not found' })

        const set = await app.prisma.set.findFirst({
            where: { id: setId, workoutExerciseId },
        })
        if (!set) return reply.status(404).send({ error: 'Set not found' })

        const updated = await app.prisma.set.update({
            where: { id: setId },
            data: {
                ...(reps !== undefined && { reps }),
                ...(weight !== undefined && { weight }),
                ...(duration !== undefined && { duration }),
                ...(distance !== undefined && { distance }),
                ...(restTime !== undefined && { restTime }),
            },
        })

        return { set: updated }
    })

    // DELETE /workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId - delete a set
    app.delete('/workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { workoutId, workoutExerciseId, setId } = request.params as {
            workoutId: string
            workoutExerciseId: string
            setId: string
        }

        const workout = await app.prisma.workout.findFirst({ where: { id: workoutId, userId } })
        if (!workout) return reply.status(404).send({ error: 'Workout not found' })

        const set = await app.prisma.set.findFirst({
            where: { id: setId, workoutExerciseId },
        })
        if (!set) return reply.status(404).send({ error: 'Set not found' })

        await app.prisma.set.delete({ where: { id: setId } })

        return reply.status(204).send()
    })
}