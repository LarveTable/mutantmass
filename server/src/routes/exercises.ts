import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'
import { createWriteStream, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import { randomUUID } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const UPLOADS_DIR = join(__dirname, '../../uploads/exercises/custom')

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

    // GET /exercises/me - list only exercises created by the current user
    app.get('/exercises/me', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const exercises = await app.prisma.exercise.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        })
        return { exercises }
    })

    // DELETE /exercises/:id
    app.delete('/exercises/:id', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { id } = request.params as { id: string }

        const exercise = await app.prisma.exercise.findFirst({
            where: { id, userId } // userId check ensures only owner can delete
        })

        if (!exercise) {
            return reply.status(404).send({ error: 'Exercise not found or not yours to delete' })
        }

        // Delete image file if exists
        if (exercise.imageUrl) {
            const { unlink } = await import('fs/promises')
            const { join } = await import('path')
            try {
                await unlink(join(__dirname, '../../../', exercise.imageUrl))
            } catch {
                // File might not exist, ignore
            }
        }

        await app.prisma.exercise.delete({ where: { id } })

        return reply.status(204).send()
    })

    // POST /exercises - create a custom exercise
    app.post('/exercises', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }

        const parts = request.parts()

        let name: string | undefined
        let type: string | undefined
        let muscleGroup: string | undefined
        let targetMuscle: string[] = []
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
                imageUrl = `/uploads/exercises/custom/${filename}`
            } else {
                if (part.fieldname === 'name') name = part.value as string
                if (part.fieldname === 'type') type = part.value as string
                if (part.fieldname === 'muscleGroup') muscleGroup = part.value as string
                if (part.fieldname === 'targetMuscle') {
                    try { targetMuscle = JSON.parse(part.value as string) } catch {}
                }
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
                targetMuscle,
                isPublic,
                userId,
                imageUrl,
            },
        })

        return reply.status(201).send({ exercise })
    })

    // PATCH /exercises/:id - update an exercise
    app.patch('/exercises/:id', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { id } = request.params as { id: string }

        const existing = await app.prisma.exercise.findFirst({
            where: { id, userId }
        })

        if (!existing) {
            return reply.status(404).send({ error: 'Exercise not found or not yours to edit' })
        }

        const parts = request.parts()
        let name: string | undefined
        let type: string | undefined
        let muscleGroup: string | undefined
        let targetMuscle: string[] | undefined
        let isPublic: boolean | undefined
        let imageUrl: string | undefined
        let removeImage = false

        for await (const part of parts) {
            if (part.type === 'file') {
                if (!ALLOWED_MIME_TYPES.includes(part.mimetype)) {
                    return reply.status(400).send({ error: 'Invalid file type.' })
                }

                const ext = part.filename.split('.').pop()
                const filename = `${randomUUID()}.${ext}`
                const filepath = join(UPLOADS_DIR, filename)

                await pipeline(part.file, createWriteStream(filepath))
                imageUrl = `/uploads/exercises/custom/${filename}`
            } else {
                if (part.fieldname === 'name') name = part.value as string
                if (part.fieldname === 'type') type = part.value as string
                if (part.fieldname === 'muscleGroup') muscleGroup = part.value as string
                if (part.fieldname === 'targetMuscle') {
                    try { targetMuscle = JSON.parse(part.value as string) } catch { }
                }
                if (part.fieldname === 'isPublic') isPublic = part.value === 'true'
                if (part.fieldname === 'removeImage') removeImage = part.value === 'true'
            }
        }

        const updateData: any = {}

        // All fields are editable by the owner, regardless of public status
        if (name) updateData.name = name
        if (type) updateData.type = type as any
        if (muscleGroup) updateData.muscleGroup = muscleGroup as any
        if (targetMuscle !== undefined) updateData.targetMuscle = targetMuscle
        
        // Once public, an exercise cannot be made private again (to match UI and shared nature)
        if (!existing.isPublic && isPublic !== undefined) {
            updateData.isPublic = isPublic
        }

        if (imageUrl) updateData.imageUrl = imageUrl
        else if (removeImage) updateData.imageUrl = null

        const updated = await app.prisma.exercise.update({
            where: { id },
            data: updateData
        })

        return { exercise: updated }
    })
}