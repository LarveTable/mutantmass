import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile, useWorkouts, useConsistencyStats, useOverviewStats } from '@/hooks/useWorkout'
import { Dumbbell, ChevronLeft, ChevronRight, Zap, Clock, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

// --- Helpers ---
function toDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = []
    const date = new Date(year, month, 1)
    while (date.getMonth() === month) {
        days.push(new Date(date))
        date.setDate(date.getDate() + 1)
    }
    return days
}

function getMonthStart(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
}

// --- Live clock ---
function LiveClock() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    const dateStr = time.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div>
            <p className="text-4xl font-bold tabular-nums tracking-tight">
                {formatTime(time)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
    )
}

// --- Monthly calendar ---
function MonthCalendar({
    workoutDates,
}: {
    workoutDates: Record<string, number>
}) {
    const [viewDate, setViewDate] = useState(new Date())
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const days = getDaysInMonth(year, month)
    const startOffset = getMonthStart(year, month)
    const today = toDateString(new Date())

    const monthLabel = viewDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })

    const maxVolume = Math.max(...Object.values(workoutDates), 0)

    function getDotColor(dateStr: string): string | null {
        const volume = workoutDates[dateStr]
        if (!volume) return null
        const ratio = volume / maxVolume
        if (ratio > 0.75) return '#c084fc' // Light purple
        if (ratio > 0.5) return '#a855f7'  // Medium purple
        if (ratio > 0.25) return '#7c3aed' // Deep violet
        return '#4c1d95'                  // Dark violet
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Month nav */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setViewDate(new Date(year, month - 1, 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-semibold">{monthLabel}</span>
                <button
                    onClick={() => setViewDate(new Date(year, month + 1, 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                    const dateStr = toDateString(day)
                    const dotColor = getDotColor(dateStr)
                    const isToday = dateStr === today
                    const hasWorkout = !!dotColor

                    return (
                        <div
                            key={dateStr}
                            className="relative flex flex-col items-center justify-center py-1"
                        >
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${hasWorkout
                                ? 'bg-primary text-primary-foreground font-bold'
                                : isToday
                                    ? 'border border-primary text-primary font-bold'
                                    : 'text-muted-foreground'
                                }`}>
                                {day.getDate()}
                            </div>
                            {hasWorkout && (
                                <div
                                    className="h-1 w-1 rounded-full mt-0.5"
                                    style={{ background: dotColor }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">Low intensity</span>
                {['#4c1d95', '#7c3aed', '#a855f7', '#c084fc'].map((color) => (
                    <div
                        key={color}
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: color }}
                    />
                ))}
                <span className="text-xs text-muted-foreground">High intensity</span>
            </div>
        </div>
    )
}

// --- Last workout card ---
function LastWorkoutCard({ workout }: { workout: any }) {
    const totalSets = workout.workoutExercises.reduce(
        (t: number, we: any) => t + we.sets.length, 0
    )
    const totalVolume = workout.workoutExercises.reduce(
        (t: number, we: any) =>
            t + we.sets.reduce((s: number, set: any) =>
                s + (set.weight && set.reps ? set.weight * set.reps : 0), 0), 0
    )
    const daysAgo = Math.floor(
        (Date.now() - new Date(workout.date).getTime()) / (1000 * 60 * 60 * 24)
    )

    return (
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">Last Workout</p>
                    <p className="font-semibold">{workout.name ?? 'Workout'}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                    {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
                </span>
            </div>

            <div className="flex gap-3">
                <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2">
                    <Trophy size={13} className="text-primary" />
                    <span className="text-xs font-medium">{totalSets} sets</span>
                </div>
                {workout.duration && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2">
                        <Clock size={13} className="text-primary" />
                        <span className="text-xs font-medium">{formatDuration(workout.duration)}</span>
                    </div>
                )}
                {totalVolume > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2">
                        <Dumbbell size={13} className="text-primary" />
                        <span className="text-xs font-medium">{totalVolume.toLocaleString()} kg</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-1.5">
                {workout.workoutExercises.map((we: any) => (
                    <span
                        key={we.id}
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium"
                    >
                        {we.exercise.name}
                    </span>
                ))}
            </div>
        </div>
    )
}

// --- Weekly goal ring ---
function WeeklyRing({ current, goal }: { current: number; goal: number }) {
    const percentage = Math.min(current / goal, 1)
    const radius = 28
    const circumference = 2 * Math.PI * radius
    const offset = circumference - percentage * circumference

    function getRingColor(current: number, goal: number): string {
        const ratio = current / goal
        if (ratio >= 1) return '#22c55e'      // green
        if (ratio >= 0.5) return '#f97316'    // orange
        return '#ef4444'                       // red
    }

    return (
        <div className="relative flex items-center justify-center h-20 w-20">
            <svg width="80" height="80" className="-rotate-90">
                <circle
                    cx="40" cy="40" r={radius}
                    stroke={getRingColor(current, goal)}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-lg font-bold leading-none">{current}</span>
                <span className="text-xs text-muted-foreground">/{goal}</span>
            </div>
        </div>
    )
}

// --- Main page ---
export default function DashboardPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: profile } = useProfile()
    const { data: consistency } = useConsistencyStats()
    const { data: weekStats } = useOverviewStats('week')

    const currentMonth = useMemo(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }, [])

    const { data: workouts = [] } = useWorkouts(currentMonth)

    const workoutDateVolumes = useMemo(() => {
        const map: Record<string, number> = {}
        for (const w of workouts) {
            const dateStr = w.date.split('T')[0]
            const volume = w.workoutExercises.reduce((t: number, we: any) =>
                t + we.sets.reduce((s: number, set: any) =>
                    s + (set.weight && set.reps ? set.weight * set.reps : 0), 0), 0)
            map[dateStr] = (map[dateStr] ?? 0) + volume
        }
        return map
    }, [workouts])

    const lastWorkout = workouts.length > 0
        ? [...workouts].sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]
        : null

    const currentWeek = consistency?.weeks?.[consistency.weeks.length - 1]
    const streak = useMemo(() => {
        if (!consistency?.weeks) return 0
        const reversed = [...consistency.weeks].reverse()
        const idx = reversed.findIndex((w: any) => !w.met)
        return idx === -1 ? consistency.weeks.length : idx
    }, [consistency])

    const displayName = profile?.name ?? user?.email?.split('@')[0] ?? 'there'

    return (
        <div className="flex flex-col gap-5 px-4 py-6 pb-24">
            {/* Top bar */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Good {
                        new Date().getHours() < 12 ? 'morning' :
                            new Date().getHours() < 18 ? 'afternoon' : 'evening'
                    },</p>
                    <h1 className="text-2xl font-bold">{displayName} 👋</h1>
                </div>
                <LiveClock />
            </div>

            {/* Streak + weekly goal */}
            <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                    <WeeklyRing
                        current={currentWeek?.count ?? 0}
                        goal={consistency?.weeklyGoal ?? 3}
                    />
                    <div>
                        <p className="text-xs text-muted-foreground">This week</p>
                        <p className="text-sm font-semibold">
                            {currentWeek?.count ?? 0} / {consistency?.weeklyGoal ?? 3} workouts
                        </p>
                        {currentWeek?.met && (
                            <p className="text-xs text-primary font-medium mt-0.5">Goal met ✅</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 py-4 gap-1">
                    <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold">{streak}</span>
                        <span className="text-lg">🔥</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        week{streak !== 1 ? 's' : ''}{'\n'}streak
                    </p>
                </div>
            </div>

            {/* Quick stats */}
            {weekStats && (
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
                        <Dumbbell size={15} className="text-primary" />
                        <span className="text-base font-bold">{weekStats.totalWorkouts}</span>
                        <span className="text-xs text-muted-foreground">Workouts</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
                        <Trophy size={15} className="text-primary" />
                        <span className="text-base font-bold">{weekStats.totalSets}</span>
                        <span className="text-xs text-muted-foreground">Sets</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
                        <Zap size={15} className="text-primary" />
                        <span className="text-base font-bold">
                            {weekStats.totalVolume > 0
                                ? `${(weekStats.totalVolume / 1000).toFixed(1)}t`
                                : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">Volume</span>
                    </div>
                </div>
            )}

            {/* Start workout CTA */}
            <Button
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl"
                onClick={() => navigate('/workout')}
            >
                <Dumbbell size={20} className="mr-2" />
                Start Workout
            </Button>

            {/* Last workout */}
            {lastWorkout && <LastWorkoutCard workout={lastWorkout} />}

            {/* Monthly calendar */}
            <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    This Month
                </p>
                <MonthCalendar workoutDates={workoutDateVolumes} />
            </div>
        </div>
    )
}