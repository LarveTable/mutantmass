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
        mutationFn: async ({ id, duration, note }: { id: string; duration: number; note?: string }) => {
            const res = await api.patch(`/workouts/${id}`, { duration, note })
            return res.data.workout
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
    })
}

export function useWorkouts(month: string) {
    return useQuery({
        queryKey: ['workouts', month],
        queryFn: async () => {
            const res = await api.get(`/workouts?month=${month}`)
            return res.data.workouts
        },
    })
}

export function useWorkout(id: string | null) {
    return useQuery({
        queryKey: ['workout', id],
        queryFn: async () => {
            const res = await api.get(`/workouts/${id}`)
            return res.data.workout
        },
        enabled: !!id,
    })
}

export function useRemoveExercise(workoutId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (workoutExerciseId: string) => {
            await api.delete(`/workouts/${workoutId}/exercises/${workoutExerciseId}`)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
    })
}

export function useUpdateExerciseNote(workoutId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ workoutExerciseId, note }: { workoutExerciseId: string; note: string }) => {
            const res = await api.patch(`/workouts/${workoutId}/exercises/${workoutExerciseId}`, { note })
            return res.data.workoutExercise
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
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