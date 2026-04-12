import { useState } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useMyExercises, useDeleteExercise } from '@/hooks/useWorkout'
import ExerciseImage from './ExerciseImage'
import { Trash2, Globe, Lock, Edit2 } from 'lucide-react'
import AddExerciseDialog from './AddExerciseDialog'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

interface Props {
    open: boolean
    onClose: () => void
}

export default function ListAddedExercisesDialog({ open, onClose }: Props) {
    const { t } = useTranslation()
    const { data: exercises, isLoading } = useMyExercises()
    const deleteExercise = useDeleteExercise()
    const [editingExercise, setEditingExercise] = useState<any>(null)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null)


    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>{t.workout.listDialog.title}</DialogTitle>
                        <DialogDescription>
                            {t.workout.listDialog.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 py-2">
                        {isLoading ? (
                            <p className="text-center text-muted-foreground py-4">{t.common.loading}</p>
                        ) : !exercises || exercises.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">{t.workout.listDialog.empty}</p>
                        ) : (
                            exercises.map((exercise: any) => (
                                <div
                                    key={exercise.id}
                                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="relative group cursor-pointer"
                                            onClick={() => setEditingExercise(exercise)}
                                        >
                                            <ExerciseImage imageUrl={exercise.imageUrl} name={exercise.name} size="md" />
                                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit2 size={16} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{exercise.name}</span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {exercise.isPublic ? (
                                                    <span className="flex items-center text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-sm">
                                                        <Globe size={10} className="mr-1" /> {t.workout.listDialog.publicInfo}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-sm">
                                                        <Lock size={10} className="mr-1" /> {t.workout.listDialog.privateInfo}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setEditingExercise(exercise)}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title={t.workout.listDialog.editHover}
                                        >
                                            <Edit2 size={16} />
                                        </button>

                                        {!exercise.isPublic && (
                                            <button
                                                onClick={() => {
                                                    setExerciseToDelete(exercise.id)
                                                    setDeleteConfirmOpen(true)
                                                }}
                                                disabled={deleteExercise.isPending}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                                title={t.workout.listDialog.deleteHover}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AddExerciseDialog
                open={!!editingExercise}
                onClose={() => setEditingExercise(null)}
                exercise={editingExercise}
            />

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={() => {
                    if (exerciseToDelete) {
                        deleteExercise.mutate(exerciseToDelete)
                        setExerciseToDelete(null)
                    }
                }}
                title={t.workout.listDialog.deleteConfirm.title}
                description={<>{t.workout.listDialog.deleteConfirm.desc1}<strong className="text-foreground">{t.workout.listDialog.deleteConfirm.descBold}</strong>{t.workout.listDialog.deleteConfirm.desc2}</>}
                confirmText={t.workout.listDialog.deleteConfirm.confirm}
                variant="destructive"
            />
        </>
    )
}

