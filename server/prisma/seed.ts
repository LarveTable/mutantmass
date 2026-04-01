import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

// Script that seeds the default exercises in the db

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type ExerciseSeed = {
    name: string
    type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
    muscleGroup: 'CHEST' | 'BACK' | 'SHOULDERS' | 'BICEPS' | 'TRICEPS' | 'FOREARMS' | 'LEGS' | 'GLUTES' | 'CORE' | 'CARDIO' | 'FULL_BODY'
    imageUrl?: string
    targetMuscle?: string[]
}

const exercises: ExerciseSeed[] = [
    // WEIGHTED - CHEST
    { name: 'Bench Press', type: 'WEIGHTED', muscleGroup: 'CHEST', imageUrl: '/uploads/exercises/base/bench-press.jpg' },
    { name: 'Incline Bench Press', type: 'WEIGHTED', muscleGroup: 'CHEST' },
    // WEIGHTED - BACK
    { name: 'Deadlift', type: 'WEIGHTED', muscleGroup: 'BACK', targetMuscle: ['lower-back', 'upper-back', 'trapezius'] },
    { name: 'Barbell Row', type: 'WEIGHTED', muscleGroup: 'BACK', targetMuscle: ['upper-back', 'trapezius'] },
    { name: 'Lat Pulldown', type: 'WEIGHTED', muscleGroup: 'BACK', targetMuscle: ['upper-back'] },
    { name: 'Cable Row', type: 'WEIGHTED', muscleGroup: 'BACK', targetMuscle: ['upper-back', 'trapezius'] },
    // WEIGHTED - SHOULDERS
    { name: 'Overhead Press', type: 'WEIGHTED', muscleGroup: 'SHOULDERS', targetMuscle: ['front-deltoids'] },
    { name: 'Lateral Raise', type: 'WEIGHTED', muscleGroup: 'SHOULDERS', targetMuscle: ['front-deltoids'] },
    { name: 'Face Pull', type: 'WEIGHTED', muscleGroup: 'SHOULDERS', targetMuscle: ['back-deltoids'] },
    // WEIGHTED - BICEPS
    { name: 'Dumbbell Curl', type: 'WEIGHTED', muscleGroup: 'BICEPS' },
    // WEIGHTED - TRICEPS
    { name: 'Tricep Pushdown', type: 'WEIGHTED', muscleGroup: 'TRICEPS' },
    // WEIGHTED - LEGS
    { name: 'Squat', type: 'WEIGHTED', muscleGroup: 'LEGS', targetMuscle: ['quadriceps'] },
    { name: 'Romanian Deadlift', type: 'WEIGHTED', muscleGroup: 'LEGS', targetMuscle: ['hamstring'] },
    { name: 'Leg Press', type: 'WEIGHTED', muscleGroup: 'LEGS', targetMuscle: ['quadriceps'] },
    { name: 'Leg Curl', type: 'WEIGHTED', muscleGroup: 'LEGS', targetMuscle: ['hamstring'] },
    { name: 'Leg Extension', type: 'WEIGHTED', muscleGroup: 'LEGS', targetMuscle: ['quadriceps'] },
    // WEIGHTED - GLUTES
    { name: 'Hip Thrust', type: 'WEIGHTED', muscleGroup: 'GLUTES' },
    // WEIGHTED - LEGS (calves)
    { name: 'Calf Raise', type: 'WEIGHTED', muscleGroup: 'LEGS' },
    // BODYWEIGHT
    { name: 'Pull Up', type: 'BODYWEIGHT', muscleGroup: 'BACK', targetMuscle: ['upper-back'] },
    { name: 'Chin Up', type: 'BODYWEIGHT', muscleGroup: 'BACK', targetMuscle: ['upper-back', 'biceps'] },
    { name: 'Push Up', type: 'BODYWEIGHT', muscleGroup: 'CHEST', targetMuscle: ['chest', 'triceps', 'front-deltoids'] },
    { name: 'Dip', type: 'BODYWEIGHT', muscleGroup: 'TRICEPS', targetMuscle: ['triceps', 'chest', 'front-deltoids'] },
    { name: 'Plank', type: 'BODYWEIGHT', muscleGroup: 'CORE' },
    // CARDIO
    { name: 'Running', type: 'CARDIO', muscleGroup: 'CARDIO' },
    { name: 'Cycling', type: 'CARDIO', muscleGroup: 'CARDIO' },
    { name: 'Rowing', type: 'CARDIO', muscleGroup: 'CARDIO' },
    { name: 'Jump Rope', type: 'CARDIO', muscleGroup: 'CARDIO' },
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
                    muscleGroup: exercise.muscleGroup,
                    targetMuscle: exercise.targetMuscle ?? [],
                    imageUrl: exercise.imageUrl ?? null,
                },
            })
        } else {
            await prisma.exercise.create({
                data: {
                    name: exercise.name,
                    type: exercise.type,
                    muscleGroup: exercise.muscleGroup,
                    targetMuscle: exercise.targetMuscle ?? [],
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