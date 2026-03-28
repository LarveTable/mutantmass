import { X, Dumbbell, Clock, Trophy, StickyNote } from 'lucide-react'
import { useEffect } from 'react'

interface Set {
    id: string
    reps?: number | null
    weight?: number | null
    duration?: number | null
    distance?: number | null
}

interface WorkoutExercise {
    id: string
    note?: string | null
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
    note?: string | null
    date: string
    duration?: number | null
    workoutExercises: WorkoutExercise[]
}

interface Props {
    workout: Workout | null
    onClose: () => void
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
    return exercises.reduce((total, we) =>
        total + we.sets.reduce((t, s) =>
            t + (s.weight && s.reps ? s.weight * s.reps : 0), 0), 0)
}

function getBestSet(sets: Set[]) {
    return sets.reduce((best, set) =>
        !best || (set.weight ?? 0) > (best.weight ?? 0) ? set : best, sets[0])
}

export default function WorkoutDetailModal({ workout, onClose }: Props) {
    if (!workout) return null

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    const totalVolume = getTotalVolume(workout.workoutExercises)
    const totalSets = workout.workoutExercises.reduce((t, we) => t + we.sets.length, 0)

    const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
                <div>
                    <h1 className="text-lg font-bold">{workout.name ?? 'Workout'}</h1>
                    <p className="text-xs text-muted-foreground">{formattedDate}</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3">
                        <Clock size={16} className="text-primary mb-1" />
                        <span className="text-base font-bold">
                            {workout.duration ? formatDuration(workout.duration) : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">Duration</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3">
                        <Trophy size={16} className="text-primary mb-1" />
                        <span className="text-base font-bold">{totalSets}</span>
                        <span className="text-xs text-muted-foreground">Sets</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3">
                        <Dumbbell size={16} className="text-primary mb-1" />
                        <span className="text-base font-bold">
                            {totalVolume > 0 ? totalVolume.toLocaleString() : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {totalVolume > 0 ? 'kg vol.' : 'Volume'}
                        </span>
                    </div>
                </div>

                {/* Session note */}
                {workout.note && (
                    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <StickyNote size={14} className="text-primary" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                                Session Note
                            </p>
                        </div>
                        <p className="text-sm">{workout.note}</p>
                    </div>
                )}

                {/* Exercises */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Exercises
                    </h2>
                    {workout.workoutExercises.map((we) => {
                        const bestSet = getBestSet(we.sets)
                        const volume = we.sets.reduce((t, s) =>
                            t + (s.weight && s.reps ? s.weight * s.reps : 0), 0)

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
                                            {volume > 0 && ` · ${volume.toLocaleString()} kg`}
                                        </p>
                                    </div>
                                </div>

                                {/* Exercise note */}
                                {we.note && (
                                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3">
                                        {we.note}
                                    </p>
                                )}

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

                                    {/* Best set */}
                                    {we.exercise.type === 'WEIGHTED' && bestSet?.weight && (
                                        <p className="text-xs text-primary mt-1 px-1">
                                            🏆 Best: {bestSet.reps} reps @ {bestSet.weight} kg
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}