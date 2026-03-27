import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'

export default async function exerciseRoutes(app: FastifyInstance) {
    // GET /exercises - list global + public + user's own exercises
    app.get('/exercises', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const { type, muscleGroup } = request.query as {
            type?: string
            muscleGroup: string
        }

        const exercises = await app.prisma.exercise.findMany({
            where: {
                OR: [
                    { userId: null },
                    { isPublic: true },
                    { userId },
                ],
                ...(type && { type: type as any }),
                ...(muscleGroup && { muscleGroup: muscleGroup as any }),
            },
            orderBy: { name: 'asc' },
        })

        return { exercises }
    })

    // POST /exercises - create a custom exercise
    app.post('/exercises', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { name, type, muscleGroup, isPublic, imageUrl } = request.body as {
            name: string
            type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
            muscleGroup: 'CHEST' | 'BACK' | 'SHOULDERS' | 'BICEPS' | 'TRICEPS' | 'FOREARMS' | 'LEGS' | 'GLUTES' | 'CORE' | 'CARDIO' | 'FULL_BODY'
            isPublic?: boolean
            imageUrl?: string
        }

        if (!name || !type || !muscleGroup) {
            return reply.status(400).send({ error: 'name, type and muscle group are required' })
        }

        if (!['WEIGHTED', 'BODYWEIGHT', 'CARDIO'].includes(type)) {
            return reply.status(400).send({ error: 'invalid type' })
        }

        const exercise = await app.prisma.exercise.create({
            data: {
                name,
                type,
                muscleGroup,
                isPublic: isPublic ?? false,
                userId,
                imageUrl: imageUrl ?? null,
            },
        })

        return reply.status(201).send({ exercise })
    })
}