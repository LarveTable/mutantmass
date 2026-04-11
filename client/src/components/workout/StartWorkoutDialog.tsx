import { useState } from 'react'
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
    const { t } = useTranslation()
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
        const defaultName = selectedTemplate ? (selectedTemplate.name || t.workout.startDialog.fallbackName) : t.workout.startDialog.fallbackName
        onStart(name || defaultName, restTimerEnabled ? restDuration : null, selectedTemplate)
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
                    <DialogTitle>{t.workout.startDialog.title}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="flex flex-col gap-5 py-2">
                    {/* Template picker */}
                    <div className="flex flex-col gap-1.5">
                        <Label>{t.workout.startDialog.baseOnPrevious}</Label>
                        {selectedTemplate ? (
                            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                                <div>
                                    <p className="text-sm font-medium">{selectedTemplate.name ?? t.workout.startDialog.fallbackName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedTemplate.workoutExercises.length} {selectedTemplate.workoutExercises.length !== 1 ? t.workout.startDialog.exercises : t.workout.startDialog.exercise}
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
                                    <span>{t.workout.startDialog.selectWorkout}</span>
                                    <ChevronDown size={16} />
                                </button>

                                {templatePickerOpen && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                                        <div className="p-2 border-b border-border">
                                            <Input
                                                placeholder={t.workout.startDialog.searchWorkouts}
                                                value={templateSearch}
                                                onChange={(e) => setTemplateSearch(e.target.value)}
                                                autoFocus
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredWorkouts.length === 0 && (
                                                <p className="text-center text-xs text-muted-foreground py-4">
                                                    {t.workout.startDialog.noWorkoutsFound}
                                                </p>
                                            )}
                                            {filteredWorkouts.map((workout: any, index: number) => (
                                                <button
                                                    key={workout.id}
                                                    onClick={() => handleSelectTemplate(workout)}
                                                    className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-medium">{workout.name ?? t.workout.startDialog.fallbackName}</p>
                                                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {new Date(workout.date).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate w-full">
                                                        {workout.workoutExercises.map((we: any) => we.exercise.name).join(', ')}
                                                    </p>
                                                    {index === 0 && (
                                                        <p className="text-[11px] font-medium text-primary mt-0.5">{t.workout.startDialog.lastWorkout}</p>
                                                    )}
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
                        <Label htmlFor="workout-name">{t.workout.logPastDialog.nameLabel}</Label>
                        <Input
                            id="workout-name"
                            placeholder={t.workout.logPastDialog.namePlaceholder}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Rest timer toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">{t.workout.logPastDialog.restTimerLabel}</p>
                            <p className="text-xs text-muted-foreground">{t.workout.startDialog.restAutoStart}</p>
                        </div>
                        <Switch
                            checked={restTimerEnabled}
                            onCheckedChange={setRestTimerEnabled}
                        />
                    </div>

                    {/* Rest duration presets */}
                    {restTimerEnabled && (
                        <div className="flex flex-col gap-2">
                            <Label>{t.workout.startDialog.restDuration}</Label>
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
                                <span className="text-sm text-muted-foreground">{t.workout.startDialog.secondsCustom}</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>{t.common.cancel}</Button>
                    <Button onClick={handleStart} disabled={isLoading}>
                        {isLoading ? t.workout.startDialog.starting : t.workout.startDialog.startBtn}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}