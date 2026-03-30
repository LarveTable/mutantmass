import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'
import { createWriteStream, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import { randomUUID } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const UPLOADS_DIR = join(__dirname, '../../uploads/exercises')

// Ensure uploads directory exists
mkdirSync(UPLOADS_DIR, { recursive: true })

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

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

        const parts = request.parts()

        let name: string | undefined
        let type: string | undefined
        let muscleGroup: string | undefined
        let isPublic = false
        let imageUrl: string | null = null

        for await (const part of parts) {
            if (part.type === 'file') {
                if (!ALLOWED_MIME_TYPES.includes(part.mimetype)) {
                    return reply.status(400).send({ error: 'Invalid file type. Use JPEG, PNG, WebP or GIF.' })
                }

                const ext = part.filename.split('.').pop()
                const filename = `${randomUUID()}.${ext}`
                const filepath = join(UPLOADS_DIR, filename)

                await pipeline(part.file, createWriteStream(filepath))
                imageUrl = `/uploads/exercises/${filename}`
            } else {
                if (part.fieldname === 'name') name = part.value as string
                if (part.fieldname === 'type') type = part.value as string
                if (part.fieldname === 'muscleGroup') muscleGroup = part.value as string
                if (part.fieldname === 'isPublic') isPublic = part.value === 'true'
            }
        }

        if (!name || !type || !muscleGroup) {
            return reply.status(400).send({ error: 'name, type and muscle group are required' })
        }

        if (!['WEIGHTED', 'BODYWEIGHT', 'CARDIO'].includes(type)) {
            return reply.status(400).send({ error: 'invalid type' })
        }

        if (!['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'LEGS', 'GLUTES', 'CORE', 'CARDIO', 'FULL_BODY'].includes(muscleGroup)) {
            return reply.status(400).send({ error: 'invalid muscle group' })
        }

        const exercise = await app.prisma.exercise.create({
            data: {
                name,
                type: type as any,
                muscleGroup: muscleGroup as any,
                isPublic,
                userId,
                imageUrl,
            },
        })

        return reply.status(201).send({ exercise })
    })
}