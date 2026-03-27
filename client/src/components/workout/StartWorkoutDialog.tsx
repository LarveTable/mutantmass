import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

// Component to log a workout

interface Props {
    open: boolean
    onClose: () => void
    onStart: (name: string, restTimer: number | null) => void
    isLoading: boolean
}

const REST_PRESETS = [60, 90, 120, 180]

export default function StartWorkoutDialog({ open, onClose, onStart, isLoading }: Props) {
    const [name, setName] = useState('')
    const [restTimerEnabled, setRestTimerEnabled] = useState(false)
    const [restDuration, setRestDuration] = useState(90)

    const handleStart = () => {
        onStart(name || '', restTimerEnabled ? restDuration : null)
    }

    const handleClose = () => {
        setName('')
        setRestTimerEnabled(false)
        setRestDuration(90)
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Start Workout</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5 py-2">
                    {/* Workout name */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="workout-name">Workout name (optional)</Label>
                        <Input
                            id="workout-name"
                            placeholder="e.g. Push Day"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Rest timer toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Rest Timer</p>
                            <p className="text-xs text-muted-foreground">Auto-start after each set</p>
                        </div>
                        <Switch
                            checked={restTimerEnabled}
                            onCheckedChange={setRestTimerEnabled}
                        />
                    </div>

                    {/* Rest duration presets */}
                    {restTimerEnabled && (
                        <div className="flex flex-col gap-2">
                            <Label>Rest duration</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {REST_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setRestDuration(preset)}
                                        className={`rounded-lg border py-2 text-sm font-medium transition-colors ${restDuration === preset
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card text-foreground hover:bg-accent'
                                            }`}
                                    >
                                        {preset}s
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={restDuration}
                                    onChange={(e) => setRestDuration(Number(e.target.value))}
                                    className="w-24"
                                    min={10}
                                    max={600}
                                />
                                <span className="text-sm text-muted-foreground">seconds (custom)</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleStart} disabled={isLoading}>
                        {isLoading ? 'Starting...' : 'Start Workout'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}