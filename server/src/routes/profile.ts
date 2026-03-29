import type { FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

export default async function profileRoutes(app: FastifyInstance) {
    // GET /profile
    app.get('/profile', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }

        const user = await app.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                age: true,
                sex: true,
                weight: true,
                height: true,
                weeklyGoal: true,
                createdAt: true,
            }
        })

        return { user }
    })

    // PATCH /profile - update profile fields
    app.patch('/profile', { preHandler: authenticate }, async (request) => {
        const { userId } = request.user as { userId: string }
        const { name, age, sex, weight, height, weeklyGoal } = request.body as {
            name?: string
            age?: number
            sex?: 'MALE' | 'FEMALE' | 'OTHER'
            weight?: number
            height?: number
            weeklyGoal?: number
        }

        const user = await app.prisma.user.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name }),
                ...(age !== undefined && { age }),
                ...(sex !== undefined && { sex }),
                ...(weight !== undefined && { weight }),
                ...(height !== undefined && { height }),
                ...(weeklyGoal !== undefined && { weeklyGoal }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                age: true,
                sex: true,
                weight: true,
                height: true,
                weeklyGoal: true,
            }
        })

        return { user }
    })

    // PATCH /profile/password - change password
    app.patch('/profile/password', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { currentPassword, newPassword } = request.body as {
            currentPassword: string
            newPassword: string
        }

        const user = await app.prisma.user.findUnique({ where: { id: userId } })
        if (!user) return reply.status(404).send({ error: 'User not found' })

        const valid = await bcrypt.compare(currentPassword, user.password)
        if (!valid) return reply.status(401).send({ error: 'Current password is incorrect' })

        if (newPassword.length < 8) {
            return reply.status(400).send({ error: 'Password must be at least 8 characters' })
        }

        const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS)
        await app.prisma.user.update({
            where: { id: userId },
            data: { password: hashed }
        })

        return { success: true }
    })

    // DELETE /profile - delete account and all data
    app.delete('/profile', { preHandler: authenticate }, async (request, reply) => {
        const { userId } = request.user as { userId: string }
        const { password } = request.body as { password: string }

        const user = await app.prisma.user.findUnique({ where: { id: userId } })
        if (!user) return reply.status(404).send({ error: 'User not found' })

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return reply.status(401).send({ error: 'Password is incorrect' })

        // Cascade deletes everything (workouts, exercises, refresh tokens)
        await app.prisma.user.delete({ where: { id: userId } })

        reply
            .clearCookie('access_token', { path: '/' })
            .clearCookie('refresh_token', { path: '/' })
            .send({ success: true })
    })
}