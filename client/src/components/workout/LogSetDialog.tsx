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

interface Props {
    open: boolean
    onClose: () => void
    exerciseName: string
    exerciseType: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
    lastSet?: {
        reps?: number | null
        weight?: number | null
        duration?: number | null
        distance?: number | null
    }
    onConfirm: (data: {
        reps?: number
        weight?: number
        duration?: number
        distance?: number
    }) => void
}

export default function LogSetDialog({
    open,
    onClose,
    exerciseName,
    exerciseType,
    lastSet,
    onConfirm,
}: Props) {
    const [reps, setReps] = useState(lastSet?.reps?.toString() ?? '')
    const [weight, setWeight] = useState(lastSet?.weight?.toString() ?? '')
    const [duration, setDuration] = useState(
        lastSet?.duration ? String(Math.floor(lastSet.duration / 60)) : ''
    )
    const [distance, setDistance] = useState(lastSet?.distance?.toString() ?? '')

    const handleConfirm = () => {
        if (exerciseType === 'WEIGHTED') {
            if (!reps || !weight) return
            onConfirm({ reps: Number(reps), weight: Number(weight) })
        } else if (exerciseType === 'BODYWEIGHT') {
            if (!reps) return
            onConfirm({ reps: Number(reps) })
        } else if (exerciseType === 'CARDIO') {
            if (!duration) return
            onConfirm({
                duration: Number(duration) * 60,
                distance: distance ? Number(distance) : undefined,
            })
        }
        onClose()
    }

    const handleClose = () => {
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{exerciseName}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {exerciseType === 'WEIGHTED' && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label>Reps</Label>
                                <Input
                                    type="number"
                                    placeholder={lastSet?.reps ? `Last: ${lastSet.reps}` : 'Reps'}
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                    className="text-center text-lg"
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Weight (kg)</Label>
                                <Input
                                    type="number"
                                    placeholder={lastSet?.weight ? `Last: ${lastSet.weight} kg` : 'kg'}
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="text-center text-lg"
                                />
                            </div>
                        </>
                    )}

                    {exerciseType === 'BODYWEIGHT' && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Reps</Label>
                            <Input
                                type="number"
                                placeholder={lastSet?.reps ? `Last: ${lastSet.reps}` : 'Reps'}
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                className="text-center text-lg"
                                autoFocus
                            />
                        </div>
                    )}

                    {exerciseType === 'CARDIO' && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label>Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    placeholder="Minutes"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="text-center text-lg"
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Distance (km) — optional</Label>
                                <Input
                                    type="number"
                                    placeholder="km"
                                    value={distance}
                                    onChange={(e) => setDistance(e.target.value)}
                                    className="text-center text-lg"
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleConfirm}>Log Set</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}