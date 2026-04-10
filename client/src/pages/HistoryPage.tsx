import { useState, useMemo } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useWorkoutsRange, useDeleteWorkout } from '@/hooks/useWorkout'
import WeeklyCalendar from '@/components/history/WeeklyCalendar'
import WorkoutDetailModal from '@/components/history/WorkoutDetailModal'
import { Dumbbell, Clock, Trash2 } from 'lucide-react'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

// Page used to access the past workouts and maybe edit them

function getMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    d.setHours(0, 0, 0, 0)
    return d
}

function toDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}


export default function HistoryPage() {
    const { t, lang } = useTranslation()
    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null)

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        if (h > 0) return `${h}${t.history.duration.hourAbbr} ${m}${t.history.duration.minAbbr}`
        return `${m}${t.history.duration.minAbbr}`
    }

    const startDateIso = useMemo(() => weekStart.toISOString(), [weekStart])
    const endDateIso = useMemo(() => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + 7)
        return d.toISOString()
    }, [weekStart])

    const { data: workouts = [] } = useWorkoutsRange(startDateIso, endDateIso)
    const deleteWorkout = useDeleteWorkout()

    const workoutDates = useMemo(() =>
        workouts.map((w: any) => toDateString(new Date(w.date))), [workouts])

    const workoutsOnSelectedDate = useMemo(() => {
        if (!selectedDate) return []
        return workouts.filter((w: any) =>
            toDateString(new Date(w.date)) === selectedDate
        )
    }, [workouts, selectedDate])

    const handlePrevWeek = () => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() - 7)
        setWeekStart(d)
        setSelectedDate(null)
    }

    const handleNextWeek = () => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + 7)
        setWeekStart(d)
        setSelectedDate(null)
    }

    const handleSelectDate = (date: string) => {
        setSelectedDate(date)
    }

    return (
        <div className="flex flex-col gap-6 px-4 py-6">
            <h1 className="text-xl font-bold">{t.history.title}</h1>

            {/* Calendar */}
            <WeeklyCalendar
                currentWeekStart={weekStart}
                workoutDates={workoutDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
            />

            {/* Workout list for selected date */}
            {selectedDate && workoutsOnSelectedDate.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {new Date(selectedDate).toLocaleDateString(lang, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </h2>
                    {workoutsOnSelectedDate.map((workout: any) => {
                        const totalSets = workout.workoutExercises.reduce(
                            (t: number, we: any) => t + we.sets.length, 0)
                        const totalVolume = workout.workoutExercises.reduce(
                            (t: number, we: any) => t + we.sets.reduce(
                                (s: number, set: any) => s + (set.weight && set.reps ? set.weight * set.reps : 0), 0), 0)

                        return (
                            <button
                                key={workout.id}
                                onClick={() => setSelectedWorkoutId(workout.id)}
                                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{workout.name ?? t.workout.active.defaultName}</p>
                                    <div className="flex items-center gap-2">
                                        {workout.duration && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock size={13} />
                                                <span className="text-xs">{formatDuration(workout.duration)}</span>
                                            </div>
                                        )}
                                        <div
                                            role="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setWorkoutToDelete(workout.id)
                                                setDeleteConfirmOpen(true)
                                            }}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </div>
                                    </div>
                                </div>

                                {/* Exercise pills */}
                                <div className="flex flex-wrap gap-2">
                                    {workout.workoutExercises.map((we: any) => (
                                        <div
                                            key={we.id}
                                            className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1"
                                        >
                                            <Dumbbell size={11} className="text-primary" />
                                            <span className="text-xs font-medium">{we.exercise.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{totalSets} {t.history.stats.sets}</span>
                                    {totalVolume > 0 && (
                                        <>
                                            <span>·</span>
                                            <span>{totalVolume.toLocaleString()} {t.history.stats.volume}</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Empty state */}
            {!selectedDate && (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Dumbbell size={32} className="text-muted-foreground/40" />
                    <p className="text-muted-foreground text-sm">
                        {t.history.empty.selectDay}
                    </p>
                </div>
            )}

            {/* Workout detail modal */}
            {selectedWorkoutId && (
                <WorkoutDetailModal
                    workoutId={selectedWorkoutId}
                    onClose={() => setSelectedWorkoutId(null)}
                />
            )}

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={() => {
                    if (workoutToDelete) {
                        deleteWorkout.mutate(workoutToDelete)
                        setWorkoutToDelete(null)
                    }
                }}
                title={t.history.deleteConfirm.title}
                description={t.history.deleteConfirm.description}
                confirmText={t.history.deleteConfirm.confirm}
                variant="destructive"
            />
        </div>
    )
}