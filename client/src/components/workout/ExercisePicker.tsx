import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useExercises } from '@/hooks/useWorkout'
import { Dumbbell, PersonStanding, Timer, ChevronRight } from 'lucide-react'
import ExerciseImage from './ExerciseImage'

// Component to pick an exercise to add to the workout

const TYPES = [
    { value: 'WEIGHTED', label: 'Weighted', icon: Dumbbell, description: 'Barbell, dumbbell, machine' },
    { value: 'BODYWEIGHT', label: 'Bodyweight', icon: PersonStanding, description: 'No equipment needed' },
    { value: 'CARDIO', label: 'Cardio', icon: Timer, description: 'Running, cycling, rowing' },
] as const

const MUSCLE_GROUPS = [
    { value: 'CHEST', label: 'Chest' },
    { value: 'BACK', label: 'Back' },
    { value: 'SHOULDERS', label: 'Shoulders' },
    { value: 'BICEPS', label: 'Biceps' },
    { value: 'TRICEPS', label: 'Triceps' },
    { value: 'FOREARMS', label: 'Forearms' },
    { value: 'LEGS', label: 'Legs' },
    { value: 'GLUTES', label: 'Glutes' },
    { value: 'CORE', label: 'Core' },
    { value: 'CARDIO', label: 'Cardio' },
    { value: 'FULL_BODY', label: 'Full Body' },
] as const

type Step = 'type' | 'muscle' | 'exercise'

interface Props {
    open: boolean
    onClose: () => void
    onSelect: (exerciseId: string) => void
}

export default function ExercisePicker({ open, onClose, onSelect }: Props) {
    const [step, setStep] = useState<Step>('type')
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const { data: exercises, isLoading } = useExercises(
        search ? undefined : (selectedType ?? undefined),
        search ? undefined : (selectedMuscle ?? undefined)
    )

    const reset = () => {
        setStep('type')
        setSelectedType(null)
        setSelectedMuscle(null)
        setSearch('')
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const handleTypeSelect = (type: string) => {
        setSelectedType(type)
        setStep('muscle')
    }

    const handleMuscleSelect = (muscle: string) => {
        setSelectedMuscle(muscle)
        setSearch('')
        setStep('exercise')
    }

    const handleExerciseSelect = (exerciseId: string) => {
        onSelect(exerciseId)
        handleClose()
    }

    const filteredMuscleGroups = selectedType === 'CARDIO'
        ? MUSCLE_GROUPS.filter(m => m.value === 'CARDIO')
        : MUSCLE_GROUPS.filter(m => m.value !== 'CARDIO')

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent side="bottom" className="h-[80vh] flex flex-col">
                <SheetHeader>
                    <SheetTitle>
                        {step === 'type' && 'Select Type'}
                        {step === 'muscle' && (
                            <button
                                onClick={() => setStep('type')}
                                className="flex items-center gap-2 text-muted-foreground text-sm font-normal"
                            >
                                ← Back
                            </button>
                        )}
                        {step === 'exercise' && (
                            <button
                                onClick={() => setStep('muscle')}
                                className="flex items-center gap-2 text-muted-foreground text-sm font-normal"
                            >
                                ← Back
                            </button>
                        )}
                    </SheetTitle>
                    <SheetDescription />
                </SheetHeader>

                <div className="flex-1 overflow-y-auto mt-4 flex flex-col gap-4">
                    {/* Search bar — always visible */}
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            if (e.target.value) setStep('exercise')
                            else setStep('type')
                        }}
                        className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                    {/* Step 1: Type */}
                    {step === 'type' && (
                        <div className="flex flex-col gap-3">
                            {TYPES.map(({ value, label, icon: Icon, description }) => (
                                <button
                                    key={value}
                                    onClick={() => handleTypeSelect(value)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                        <Icon size={24} className="text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{label}</p>
                                        <p className="text-sm text-muted-foreground">{description}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Muscle Group */}
                    {step === 'muscle' && (
                        <div className="grid grid-cols-2 gap-3">
                            {filteredMuscleGroups.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleMuscleSelect(value)}
                                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
                                >
                                    <span className="font-medium">{label}</span>
                                    <ChevronRight size={16} className="text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Exercise List */}
                    {step === 'exercise' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                {isLoading && (
                                    <p className="text-center text-muted-foreground py-8">Loading...</p>
                                )}
                                {!isLoading && exercises?.filter((e: any) =>
                                    e.name.toLowerCase().includes(search.toLowerCase())
                                ).length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">No exercises found</p>
                                    )}
                                {exercises
                                    ?.filter((e: any) =>
                                        search ? e.name.toLowerCase().includes(search.toLowerCase()) : true
                                    )
                                    .map((exercise: any) => (
                                        <button
                                            key={exercise.id}
                                            onClick={() => handleExerciseSelect(exercise.id)}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left"
                                        >
                                            <ExerciseImage imageUrl={exercise.imageUrl} name={exercise.name} size="lg" />
                                            <span className="font-medium">{exercise.name}</span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}