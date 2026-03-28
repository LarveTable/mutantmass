import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dumbbell, Plus, StopCircle } from 'lucide-react'
import {
    useActiveWorkout,
    useCreateWorkout,
    useFinishWorkout,
    useAddExercise,
    useAddSet,
    useDeleteSet,
} from '@/hooks/useWorkout'
import { useActiveWorkoutState } from '@/hooks/useActiveWorkoutState'
import StartWorkoutDialog from '@/components/workout/StartWorkoutDialog'
import ExercisePicker from '@/components/workout/ExercisePicker'
import SetLogger from '@/components/workout/SetLogger'
import RestTimer from '@/components/workout/RestTimer'
import WorkoutSummary from '@/components/workout/WorkoutSummary'
import WorkoutTimer from '@/components/workout/WorkoutTimer'
import FinishWorkoutDialog from '@/components/workout/FinishWorkoutDialog'
import { useRemoveExercise, useUpdateExerciseNote } from '@/hooks/useWorkout'
import ExerciseNoteDialog from '@/components/workout/ExerciseNoteDialog'
import { Trash2, StickyNote } from 'lucide-react'

// Main page for logging workouts

export default function WorkoutPage() {
    const { workoutId, startTime, startWorkout, endWorkout } = useActiveWorkoutState()
    const [startDialogOpen, setStartDialogOpen] = useState(false)
    const [exercisePickerOpen, setExercisePickerOpen] = useState(false)
    const [restTimer, setRestTimer] = useState<number | null>(null)
    const [restTimerActive, setRestTimerActive] = useState(false)
    const [finishedWorkout, setFinishedWorkout] = useState<any>(null)
    const [finishDialogOpen, setFinishDialogOpen] = useState(false)
    const [noteDialog, setNoteDialog] = useState<{ open: boolean; workoutExerciseId: string; name: string; note?: string | null }>({
        open: false,
        workoutExerciseId: '',
        name: '',
        note: null,
    })

    const { data: workout, isLoading } = useActiveWorkout(workoutId)
    const createWorkout = useCreateWorkout()
    const finishWorkout = useFinishWorkout()
    const addExercise = useAddExercise(workoutId ?? '')
    const addSet = useAddSet(workoutId ?? '')
    const deleteSet = useDeleteSet(workoutId ?? '')
    const removeExercise = useRemoveExercise(workoutId ?? '')
    const updateExerciseNote = useUpdateExerciseNote(workoutId ?? '')

    const handleStart = async (name: string, rest: number | null) => {
        const created = await createWorkout.mutateAsync({ name: name || undefined })
        startWorkout(created.id)
        setRestTimer(rest)
        setStartDialogOpen(false)
    }

    const handleFinish = async (note: string) => {
        if (!workoutId) return
        const duration = Math.floor((Date.now() - startTime) / 1000)
        await finishWorkout.mutateAsync({ id: workoutId, duration, note: note || undefined })
        setFinishedWorkout({ ...workout, duration, note })
        endWorkout()
        setRestTimer(null)
        setRestTimerActive(false)
        setFinishDialogOpen(false)
    }

    const handleAddSet = (data: Parameters<typeof addSet.mutateAsync>[0]) => {
        addSet.mutate(data)
        if (restTimer) setRestTimerActive(true)
    }

    const handleDeleteSet = (workoutExerciseId: string, setId: string) => {
        deleteSet.mutate({ workoutExerciseId, setId })
    }

    // Show workout summary after finishing
    if (finishedWorkout) {
        return (
            <WorkoutSummary
                workout={finishedWorkout}
                onDone={() => setFinishedWorkout(null)}
            />
        )
    }

    // No active workout
    if (!workoutId) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Dumbbell size={36} className="text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Ready to train?</h1>
                    <p className="text-muted-foreground">Start a new workout to begin logging your sets</p>
                </div>
                <Button size="lg" className="w-full max-w-xs" onClick={() => setStartDialogOpen(true)}>
                    Start Workout
                </Button>

                <StartWorkoutDialog
                    open={startDialogOpen}
                    onClose={() => setStartDialogOpen(false)}
                    onStart={handleStart}
                    isLoading={createWorkout.isPending}
                />
            </div>
        )
    }

    // If still loading workout
    if (isLoading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <p className="text-muted-foreground">Loading workout...</p>
            </div>
        )
    }

    // Active workout
    return (
        <div className="flex flex-col gap-4 px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">{workout?.name ?? 'Workout'}</h1>
                    <p className="text-sm text-muted-foreground">
                        {workout?.workoutExercises?.length ?? 0} exercise
                        {workout?.workoutExercises?.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setFinishDialogOpen(true)}
                >
                    <StopCircle size={16} className="mr-1" />
                    Finish
                </Button>
            </div>

            {/* Timer */}
            <WorkoutTimer startTime={startTime} />

            {/* Exercise list */}
            <div className="flex flex-col gap-4">
                {workout?.workoutExercises?.map((we: any) => (
                    <div key={we.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
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
                                <p className="text-xs text-muted-foreground capitalize">
                                    {we.exercise.type.toLowerCase()}
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
                                    <StickyNote size={18} />
                                </button>
                                <button
                                    onClick={() => removeExercise.mutate(we.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Show note if exists */}
                        {we.note && (
                            <p className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3">
                                {we.note}
                            </p>
                        )}

                        <SetLogger
                            workoutExerciseId={we.id}
                            exerciseName={we.exercise.name}
                            exerciseType={we.exercise.type}
                            sets={we.sets}
                            restTimer={restTimer}
                            onAddSet={handleAddSet}
                            onDeleteSet={handleDeleteSet}
                        />
                    </div>
                ))}

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

            {/* Exercise picker */}
            <ExercisePicker
                open={exercisePickerOpen}
                onClose={() => setExercisePickerOpen(false)}
                onSelect={(exerciseId) => addExercise.mutate(exerciseId)}
            />

            {/* Rest timer */}
            {restTimerActive && restTimer && (
                <RestTimer
                    duration={restTimer}
                    onComplete={() => setRestTimerActive(false)}
                    onDismiss={() => setRestTimerActive(false)}
                />
            )}
            <FinishWorkoutDialog
                open={finishDialogOpen}
                onClose={() => setFinishDialogOpen(false)}
                onConfirm={handleFinish}
                isLoading={finishWorkout.isPending}
            />
        </div>
    )
}