import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/context/LanguageContext'
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
import { Switch } from '@/components/ui/switch'
import { ImagePlus, X } from 'lucide-react'
import api from '@/api/axios'
import { useQueryClient } from '@tanstack/react-query'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

interface Props {
    open: boolean
    onClose: () => void
    exercise?: any // Optional: if present, the dialog is in edit mode
    onSuccess?: (exercise: any) => void
}

const TYPES = [
    { value: 'WEIGHTED', label: 'Weighted' },
    { value: 'BODYWEIGHT', label: 'Bodyweight' },
    { value: 'CARDIO', label: 'Cardio' },
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

const PRISMA_TO_BODY_HIGHLIGHTER: Record<string, string[]> = {
    CHEST: ['chest'],
    BACK: ['trapezius', 'upper-back', 'lower-back'],
    SHOULDERS: ['front-deltoids', 'back-deltoids'],
    BICEPS: ['biceps'],
    TRICEPS: ['triceps'],
    FOREARMS: ['forearm'],
    LEGS: ['quadriceps', 'hamstring', 'calves', 'adductor', 'abductors'],
    GLUTES: ['gluteal'],
    CORE: ['abs', 'obliques'],
}

export default function AddExerciseDialog({ open, onClose, exercise, onSuccess }: Props) {
    const { t } = useTranslation()
    const isEdit = !!exercise
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [name, setName] = useState('')
    const [type, setType] = useState<string>('WEIGHTED')
    const [muscleGroup, setMuscleGroup] = useState<string>('CHEST')
    const [targetMuscle, setTargetMuscle] = useState<string[]>([])
    const [isPublic, setIsPublic] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [shouldRemoveImage, setShouldRemoveImage] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPublicWarning, setShowPublicWarning] = useState(false)

    useEffect(() => {
        if (exercise) {
            setName(exercise.name || '')
            setType(exercise.type || 'WEIGHTED')
            setMuscleGroup(exercise.muscleGroup || 'CHEST')
            setTargetMuscle(exercise.targetMuscle || [])
            setIsPublic(exercise.isPublic || false)
            setImagePreview(exercise.imageUrl ? `${import.meta.env.VITE_API_URL || ''}${exercise.imageUrl}` : null)
            setShouldRemoveImage(false)
        } else {
            handleReset()
        }
    }, [exercise, open])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setShouldRemoveImage(false)
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setShouldRemoveImage(true)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleInitialSubmit = () => {
        setError('')
        if (!name.trim()) return setError(t.workout.addDialog.nameRequired)

        if (isPublic && (!isEdit || (isEdit && !exercise.isPublic))) {
            setShowPublicWarning(true)
        } else {
            performSubmit()
        }
    }

    const performSubmit = async () => {
        setLoading(true)
        setShowPublicWarning(false)
        try {
            const formData = new FormData()
            formData.append('name', name.trim())
            formData.append('type', type)
            formData.append('muscleGroup', muscleGroup)
            if (targetMuscle.length > 0) formData.append('targetMuscle', JSON.stringify(targetMuscle))
            formData.append('isPublic', String(isPublic))

            if (imageFile) {
                formData.append('image', imageFile)
            } else if (shouldRemoveImage && isEdit) {
                formData.append('removeImage', 'true')
            }

            let response
            if (isEdit) {
                response = await api.patch(`/exercises/${exercise.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            } else {
                response = await api.post('/exercises', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            }

            queryClient.invalidateQueries({ queryKey: ['exercises'] })
            if (onSuccess) onSuccess(response.data.exercise)
            handleClose()
        } catch (err: any) {
            setError(err.response?.data?.error ?? t.workout.addDialog.errorGeneric)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setName('')
        setType('WEIGHTED')
        setMuscleGroup('CHEST')
        setTargetMuscle([])
        setIsPublic(false)
        setImageFile(null)
        setImagePreview(null)
        setShouldRemoveImage(false)
        setError('')
        setShowPublicWarning(false)
    }

    const handleClose = () => {
        if (!isEdit) handleReset()
        onClose()
    }

    const isPublicSwitchDisabled = isEdit && exercise?.isPublic


    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? t.workout.addDialog.editTitle : t.workout.addDialog.addTitle}</DialogTitle>
                        <DialogDescription />
                    </DialogHeader>

                    <div className="flex flex-col gap-5 py-2">
                        {/* Image picker */}
                        <div className="flex flex-col gap-1.5">
                            <Label>{t.workout.addDialog.imageOptional}</Label>
                            {imagePreview ? (
                                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors"
                                >
                                    <ImagePlus size={24} className="text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{t.workout.addDialog.tapToUpload}</p>
                                    <p className="text-xs text-muted-foreground">{t.workout.addDialog.imageReqs}</p>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <Label>{t.workout.addDialog.nameLabel}</Label>
                            <Input
                                placeholder={t.workout.addDialog.namePlaceholder}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Type */}
                        <div className="flex flex-col gap-2">
                            <Label>{t.workout.addDialog.typeLabel}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {TYPES.map((typeOption) => (
                                    <button
                                        key={typeOption.value}
                                        onClick={() => {
                                            setType(typeOption.value)
                                            if (typeOption.value === 'CARDIO') {
                                                setMuscleGroup('CARDIO')
                                            } else if (muscleGroup === 'CARDIO') {
                                                setMuscleGroup('CHEST')
                                            }
                                        }}
                                        className={`rounded-lg border py-2 text-sm font-medium transition-colors ${type === typeOption.value
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card hover:bg-accent'
                                            }`}
                                    >
                                        {t.workout.addDialog.types[typeOption.value as keyof typeof t.workout.addDialog.types]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Muscle group */}
                        <div className="flex flex-col gap-2">
                            <Label>{t.workout.addDialog.muscleGroupLabel}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {MUSCLE_GROUPS
                                    .filter(m => type === 'CARDIO' ? m.value === 'CARDIO' : m.value !== 'CARDIO')
                                    .map((m) => (
                                        <button
                                            key={m.value}
                                            onClick={() => {
                                                setMuscleGroup(m.value)
                                                setTargetMuscle([])
                                            }}
                                            className={`rounded-lg border py-2 text-xs font-medium transition-colors ${muscleGroup === m.value
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-card hover:bg-accent'
                                                }`}
                                        >
                                            {t.workout.addDialog.muscles[m.value as keyof typeof t.workout.addDialog.muscles]}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Target Muscle */}
                        {PRISMA_TO_BODY_HIGHLIGHTER[muscleGroup] && PRISMA_TO_BODY_HIGHLIGHTER[muscleGroup].length > 1 && (
                            <div className="flex flex-col gap-2">
                                <Label>{t.workout.addDialog.targetMuscleLabel}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRISMA_TO_BODY_HIGHLIGHTER[muscleGroup].map((tm) => (
                                        <button
                                            key={tm}
                                            onClick={() => setTargetMuscle(prev => prev.includes(tm) ? prev.filter(t => t !== tm) : [...prev, tm])}
                                            className={`rounded-lg border py-2 text-xs font-medium transition-colors capitalize ${targetMuscle.includes(tm)
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-card hover:bg-accent'
                                                }`}
                                        >
                                            {t.workout.addDialog.targets[tm as keyof typeof t.workout.addDialog.targets] || tm.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Public toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{t.workout.addDialog.makePublic}</p>
                                <p className="text-xs text-muted-foreground">{t.workout.addDialog.makePublicDesc}</p>
                            </div>
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} disabled={isPublicSwitchDisabled} />
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>{t.common.cancel}</Button>
                        <Button onClick={handleInitialSubmit} disabled={loading}>
                            {loading ? (isEdit ? t.workout.addDialog.saving : t.workout.addDialog.adding) : (isEdit ? t.workout.addDialog.saveChanges : t.workout.addDialog.addExerciseBtn)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={showPublicWarning}
                onClose={() => setShowPublicWarning(false)}
                onConfirm={performSubmit}
                loading={loading}
                title={t.workout.addDialog.publicWarning.title}
                description={<>{t.workout.addDialog.publicWarning.desc1}<strong className="text-foreground">{t.workout.addDialog.publicWarning.descBold}</strong>{t.workout.addDialog.publicWarning.desc2}</>}
                confirmText={t.workout.addDialog.publicWarning.confirm}
            />
        </>
    )
}