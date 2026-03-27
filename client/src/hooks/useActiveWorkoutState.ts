import { useState } from 'react'

const STORAGE_KEY = 'activeWorkoutId'
const START_TIME_KEY = 'activeWorkoutStartTime'

// This hook is used to keep track of the active workout to handle refreshes for example

export function useActiveWorkoutState() {
    const [workoutId, setWorkoutId] = useState<string | null>(
        () => localStorage.getItem(STORAGE_KEY)
    )
    const [startTime, setStartTime] = useState<number>(
        () => Number(localStorage.getItem(START_TIME_KEY)) || Date.now()
    )

    const startWorkout = (id: string) => {
        const now = Date.now()
        localStorage.setItem(STORAGE_KEY, id)
        localStorage.setItem(START_TIME_KEY, String(now))
        setWorkoutId(id)
        setStartTime(now)
    }

    const endWorkout = () => {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(START_TIME_KEY)
        setWorkoutId(null)
    }

    return { workoutId, startTime, startWorkout, endWorkout }
}