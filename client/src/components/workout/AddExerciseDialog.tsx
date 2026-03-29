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
import { Switch } from '@/components/ui/switch'
import api from '@/api/axios'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
    open: boolean
    onClose: () => void
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

export default function AddExerciseDialog({ open, onClose }: Props) {
    const queryClient = useQueryClient()
    const [name, setName] = useState('')
    const [type, setType] = useState<string>('WEIGHTED')
    const [muscleGroup, setMuscleGroup] = useState<string>('CHEST')
    const [isPublic, setIsPublic] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setError('')
        if (!name.trim()) return setError('Exercise name is required')

        setLoading(true)
        try {
            await api.post('/exercises', { name: name.trim(), type, muscleGroup, isPublic })
            queryClient.invalidateQueries({ queryKey: ['exercises'] })
            handleClose()
        } catch (err: any) {
            setError(err.response?.data?.error ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setName('')
        setType('WEIGHTED')
        setMuscleGroup('CHEST')
        setIsPublic(false)
        setError('')
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add Custom Exercise</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex flex-col gap-5 py-2">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Exercise name</Label>
                        <Input
                            placeholder="e.g. Cable Lateral Raise"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-2">
                        <Label>Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setType(t.value)}
                                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${type === t.value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-card hover:bg-accent'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Muscle group */}
                    <div className="flex flex-col gap-2">
                        <Label>Muscle Group</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {MUSCLE_GROUPS.map((m) => (
                                <button
                                    key={m.value}
                                    onClick={() => setMuscleGroup(m.value)}
                                    className={`rounded-lg border py-2 text-xs font-medium transition-colors ${muscleGroup === m.value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-card hover:bg-accent'
                                        }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Public toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Make public</p>
                            <p className="text-xs text-muted-foreground">Share with other users</p>
                        </div>
                        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Exercise'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}