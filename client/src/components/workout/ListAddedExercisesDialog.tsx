import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useExercises, useDeleteExercise } from '@/hooks/useWorkout'
import ExerciseImage from './ExerciseImage'
import { Trash2, Globe, Lock } from 'lucide-react'

interface Props {
    open: boolean
    onClose: () => void
}

export default function ListAddedExercisesDialog({ open, onClose }: Props) {
    const { data: exercises, isLoading } = useExercises()
    const deleteExercise = useDeleteExercise()

    // Filter to only show custom exercises created by the user
    // Assuming exercises with userId are custom added by the user.
    // The backend `useExercises` likely returns exercises including those.
    const customExercises = exercises?.filter((e: any) => e.userId) || []

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Added Exercises</DialogTitle>
                    <DialogDescription>
                        Manage your custom exercises
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 py-2">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-4">Loading exercises...</p>
                    ) : customExercises.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No custom exercises added yet.</p>
                    ) : (
                        customExercises.map((exercise: any) => (
                            <div
                                key={exercise.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                            >
                                <div className="flex items-center gap-3">
                                    <ExerciseImage imageUrl={exercise.imageUrl} name={exercise.name} size="md" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{exercise.name}</span>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {exercise.isPublic ? (
                                                <span className="flex items-center text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-sm">
                                                    <Globe size={10} className="mr-1" /> Public
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-sm">
                                                    <Lock size={10} className="mr-1" /> Private
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {!exercise.isPublic && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this custom exercise?')) {
                                                deleteExercise.mutate(exercise.id)
                                            }
                                        }}
                                        disabled={deleteExercise.isPending}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                        title="Delete private exercise"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
