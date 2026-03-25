import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'

export default async function workoutRoutes(app: FastifyInstance) {
    // GET /workouts - list all workouts for the logged in user
    app.get('/workouts', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }

        const workouts = await app.prisma.workout.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: {
                workoutExercises: {
                    include: {
                        exercise: true,
                        sets: { orderBy: { order: 'asc' } },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        })

        return { workouts }
    })

    // GET /workouts/:id - get one workout with all its exercises and sets
    app.get('/workouts/:id', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { id } = request.params as { id: string }

        const workout = await app.prisma.workout.findFirst({
            where: { id, userId },
            include: {
                workoutExercises: {
                    include: {
                        exercise: true,
                        sets: { orderBy: { order: 'asc' } },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!workout) return reply.status(404).send({ error: 'Workout not found' })

        return { workout }
    })

    // POST /workouts - create a new workout
    app.post('/workouts', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { name, note, date } = request.body as {
            name?: string
            note?: string
            date?: string
        }

        const workout = await app.prisma.workout.create({
            data: {
                userId,
                name: name ?? null,
                note: note ?? null,
                date: date ? new Date(date) : new Date(),
            },
        })

        return reply.status(201).send({ workout })
    })

    // PATCH /workouts/:id - update a workout
    app.patch('/workouts/:id', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { id } = request.params as { id: string }
        const { name, note, date, duration } = request.body as {
            name?: string
            note?: string
            date?: string
            duration?: number
        }

        const existing = await app.prisma.workout.findFirst({ where: { id, userId } })
        if (!existing) return reply.status(404).send({ error: 'Workout not found' })

        const workout = await app.prisma.workout.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(note !== undefined && { note }),
                ...(date !== undefined && { date: new Date(date) }),
                ...(duration !== undefined && { duration }),
            },
        })

        return { workout }
    })

    // DELETE /workouts/:id - delete a workout
    app.delete('/workouts/:id', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { id } = request.params as { id: string }

        const existing = await app.prisma.workout.findFirst({ where: { id, userId } })
        if (!existing) return reply.status(404).send({ error: 'Workout not found' })

        await app.prisma.workout.delete({ where: { id } })

        return reply.status(204).send()
    })
}