import { useState } from 'react'

const STORAGE_KEY = 'trackedExercises'

interface TrackedExercise {
    id: string
    name: string
}

export function useTrackedExercises() {
    const [tracked, setTracked] = useState<(TrackedExercise | null)[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : [null, null, null]
        } catch {
            return [null, null, null]
        }
    })

    const setSlot = (index: number, exercise: TrackedExercise | null) => {
        const updated = [...tracked]
        updated[index] = exercise
        setTracked(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    return { tracked, setSlot }
}