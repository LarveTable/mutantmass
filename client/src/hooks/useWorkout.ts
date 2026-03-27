import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'

// Hooks (or helper functions) to fetch and mutate data from the server

export function useActiveWorkout(workoutId: string | null) {
    return useQuery({
        queryKey: ['workout', workoutId],
        queryFn: async () => {
            const res = await api.get(`/workouts/${workoutId}`)
            return res.data.workout
        },
        enabled: !!workoutId,
    })
}

export function useCreateWorkout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: { name?: string; restTimer?: number }) => {
            const res = await api.post('/workouts', data)
            return res.data.workout
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
    })
}

export function useFinishWorkout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, duration }: { id: string; duration: number }) => {
            const res = await api.patch(`/workouts/${id}`, { duration })
            return res.data.workout
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
    })
}

export function useAddExercise(workoutId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (exerciseId: string) => {
            const res = await api.post(`/workouts/${workoutId}/exercises`, { exerciseId })
            return res.data.workoutExercise
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
    })
}

export function useAddSet(workoutId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            workoutExerciseId,
            reps,
            weight,
            duration,
            distance,
            restTime,
        }: {
            workoutExerciseId: string
            reps?: number
            weight?: number
            duration?: number
            distance?: number
            restTime?: number
        }) => {
            const res = await api.post(
                `/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`,
                { reps, weight, duration, distance, restTime }
            )
            return res.data.set
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
    })
}

export function useDeleteSet(workoutId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            workoutExerciseId,
            setId,
        }: {
            workoutExerciseId: string
            setId: string
        }) => {
            await api.delete(`/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
    })
}

export function useExercises(type?: string, muscleGroup?: string) {
    return useQuery({
        queryKey: ['exercises', type, muscleGroup],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (type) params.append('type', type)
            if (muscleGroup) params.append('muscleGroup', muscleGroup)
            const res = await api.get(`/exercises?${params.toString()}`)
            return res.data.exercises
        },
    })
}