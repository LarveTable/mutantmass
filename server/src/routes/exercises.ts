import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'

export default async function exerciseRoutes(app: FastifyInstance) {
    // GET /exercises - list global + public + user's own exercises
    app.get('/exercises', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }

        const exercises = await app.prisma.exercise.findMany({
            where: {
                OR: [
                    { userId: null },              // global
                    { isPublic: true },            // public user-created
                    { userId },                    // current user's private
                ],
            },
            orderBy: { name: 'asc' },
        })

        return { exercises }
    })

    // POST /exercises - create a custom exercise
    app.post('/exercises', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { name, type, isPublic, imageUrl } = request.body as {
            name: string
            type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
            isPublic?: boolean
            imageUrl?: string
        }

        if (!name || !type) {
            return reply.status(400).send({ error: 'name and type are required' })
        }

        if (!['WEIGHTED', 'BODYWEIGHT', 'CARDIO'].includes(type)) {
            return reply.status(400).send({ error: 'invalid type' })
        }

        const exercise = await app.prisma.exercise.create({
            data: {
                name,
                type,
                isPublic: isPublic ?? false,
                userId,
                imageUrl: imageUrl ?? null,
            },
        })

        return reply.status(201).send({ exercise })
    })
}