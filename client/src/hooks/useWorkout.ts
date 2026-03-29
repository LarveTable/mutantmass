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

export function useDeleteWorkout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/workouts/${id}`)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
    })
}

export function useUpdateWorkout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, note, name }: { id: string; note?: string; name?: string }) => {
            const res = await api.patch(`/workouts/${id}`, { note, name })
            return res.data.workout
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workout', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['workouts'] })
        },
    })
}

export function useWorkoutSearch(query: string) {
    return useQuery({
        queryKey: ['workouts', 'search', query],
        queryFn: async () => {
            const res = await api.get(`/workouts/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)
            return res.data.workouts
        },
    })
}

export function useUpdateSet(workoutId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            workoutExerciseId,
            setId,
            reps,
            weight,
            duration,
            distance,
        }: {
            workoutExerciseId: string
            setId: string
            reps?: number
            weight?: number
            duration?: number
            distance?: number
        }) => {
            const res = await api.patch(
                `/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`,
                { reps, weight, duration, distance }
            )
            return res.data.set
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
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

export function useOverviewStats(period: string) {
    return useQuery({
        queryKey: ['stats', 'overview', period],
        queryFn: async () => {
            const res = await api.get(`/stats/overview?period=${period}`)
            return res.data
        },
    })
}

export function useVolumeStats(period: string) {
    return useQuery({
        queryKey: ['stats', 'volume', period],
        queryFn: async () => {
            const res = await api.get(`/stats/volume?period=${period}`)
            return res.data.data
        },
    })
}

export function useExerciseStats(exerciseId: string | null, period: string) {
    return useQuery({
        queryKey: ['stats', 'exercise', exerciseId, period],
        queryFn: async () => {
            const res = await api.get(`/stats/exercise/${exerciseId}?period=${period}`)
            return res.data.data
        },
        enabled: !!exerciseId,
    })
}

export function usePRs() {
    return useQuery({
        queryKey: ['stats', 'prs'],
        queryFn: async () => {
            const res = await api.get('/stats/prs')
            return res.data.prs
        },
    })
}

export function useMuscleStats(period: string) {
    return useQuery({
        queryKey: ['stats', 'muscles', period],
        queryFn: async () => {
            const res = await api.get(`/stats/muscles?period=${period}`)
            return res.data.data
        },
    })
}

export function useFrequencyStats() {
    return useQuery({
        queryKey: ['stats', 'frequency'],
        queryFn: async () => {
            const res = await api.get('/stats/frequency')
            return res.data.data
        },
    })
}

export function useConsistencyStats() {
    return useQuery({
        queryKey: ['stats', 'consistency'],
        queryFn: async () => {
            const res = await api.get('/stats/consistency')
            return res.data
        },
    })
}

export function useUpdateWeeklyGoal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (weeklyGoal: number) => {
            const res = await api.patch('/stats/goal', { weeklyGoal })
            return res.data
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stats', 'consistency'] }),
    })
}