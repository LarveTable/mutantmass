import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

// Script that seeds the default exercises in the db

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type ExerciseSeed = {
    name: string
    type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
    imageUrl?: string
}

const exercises: ExerciseSeed[] = [
    // WEIGHTED
    { name: 'Bench Press', type: 'WEIGHTED' },
    { name: 'Incline Bench Press', type: 'WEIGHTED' },
    { name: 'Overhead Press', type: 'WEIGHTED' },
    { name: 'Squat', type: 'WEIGHTED' },
    { name: 'Deadlift', type: 'WEIGHTED' },
    { name: 'Romanian Deadlift', type: 'WEIGHTED' },
    { name: 'Barbell Row', type: 'WEIGHTED' },
    { name: 'Lat Pulldown', type: 'WEIGHTED' },
    { name: 'Cable Row', type: 'WEIGHTED' },
    { name: 'Leg Press', type: 'WEIGHTED' },
    { name: 'Leg Curl', type: 'WEIGHTED' },
    { name: 'Leg Extension', type: 'WEIGHTED' },
    { name: 'Dumbbell Curl', type: 'WEIGHTED' },
    { name: 'Tricep Pushdown', type: 'WEIGHTED' },
    { name: 'Lateral Raise', type: 'WEIGHTED' },
    { name: 'Face Pull', type: 'WEIGHTED' },
    { name: 'Hip Thrust', type: 'WEIGHTED' },
    { name: 'Calf Raise', type: 'WEIGHTED' },
    // BODYWEIGHT
    { name: 'Pull Up', type: 'BODYWEIGHT' },
    { name: 'Push Up', type: 'BODYWEIGHT' },
    { name: 'Dip', type: 'BODYWEIGHT' },
    { name: 'Chin Up', type: 'BODYWEIGHT' },
    { name: 'Plank', type: 'BODYWEIGHT' },
    // CARDIO
    { name: 'Running', type: 'CARDIO' },
    { name: 'Cycling', type: 'CARDIO' },
    { name: 'Rowing', type: 'CARDIO' },
    { name: 'Jump Rope', type: 'CARDIO' },
]

async function main() {
    console.log('Seeding exercises...')

    // For each ex, check if it exists in db (only the non-custom / global ones)
    for (const exercise of exercises) {
        const existing = await prisma.exercise.findFirst({
            where: { name: exercise.name, userId: null },
        })

        if (existing) {
            await prisma.exercise.update({
                where: { id: existing.id },
                data: {
                    type: exercise.type,
                    imageUrl: exercise.imageUrl ?? null,
                },
            })
        } else {
            await prisma.exercise.create({
                data: {
                    name: exercise.name,
                    type: exercise.type,
                    imageUrl: exercise.imageUrl ?? null,
                    userId: null,
                    isPublic: false,
                },
            })
        }
    }

    console.log(`Seeded ${exercises.length} exercises`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())