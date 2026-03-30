import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Pencil } from 'lucide-react'
import LogSetDialog from './LogSetDialog'

interface Set {
    id: string
    order: number
    reps?: number | null
    weight?: number | null
    duration?: number | null
    distance?: number | null
}

interface Props {
    workoutExerciseId: string
    exerciseName: string
    exerciseType: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
    sets: Set[]
    onAddSet: (data: {
        workoutExerciseId: string
        reps?: number
        weight?: number
        duration?: number
        distance?: number
    }) => void
    onDeleteSet: (workoutExerciseId: string, setId: string) => void
    onEditSet: (workoutExerciseId: string, set: Set) => void
}

export default function SetLogger({
    workoutExerciseId,
    exerciseName,
    exerciseType,
    sets,
    onAddSet,
    onDeleteSet,
    onEditSet,
}: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)

    const lastSet = sets.length > 0 ? sets[sets.length - 1] : undefined

    const handleConfirm = (data: {
        reps?: number
        weight?: number
        duration?: number
        distance?: number
    }) => {
        onAddSet({
            workoutExerciseId,
            ...data,
        })
    }

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex flex-col gap-3">
            {sets.length > 0 && (
                <div className="flex flex-col gap-1">
                    {/* Header */}
                    <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 px-1">
                        <span className="text-xs text-muted-foreground text-center">#</span>
                        {exerciseType === 'WEIGHTED' && (
                            <>
                                <span className="text-xs text-muted-foreground text-center">Reps</span>
                                <span className="text-xs text-muted-foreground text-center">kg</span>
                            </>
                        )}
                        {exerciseType === 'BODYWEIGHT' && (
                            <>
                                <span className="text-xs text-muted-foreground text-center">Reps</span>
                                <span className="text-xs text-muted-foreground text-center" />
                            </>
                        )}
                        {exerciseType === 'CARDIO' && (
                            <>
                                <span className="text-xs text-muted-foreground text-center">Time</span>
                                <span className="text-xs text-muted-foreground text-center">km</span>
                            </>
                        )}
                        <span />
                    </div>

                    {/* Rows */}
                    {sets.map((set, index) => (
                        <div
                            key={set.id}
                            className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 items-center px-1 py-1.5 rounded-lg bg-muted/40"
                        >
                            <span className="text-sm text-muted-foreground text-center">{index + 1}</span>
                            {exerciseType === 'WEIGHTED' && (
                                <>
                                    <span className="text-sm text-center font-medium">{set.reps}</span>
                                    <span className="text-sm text-center font-medium">{set.weight}</span>
                                </>
                            )}
                            {exerciseType === 'BODYWEIGHT' && (
                                <>
                                    <span className="text-sm text-center font-medium">{set.reps}</span>
                                    <span />
                                </>
                            )}
                            {exerciseType === 'CARDIO' && (
                                <>
                                    <span className="text-sm text-center font-medium">
                                        {set.duration ? formatDuration(set.duration) : '-'}
                                    </span>
                                    <span className="text-sm text-center font-medium">
                                        {set.distance ?? '-'}
                                    </span>
                                </>
                            )}
                            <button
                                onClick={() => onEditSet(workoutExerciseId, set)}
                                className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Pencil size={13} />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Delete this set?')) {
                                        onDeleteSet(workoutExerciseId, set.id)
                                    }
                                }}
                                className="flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setDialogOpen(true)}
            >
                <Plus size={16} className="mr-1" />
                Log Set
            </Button>

            <LogSetDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                exerciseName={exerciseName}
                exerciseType={exerciseType}
                lastSet={lastSet}
                onConfirm={handleConfirm}
            />
        </div>
    )
}