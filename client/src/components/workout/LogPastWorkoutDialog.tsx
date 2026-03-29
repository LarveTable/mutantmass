import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, ChevronRight, ChevronLeft } from 'lucide-react'
import { useExercises } from '@/hooks/useWorkout'
import api from '@/api/axios'
import { useQueryClient } from '@tanstack/react-query'

interface SetEntry {
    reps?: number
    weight?: number
    duration?: number
    distance?: number
}

interface ExerciseEntry {
    exerciseId: string
    exerciseName: string
    exerciseType: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
    sets: SetEntry[]
}

type Step = 'info' | 'exercises' | 'sets'

interface Props {
    open: boolean
    onClose: () => void
}

// --- Set input row ---
function SetRow({
    set,
    index,
    type,
    onChange,
    onDelete,
}: {
    set: SetEntry
    index: number
    type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
    onChange: (set: SetEntry) => void
    onDelete: () => void
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-5 text-center">{index + 1}</span>
            {type === 'WEIGHTED' && (
                <>
                    <Input
                        type="number"
                        placeholder="Reps"
                        value={set.reps ?? ''}
                        onChange={(e) => onChange({ ...set, reps: Number(e.target.value) })}
                        className="text-center h-8 text-sm"
                    />
                    <Input
                        type="number"
                        placeholder="kg"
                        value={set.weight ?? ''}
                        onChange={(e) => onChange({ ...set, weight: Number(e.target.value) })}
                        className="text-center h-8 text-sm"
                    />
                </>
            )}
            {type === 'BODYWEIGHT' && (
                <Input
                    type="number"
                    placeholder="Reps"
                    value={set.reps ?? ''}
                    onChange={(e) => onChange({ ...set, reps: Number(e.target.value) })}
                    className="text-center h-8 text-sm"
                />
            )}
            {type === 'CARDIO' && (
                <>
                    <Input
                        type="number"
                        placeholder="Min"
                        value={set.duration ? set.duration / 60 : ''}
                        onChange={(e) => onChange({ ...set, duration: Number(e.target.value) * 60 })}
                        className="text-center h-8 text-sm"
                    />
                    <Input
                        type="number"
                        placeholder="km"
                        value={set.distance ?? ''}
                        onChange={(e) => onChange({ ...set, distance: Number(e.target.value) })}
                        className="text-center h-8 text-sm"
                    />
                </>
            )}
            <button
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
                <Trash2 size={14} />
            </button>
        </div>
    )
}

// --- Exercise picker ---
function ExercisePicker({
    onSelect,
}: {
    onSelect: (exercise: { id: string; name: string; type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO' }) => void
}) {
    const [search, setSearch] = useState('')
    const { data: exercises = [] } = useExercises()

    const filtered = exercises
        .filter((e: any) => e.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 8)

    return (
        <div className="flex flex-col gap-2">
            <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {filtered.map((e: any) => (
                    <button
                        key={e.id}
                        onClick={() => onSelect({ id: e.id, name: e.name, type: e.type })}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm hover:bg-accent transition-colors"
                    >
                        <span>{e.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                            {e.type.toLowerCase()}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function LogPastWorkoutDialog({ open, onClose }: Props) {
    const queryClient = useQueryClient()
    const [step, setStep] = useState<Step>('info')
    const [name, setName] = useState('')
    const [date, setDate] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })
    const [durationHours, setDurationHours] = useState('')
    const [durationMins, setDurationMins] = useState('')
    const [note, setNote] = useState('')
    const [exercises, setExercises] = useState<ExerciseEntry[]>([])
    const [showPicker, setShowPicker] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleAddExercise = (exercise: {
        id: string
        name: string
        type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
    }) => {
        setExercises((prev) => [
            ...prev,
            { exerciseId: exercise.id, exerciseName: exercise.name, exerciseType: exercise.type, sets: [{}] },
        ])
        setShowPicker(false)
    }

    const handleAddSet = (exerciseIndex: number) => {
        setExercises((prev) => {
            const updated = [...prev]
            updated[exerciseIndex] = {
                ...updated[exerciseIndex],
                sets: [...updated[exerciseIndex].sets, {}],
            }
            return updated
        })
    }

    const handleUpdateSet = (exerciseIndex: number, setIndex: number, set: SetEntry) => {
        setExercises((prev) => {
            const updated = [...prev]
            updated[exerciseIndex].sets[setIndex] = set
            return updated
        })
    }

    const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
        setExercises((prev) => {
            const updated = [...prev]
            updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex)
            return updated
        })
    }

    const handleDeleteExercise = (exerciseIndex: number) => {
        setExercises((prev) => prev.filter((_, i) => i !== exerciseIndex))
    }

    const handleSave = async () => {
        setError('')
        if (!date) return setError('Date is required')
        setLoading(true)

        try {
            const duration = durationHours || durationMins
                ? (Number(durationHours || 0) * 3600) + (Number(durationMins || 0) * 60)
                : undefined

            // Create workout
            const workoutRes = await api.post('/workouts', {
                name: name || undefined,
                date: new Date(date).toISOString(),
                duration,
                note: note || undefined,
            })
            const workoutId = workoutRes.data.workout.id

            // Add exercises and sets
            for (const ex of exercises) {
                const weRes = await api.post(`/workouts/${workoutId}/exercises`, {
                    exerciseId: ex.exerciseId,
                })
                const weId = weRes.data.workoutExercise.id

                for (const set of ex.sets) {
                    if (Object.keys(set).length === 0) continue
                    await api.post(`/workouts/${workoutId}/exercises/${weId}/sets`, set)
                }
            }

            queryClient.invalidateQueries({ queryKey: ['workouts'] })
            handleClose()
        } catch (err: any) {
            setError(err.response?.data?.error ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setStep('info')
        setName('')
        setDate(new Date().toISOString().split('T')[0])
        setDurationHours('')
        setDurationMins('')
        setNote('')
        setExercises([])
        setShowPicker(false)
        setError('')
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {step !== 'info' && (
                            <button
                                onClick={() => setStep('info')}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}
                        {step === 'info' ? 'Log Past Workout' : 'Exercises & Sets'}
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {step === 'info' && (
                        <div className="flex flex-col gap-4 py-2">
                            <div className="flex flex-col gap-1.5">
                                <Label>Workout name (optional)</Label>
                                <Input
                                    placeholder="e.g. Push Day"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Duration (optional)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={durationHours}
                                        onChange={(e) => setDurationHours(e.target.value)}
                                        className="text-center"
                                        min={0}
                                    />
                                    <span className="text-sm text-muted-foreground shrink-0">h</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={durationMins}
                                        onChange={(e) => setDurationMins(e.target.value)}
                                        className="text-center"
                                        min={0}
                                        max={59}
                                    />
                                    <span className="text-sm text-muted-foreground shrink-0">min</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Session note (optional)</Label>
                                <textarea
                                    placeholder="How did it feel?"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'exercises' && (
                        <div className="flex flex-col gap-4 py-2">
                            {exercises.map((ex, ei) => (
                                <div key={ei} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">{ex.exerciseName}</p>
                                        <button
                                            onClick={() => handleDeleteExercise(ei)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Set header */}
                                    <div className="flex items-center gap-2 px-5">
                                        {ex.exerciseType === 'WEIGHTED' && (
                                            <>
                                                <span className="flex-1 text-center text-xs text-muted-foreground">Reps</span>
                                                <span className="flex-1 text-center text-xs text-muted-foreground">kg</span>
                                            </>
                                        )}
                                        {ex.exerciseType === 'BODYWEIGHT' && (
                                            <span className="flex-1 text-center text-xs text-muted-foreground">Reps</span>
                                        )}
                                        {ex.exerciseType === 'CARDIO' && (
                                            <>
                                                <span className="flex-1 text-center text-xs text-muted-foreground">Min</span>
                                                <span className="flex-1 text-center text-xs text-muted-foreground">km</span>
                                            </>
                                        )}
                                        <div className="w-5" />
                                    </div>

                                    {ex.sets.map((set, si) => (
                                        <SetRow
                                            key={si}
                                            set={set}
                                            index={si}
                                            type={ex.exerciseType}
                                            onChange={(updated) => handleUpdateSet(ei, si, updated)}
                                            onDelete={() => handleDeleteSet(ei, si)}
                                        />
                                    ))}

                                    <button
                                        onClick={() => handleAddSet(ei)}
                                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                                    >
                                        <Plus size={13} />
                                        Add set
                                    </button>
                                </div>
                            ))}

                            {showPicker ? (
                                <div className="rounded-xl border border-border bg-card p-3">
                                    <ExercisePicker onSelect={handleAddExercise} />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowPicker(true)}
                                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                >
                                    <Plus size={16} />
                                    Add Exercise
                                </button>
                            )}

                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    {step === 'info' ? (
                        <>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={() => setStep('exercises')}>
                                Next
                                <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Workout'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}