import { useState, useEffect } from 'react'
import { X, Dumbbell, Clock, Trophy, StickyNote, Pencil, Trash2, Plus } from 'lucide-react'
import {
    useWorkout,
    useUpdateWorkout,
    useAddExercise,
    useRemoveExercise,
    useUpdateExerciseNote,
    useAddSet,
    useUpdateSet,
    useDeleteSet,
} from '@/hooks/useWorkout'
import LogSetDialog from '@/components/workout/LogSetDialog'
import ExerciseNoteDialog from '@/components/workout/ExerciseNoteDialog'
import ExercisePicker from '@/components/workout/ExercisePicker'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ExerciseImage from '@/components/workout/ExerciseImage'

// Component to show and edit a past workout's details in the history page

interface Props {
    workoutId: string
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

function getTotalVolume(exercises: any[]) {
    return exercises.reduce((total: number, we: any) =>
        total + we.sets.reduce((t: number, s: any) =>
            t + (s.weight && s.reps ? s.weight * s.reps : 0), 0), 0)
}

function getBestSet(sets: any[]) {
    if (!sets.length) return null
    return sets.reduce((best: any, set: any) => {
        if (!best) return set
        const weight = set.weight ?? 0
        const bestWeight = best.weight ?? 0
        const reps = set.reps ?? 0
        const bestReps = best.reps ?? 0

        const volume = weight * reps
        const bestVolume = bestWeight * bestReps

        if (volume > bestVolume) return set
        if (volume < bestVolume) return best

        // If volume is tied (e.g., both 0 for bodyweight), prioritize higher weight
        if (weight > bestWeight) return set
        if (weight < bestWeight) return best

        // If weight is also tied, prioritize higher reps
        if (reps > bestReps) return set

        return best
    }, null)
}

export default function WorkoutDetailModal({ workoutId, onClose }: Props) {
    const { data: workout, isLoading } = useWorkout(workoutId)

    // Mutations
    const updateWorkout = useUpdateWorkout()
    const addExercise = useAddExercise(workoutId)
    const removeExercise = useRemoveExercise(workoutId)
    const updateExerciseNote = useUpdateExerciseNote(workoutId)
    const addSet = useAddSet(workoutId)
    const updateSet = useUpdateSet(workoutId)
    const deleteSet = useDeleteSet(workoutId)

    // Dialog states
    const [exercisePickerOpen, setExercisePickerOpen] = useState(false)
    const [noteDialog, setNoteDialog] = useState<{
        open: boolean
        workoutExerciseId: string
        name: string
        note?: string | null
    }>({ open: false, workoutExerciseId: '', name: '', note: null })

    const [setDialog, setSetDialog] = useState<{
        open: boolean
        mode: 'add' | 'edit'
        workoutExerciseId: string
        setId: string
        exerciseName: string
        exerciseType: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
        currentSet?: any
    } | null>(null)

    const [editingNote, setEditingNote] = useState(false)
    const [noteText, setNoteText] = useState('')
    const [editingName, setEditingName] = useState(false)
    const [nameText, setNameText] = useState('')

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    // Sync noteText when workout loads or note editing starts
    useEffect(() => {
        if (workout?.note !== undefined) {
            setNoteText(workout.note ?? '')
        }
    }, [workout?.note])

    // Sync nameText when workout loads
    useEffect(() => {
        if (workout?.name !== undefined) {
            setNameText(workout.name ?? '')
        }
    }, [workout?.name])

    if (isLoading || !workout) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading workout...</p>
            </div>
        )
    }

    const totalVolume = getTotalVolume(workout.workoutExercises)
    const totalSets = workout.workoutExercises.reduce((t: number, we: any) => t + we.sets.length, 0)

    const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    const handleSaveNote = () => {
        updateWorkout.mutate({ id: workoutId, note: noteText })
        setEditingNote(false)
    }

    const handleSaveName = () => {
        const trimmed = nameText.trim()
        if (trimmed !== (workout.name ?? '')) {
            updateWorkout.mutate({ id: workoutId, name: trimmed || undefined })
        }
        setEditingName(false)
    }

    const handleSetConfirm = (data: { reps?: number; weight?: number; duration?: number; distance?: number }) => {
        if (!setDialog) return
        if (setDialog.mode === 'add') {
            addSet.mutate({ workoutExerciseId: setDialog.workoutExerciseId, ...data })
        } else {
            updateSet.mutate({ workoutExerciseId: setDialog.workoutExerciseId, setId: setDialog.setId, ...data })
        }
        setSetDialog(null)
    }

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col" style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
                <div className="flex-1 min-w-0">
                    {editingName ? (
                        <input
                            type="text"
                            value={nameText}
                            onChange={(e) => setNameText(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveName()
                                if (e.key === 'Escape') {
                                    setNameText(workout.name ?? '')
                                    setEditingName(false)
                                }
                            }}
                            className="text-lg font-bold bg-transparent border-b border-primary outline-none w-full"
                            autoFocus
                        />
                    ) : (
                        <h1
                            className="text-lg font-bold cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                            onClick={() => setEditingName(true)}
                        >
                            {workout.name ?? 'Workout'}
                            <Pencil size={13} className="text-muted-foreground" />
                        </h1>
                    )}
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
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-24">
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
                <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <StickyNote size={14} className="text-primary" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                                Session Note
                            </p>
                        </div>
                        {!editingNote && (
                            <button
                                onClick={() => setEditingNote(true)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Pencil size={14} />
                            </button>
                        )}
                    </div>
                    {editingNote ? (
                        <div className="flex flex-col gap-2">
                            <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="How did it feel? Any PRs? Notes for next time..."
                                className="resize-none"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => {
                                    setNoteText(workout.note ?? '')
                                    setEditingNote(false)
                                }}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleSaveNote} disabled={updateWorkout.isPending}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm">
                            {workout.note || <span className="text-muted-foreground italic">No note</span>}
                        </p>
                    )}
                </div>

                {/* Exercises */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Exercises
                    </h2>
                    {workout.workoutExercises.map((we: any) => {
                        const bestSet = getBestSet(we.sets)
                        const volume = we.sets.reduce((t: number, s: any) =>
                            t + (s.weight && s.reps ? s.weight * s.reps : 0), 0)

                        return (
                            <div
                                key={we.id}
                                className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3"
                            >
                                {/* Exercise header */}
                                <div className="flex items-center gap-3">
                                    <ExerciseImage imageUrl={we.exercise.imageUrl} name={we.exercise.name} size="md" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{we.exercise.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {we.sets.length} set{we.sets.length !== 1 ? 's' : ''}
                                            {volume > 0 && ` · ${volume.toLocaleString()} kg`}
                                        </p>
                                    </div>
                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setNoteDialog({
                                                open: true,
                                                workoutExerciseId: we.id,
                                                name: we.exercise.name,
                                                note: we.note,
                                            })}
                                            className={`transition-colors ${we.note ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <StickyNote size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Remove this exercise?')) {
                                                    removeExercise.mutate(we.id)
                                                }
                                            }}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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
                                    <div className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 px-1">
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
                                        {/* Spacers for edit/delete columns */}
                                        <span />
                                        <span />
                                    </div>
                                    {we.sets.map((set: any, index: number) => (
                                        <div
                                            key={set.id}
                                            className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 items-center px-1 py-1.5 rounded-lg bg-muted/40"
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
                                            <button
                                                onClick={() => setSetDialog({
                                                    open: true,
                                                    mode: 'edit',
                                                    workoutExerciseId: we.id,
                                                    setId: set.id,
                                                    exerciseName: we.exercise.name,
                                                    exerciseType: we.exercise.type,
                                                    currentSet: set,
                                                })}
                                                className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this set?')) {
                                                        deleteSet.mutate({ workoutExerciseId: we.id, setId: set.id })
                                                    }
                                                }}
                                                className="flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Best set */}
                                    {['WEIGHTED', 'BODYWEIGHT'].includes(we.exercise.type) && bestSet && (
                                        <p className="text-xs text-primary mt-1 px-1">
                                            🏆 Best: {bestSet.reps ?? 0} reps
                                            {bestSet.weight ? ` @ ${bestSet.weight} kg` : ''}
                                        </p>
                                    )}

                                    {/* Add set button */}
                                    <button
                                        onClick={() => setSetDialog({
                                            open: true,
                                            mode: 'add',
                                            workoutExerciseId: we.id,
                                            setId: '',
                                            exerciseName: we.exercise.name,
                                            exerciseType: we.exercise.type,
                                            currentSet: we.sets[we.sets.length - 1] ?? undefined,
                                        })}
                                        className="flex items-center justify-center gap-1.5 mt-1 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    >
                                        <Plus size={13} />
                                        Add Set
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Add exercise button */}
                <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setExercisePickerOpen(true)}
                >
                    <Plus size={18} className="mr-2" />
                    Add Exercise
                </Button>
            </div>

            {/* Exercise picker */}
            <ExercisePicker
                open={exercisePickerOpen}
                onClose={() => setExercisePickerOpen(false)}
                onSelect={(exerciseId) => addExercise.mutate(exerciseId)}
            />

            {/* Exercise note dialog */}
            <ExerciseNoteDialog
                open={noteDialog.open}
                onClose={() => setNoteDialog((prev) => ({ ...prev, open: false }))}
                exerciseName={noteDialog.name}
                initialNote={noteDialog.note}
                onConfirm={(note) => {
                    updateExerciseNote.mutate({
                        workoutExerciseId: noteDialog.workoutExerciseId,
                        note,
                    })
                    setNoteDialog((prev) => ({ ...prev, open: false }))
                }}
                isLoading={updateExerciseNote.isPending}
            />

            {/* Log/Edit set dialog */}
            {setDialog && (
                <LogSetDialog
                    open={setDialog.open}
                    onClose={() => setSetDialog(null)}
                    exerciseName={setDialog.exerciseName}
                    exerciseType={setDialog.exerciseType}
                    lastSet={setDialog.currentSet}
                    onConfirm={handleSetConfirm}
                />
            )}
        </div>
    )
}