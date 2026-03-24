import type { FastifyRequest, FastifyReply } from 'fastify'

// Authenticate sensitive routes, add this to the pre handler of the route

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify()
    } catch {
        return reply.status(401).send({ error: 'Unauthorized' })
    }
}