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
import { useWorkoutSearch } from '@/hooks/useWorkout'
import { ChevronDown, X } from 'lucide-react'

const REST_PRESETS = [60, 90, 120, 180]

interface Props {
    open: boolean
    onClose: () => void
    onStart: (name: string, restTimer: number | null, templateWorkout: any | null) => void
    isLoading: boolean
}

export default function StartWorkoutDialog({ open, onClose, onStart, isLoading }: Props) {
    const [name, setName] = useState('')
    const [restTimerEnabled, setRestTimerEnabled] = useState(false)
    const [restDuration, setRestDuration] = useState(90)
    const [templateSearch, setTemplateSearch] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
    const [templatePickerOpen, setTemplatePickerOpen] = useState(false)

    const { data: filteredWorkouts = [] } = useWorkoutSearch(templateSearch)

    const handleSelectTemplate = (workout: any) => {
        setSelectedTemplate(workout)
        setName(workout.name ?? '')
        if (workout.restTimer) {
            setRestTimerEnabled(true)
            setRestDuration(workout.restTimer)
        }
        setTemplatePickerOpen(false)
        setTemplateSearch('')
    }

    const handleClearTemplate = () => {
        setSelectedTemplate(null)
        setName('')
    }

    const handleStart = () => {
        onStart(name || '', restTimerEnabled ? restDuration : null, selectedTemplate)
    }

    const handleClose = () => {
        setName('')
        setRestTimerEnabled(false)
        setRestDuration(90)
        setSelectedTemplate(null)
        setTemplateSearch('')
        setTemplatePickerOpen(false)
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Start Workout</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex flex-col gap-5 py-2">
                    {/* Template picker */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Base on previous workout (optional)</Label>
                        {selectedTemplate ? (
                            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                                <div>
                                    <p className="text-sm font-medium">{selectedTemplate.name ?? 'Workout'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedTemplate.workoutExercises.length} exercise
                                        {selectedTemplate.workoutExercises.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClearTemplate}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setTemplatePickerOpen((v) => !v)}
                                    className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
                                >
                                    <span>Select a workout...</span>
                                    <ChevronDown size={16} />
                                </button>

                                {templatePickerOpen && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                                        <div className="p-2 border-b border-border">
                                            <Input
                                                placeholder="Search workouts..."
                                                value={templateSearch}
                                                onChange={(e) => setTemplateSearch(e.target.value)}
                                                autoFocus
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredWorkouts.length === 0 && (
                                                <p className="text-center text-xs text-muted-foreground py-4">
                                                    No workouts found
                                                </p>
                                            )}
                                            {filteredWorkouts.map((workout: any) => (
                                                <button
                                                    key={workout.id}
                                                    onClick={() => handleSelectTemplate(workout)}
                                                    className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                                                >
                                                    <p className="text-sm font-medium">{workout.name ?? 'Workout'}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {workout.workoutExercises.map((we: any) => we.exercise.name).join(', ')}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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