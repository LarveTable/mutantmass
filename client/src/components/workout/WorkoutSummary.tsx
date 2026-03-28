import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Dumbbell, Clock, Trophy, ChevronRight } from 'lucide-react'

interface Set {
    id: string
    reps?: number | null
    weight?: number | null
    duration?: number | null
    distance?: number | null
}

interface WorkoutExercise {
    id: string
    exercise: {
        name: string
        type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
        imageUrl?: string | null
    }
    sets: Set[]
}

interface Workout {
    id: string
    name?: string | null
    duration?: number | null
    date: string
    workoutExercises: WorkoutExercise[]
    note?: string | null
}

interface Props {
    workout: Workout
    onDone: () => void
}

function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

function getTotalVolume(exercises: WorkoutExercise[]) {
    return exercises.reduce((total, we) => {
        return total + we.sets.reduce((setTotal, set) => {
            if (set.weight && set.reps) return setTotal + set.weight * set.reps
            return setTotal
        }, 0)
    }, 0)
}

function getTotalSets(exercises: WorkoutExercise[]) {
    return exercises.reduce((total, we) => total + we.sets.length, 0)
}

function getBestSet(sets: Set[]) {
    return sets.reduce((best, set) => {
        if (!best) return set
        if ((set.weight ?? 0) > (best.weight ?? 0)) return set
        return best
    }, sets[0])
}

export default function WorkoutSummary({ workout, onDone }: Props) {
    useEffect(() => {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#7c3aed', '#ffffff', '#fbbf24'],
        })
    }, [])

    const totalVolume = getTotalVolume(workout.workoutExercises)
    const totalSets = getTotalSets(workout.workoutExercises)

    return (
        <div className="flex flex-col gap-6 px-4 py-8 pb-24">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-5xl mb-2">🎉</div>
                <h1 className="text-2xl font-bold">Workout Complete!</h1>
                <p className="text-muted-foreground">
                    {workout.name ?? 'Great session'}
                </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3">
                    <Clock size={18} className="text-primary mb-1" />
                    <span className="text-lg font-bold">
                        {workout.duration ? formatDuration(workout.duration) : '-'}
                    </span>
                    <span className="text-xs text-muted-foreground">Duration</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3">
                    <Trophy size={18} className="text-primary mb-1" />
                    <span className="text-lg font-bold">{totalSets}</span>
                    <span className="text-xs text-muted-foreground">Sets</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3">
                    <Dumbbell size={18} className="text-primary mb-1" />
                    <span className="text-lg font-bold">
                        {totalVolume > 0 ? `${totalVolume.toLocaleString()}` : '-'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {totalVolume > 0 ? 'kg volume' : 'Volume'}
                    </span>
                </div>
            </div>

            {/* Notes section */}
            {workout.note && (
                <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Session Note</p>
                    <p className="text-sm">{workout.note}</p>
                </div>
            )}

            {/* Exercise breakdown */}
            <div className="flex flex-col gap-3">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Exercise Breakdown
                </h2>
                {workout.workoutExercises.map((we) => {
                    const bestSet = getBestSet(we.sets)
                    const exerciseVolume = we.sets.reduce((total, set) => {
                        if (set.weight && set.reps) return total + set.weight * set.reps
                        return total
                    }, 0)

                    return (
                        <div
                            key={we.id}
                            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3"
                        >
                            {/* Exercise header */}
                            <div className="flex items-center gap-3">
                                {we.exercise.imageUrl ? (
                                    <img
                                        src={we.exercise.imageUrl}
                                        alt={we.exercise.name}
                                        className="h-10 w-10 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Dumbbell size={18} className="text-primary" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold">{we.exercise.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {we.sets.length} set{we.sets.length !== 1 ? 's' : ''}
                                        {exerciseVolume > 0 && ` · ${exerciseVolume.toLocaleString()} kg`}
                                    </p>
                                </div>
                            </div>

                            {/* Sets table */}
                            <div className="flex flex-col gap-1">
                                <div className="grid grid-cols-[2rem_1fr_1fr] gap-2 px-1">
                                    <span className="text-xs text-muted-foreground text-center">#</span>
                                    {we.exercise.type === 'WEIGHTED' && (
                                        <>
                                            <span className="text-xs text-muted-foreground text-center">Reps</span>
                                            <span className="text-xs text-muted-foreground text-center">kg</span>
                                        </>
                                    )}
                                    {we.exercise.type === 'BODYWEIGHT' && (
                                        <>
                                            <span className="text-xs text-muted-foreground text-center">Reps</span>
                                            <span className="text-xs text-muted-foreground text-center" />
                                        </>
                                    )}
                                    {we.exercise.type === 'CARDIO' && (
                                        <>
                                            <span className="text-xs text-muted-foreground text-center">Time</span>
                                            <span className="text-xs text-muted-foreground text-center">km</span>
                                        </>
                                    )}
                                </div>
                                {we.sets.map((set, index) => (
                                    <div
                                        key={set.id}
                                        className="grid grid-cols-[2rem_1fr_1fr] gap-2 items-center px-1 py-1.5 rounded-lg bg-muted/40"
                                    >
                                        <span className="text-sm text-muted-foreground text-center">{index + 1}</span>
                                        {we.exercise.type === 'WEIGHTED' && (
                                            <>
                                                <span className="text-sm text-center font-medium">{set.reps}</span>
                                                <span className="text-sm text-center font-medium">{set.weight}</span>
                                            </>
                                        )}
                                        {we.exercise.type === 'BODYWEIGHT' && (
                                            <>
                                                <span className="text-sm text-center font-medium">{set.reps}</span>
                                                <span />
                                            </>
                                        )}
                                        {we.exercise.type === 'CARDIO' && (
                                            <>
                                                <span className="text-sm text-center font-medium">
                                                    {set.duration ? `${Math.floor(set.duration / 60)}m` : '-'}
                                                </span>
                                                <span className="text-sm text-center font-medium">
                                                    {set.distance ?? '-'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* Best set highlight for weighted */}
                                {we.exercise.type === 'WEIGHTED' && bestSet && (
                                    <p className="text-xs text-primary mt-1 px-1">
                                        🏆 Best set for this workout: {bestSet.reps} reps @ {bestSet.weight} kg
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Done button */}
            <Button size="lg" className="w-full" onClick={onDone}>
                Done
                <ChevronRight size={18} className="ml-1" />
            </Button>
        </div>
    )
}