import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile, useWorkouts, useWorkoutsRange, useConsistencyStats, useOverviewStats } from '@/hooks/useWorkout'
import { Dumbbell, ChevronLeft, ChevronRight, Zap, Clock, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMuscleStats } from '@/hooks/useWorkout'

// --- Helpers ---
function toDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatTime(date: Date, lang: string): string {
    return date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: false })
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
    const { lang } = useTranslation()
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    const dateStr = time.toLocaleDateString(lang, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div>
            <p className="text-4xl font-bold tabular-nums tracking-tight">
                {formatTime(time, lang)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
    )
}

// --- Monthly calendar ---
function MonthCalendar() {
    const { t, lang } = useTranslation()
    const [viewDate, setViewDate] = useState(new Date())
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 1) // strictly before next month
    const { data: workouts = [] } = useWorkoutsRange(start.toISOString(), end.toISOString())

    const workoutStatsByDate = useMemo(() => {
        const map: Record<string, { volume: number, altVolume: number }> = {}
        for (const w of workouts) {
            const dateStr = toDateString(new Date(w.date))
            if (!map[dateStr]) map[dateStr] = { volume: 0, altVolume: 0 }

            for (const we of w.workoutExercises) {
                for (const set of we.sets) {
                    if (set.weight && set.reps) {
                        map[dateStr].volume += set.weight * set.reps
                    } else if (set.reps) {
                        map[dateStr].altVolume += set.reps
                    } else if (set.duration) {
                        map[dateStr].altVolume += set.duration / 60
                    } else if (set.distance) {
                        map[dateStr].altVolume += set.distance * 10
                    } else {
                        map[dateStr].altVolume += 1
                    }
                }
            }
            // Ensure even an empty workout gets marked
            if (map[dateStr].volume === 0 && map[dateStr].altVolume === 0) {
                map[dateStr].altVolume = 1
            }
        }
        return map
    }, [workouts])

    const days = getDaysInMonth(year, month)
    const startOffset = getMonthStart(year, month)
    const today = toDateString(new Date())

    const monthLabel = viewDate.toLocaleDateString(lang, {
        month: 'long',
        year: 'numeric',
    })

    const maxVolume = Math.max(...Object.values(workoutStatsByDate).map(s => s.volume), 0)
    const maxAltVolume = Math.max(...Object.values(workoutStatsByDate).map(s => s.altVolume), 0)

    function getDotColor(dateStr: string): string | null {
        const stats = workoutStatsByDate[dateStr]
        if (!stats) return null

        if (stats.volume > 0) {
            const ratio = stats.volume / maxVolume
            if (ratio > 0.75) return '#c084fc' // Light purple
            if (ratio > 0.5) return '#a855f7'  // Medium purple
            if (ratio > 0.25) return '#7c3aed' // Deep violet
            return '#4c1d95'                  // Dark violet
        } else {
            const ratio = stats.altVolume / (maxAltVolume || 1)
            if (ratio > 0.75) return '#fdba74' // Light orange
            if (ratio > 0.5) return '#f97316'  // Medium orange
            if (ratio > 0.25) return '#ea580c' // Deep orange
            return '#9a3412'                  // Dark orange
        }
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
                {t.dashboard.activity.days.map((d, i) => (
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
                                    className="h-2 w-2 rounded-full mt-0.5"
                                    style={{ background: dotColor }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-1.5 items-end mt-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">{t.dashboard.activity.weightsIntensity}</span>
                    {['#4c1d95', '#7c3aed', '#a855f7', '#c084fc'].map((color) => (
                        <div
                            key={color}
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ background: color }}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">{t.dashboard.activity.cardioIntensity}</span>
                    {['#9a3412', '#ea580c', '#f97316', '#fdba74'].map((color) => (
                        <div
                            key={color}
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ background: color }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// --- Last workout card ---
function LastWorkoutCard({ workout }: { workout: any }) {
    const { t } = useTranslation()
    const totalSets = workout.workoutExercises.reduce(
        (t: number, we: any) => t + we.sets.length, 0
    )
    const totalVolume = workout.workoutExercises.reduce(
        (t: number, we: any) =>
            t + we.sets.reduce((s: number, set: any) =>
                s + (set.weight && set.reps ? set.weight * set.reps : 0), 0), 0
    )
    const daysAgo = Math.abs(Math.floor(
        (Date.now() - new Date(workout.date).getTime()) / (1000 * 60 * 60 * 24)
    ))

    return (
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">{t.dashboard.lastWorkout.title}</p>
                    <p className="font-semibold">{workout.name ?? t.workout.active.defaultName}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                    {daysAgo === 0 ? t.dashboard.lastWorkout.today : daysAgo === 1 ? t.dashboard.lastWorkout.yesterday : t.dashboard.lastWorkout.daysAgo.replace('{{count}}', daysAgo.toString())}
                </span>
            </div>

            <div className="flex gap-3">
                <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2">
                    <Trophy size={13} className="text-primary" />
                    <span className="text-xs font-medium">{totalSets} {t.history.stats.sets}</span>
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
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: profile } = useProfile()
    const { data: consistency } = useConsistencyStats()
    const { data: weekStats } = useOverviewStats('thisWeek')
    const { data: lastWeekStats } = useOverviewStats('lastWeek')
    const { data: muscleData = {} } = useMuscleStats('thisWeek')
    const { data: lastMuscleData = {} } = useMuscleStats('lastWeek')

    const MUSCLE_COLORS: Record<string, string> = {
        CHEST: '#ef4444',
        BACK: '#3b82f6',
        SHOULDERS: '#a855f7',
        BICEPS: '#f97316',
        TRICEPS: '#eab308',
        FOREARMS: '#84cc16',
        LEGS: '#06b6d4',
        GLUTES: '#ec4899',
        CORE: '#14b8a6',
        CARDIO: '#64748b',
        FULL_BODY: '#8b5cf6',
    }

    const currentMonth = useMemo(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }, [])

    const { data: workouts = [] } = useWorkouts(currentMonth)

    const lastWorkout = useMemo(() => {
        const now = new Date()
        return workouts
            .filter((w: any) => new Date(w.date) <= now)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null
    }, [workouts])

    const currentWeek = consistency?.weeks?.[consistency.weeks.length - 1]
    const streak = useMemo(() => {
        if (!consistency?.weeks || consistency.weeks.length === 0) return 0
        const weeks = consistency.weeks
        const currentWeek = weeks[weeks.length - 1]
        const pastWeeks = weeks.slice(0, -1)

        const pastStreakBreak = [...pastWeeks].reverse().findIndex((w: any) => !w.met)
        const pastStreak = pastStreakBreak === -1 ? pastWeeks.length : pastStreakBreak

        return currentWeek.met ? pastStreak + 1 : pastStreak
    }, [consistency])

    const displayName = profile?.name ?? user?.email?.split('@')[0] ?? 'there'

    return (
        <div className="flex flex-col gap-5 px-4 py-6 pb-24">
            {/* Top bar */}
            <div className="flex items-start justify-between relative">
                <div>
                    <p className="text-sm text-muted-foreground">{
                        new Date().getHours() < 12 ? t.dashboard.greetings.morning :
                            new Date().getHours() < 18 ? t.dashboard.greetings.afternoon : t.dashboard.greetings.evening
                    },</p>
                    <h1 className="text-2xl font-bold relative z-10">{displayName} 👋</h1>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-0">
                    <img src="/icons/icon-512.png" alt="App Icon" className="h-12 w-12 rounded-xl drop-shadow-md" />
                </div>
                <div className="relative z-10">
                    <LiveClock />
                </div>
            </div>

            {/* Streak + weekly goal */}
            <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                    <WeeklyRing
                        current={currentWeek?.count ?? 0}
                        goal={consistency?.weeklyGoal ?? 3}
                    />
                    <div>
                        <p className="text-xs text-muted-foreground">{t.dashboard.stats.thisWeek}</p>
                        <p className="text-sm font-semibold">
                            {currentWeek?.count ?? 0} / {consistency?.weeklyGoal ?? 3} {(currentWeek?.count ?? 0) === 1 ? t.dashboard.stats.workoutCount.one : t.dashboard.stats.workoutCount.other}
                        </p>
                        {currentWeek?.met && (
                            <p className="text-xs text-primary font-medium mt-0.5">{t.dashboard.stats.goalMet} ✅</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 py-4 gap-1">
                    <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold">{streak}</span>
                        <span className="text-lg">🔥</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        {streak === 1 ? t.dashboard.stats.streak.one : t.dashboard.stats.streak.other}
                    </p>
                </div>
            </div>

            {/* Quick stats */}
            {weekStats && (
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
                        <Trophy size={15} className="text-primary" />
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold">{weekStats.totalSets}</span>
                            {lastWeekStats && (
                                <span className={`text-[10px] font-medium ${weekStats.totalSets >= lastWeekStats.totalSets ? 'text-green-500' : 'text-red-500'}`}>
                                    {weekStats.totalSets >= lastWeekStats.totalSets ? '+' : ''}{weekStats.totalSets - lastWeekStats.totalSets}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">{t.dashboard.quickStats.sets}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
                        <Zap size={15} className="text-primary" />
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold">
                                {weekStats.totalVolume > 0
                                    ? `${(weekStats.totalVolume / 1000).toFixed(1)}t`
                                    : '-'}
                            </span>
                            {lastWeekStats && weekStats.totalVolume > 0 && (
                                <span className={`text-[10px] font-medium ${weekStats.totalVolume >= lastWeekStats.totalVolume ? 'text-green-500' : 'text-red-500'}`}>
                                    {weekStats.totalVolume >= lastWeekStats.totalVolume ? '+' : ''}{((weekStats.totalVolume - lastWeekStats.totalVolume) / 1000).toFixed(1)}t
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">{t.dashboard.quickStats.volume}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
                        <Clock size={15} className="text-primary" />
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold">{formatDuration(weekStats.totalDuration ?? 0)}</span>
                            {lastWeekStats && (
                                <span className={`text-[10px] font-medium ${(weekStats.totalDuration ?? 0) >= (lastWeekStats.totalDuration ?? 0) ? 'text-green-500' : 'text-red-500'}`}>
                                    {(weekStats.totalDuration ?? 0) >= (lastWeekStats.totalDuration ?? 0) ? '+' : '-'}{formatDuration(Math.abs((weekStats.totalDuration ?? 0) - (lastWeekStats.totalDuration ?? 0)))}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">{t.dashboard.quickStats.time}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
                        <Dumbbell size={15} className="text-primary" />
                        <span className="text-base font-bold truncate px-1 max-w-full capitalize">
                            {Object.entries(muscleData as Record<string, { volume: number; reps: number; duration: number }>)
                                .sort(([, a], [, b]) => (b.volume || b.duration) - (a.volume || a.duration))[0]?.[0].toLowerCase().replace('_', ' ') ?? '-'}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{t.dashboard.quickStats.mostTrained}</span>
                            {Object.keys(lastMuscleData).length > 0 && (
                                <span className="text-[10px] text-muted-foreground italic border-l border-border pl-1.5">
                                    {t.dashboard.quickStats.last}: {Object.entries(lastMuscleData as Record<string, { volume: number; reps: number; duration: number }>)
                                        .sort(([, a], [, b]) => (b.volume || b.duration) - (a.volume || a.duration))[0]?.[0].toLowerCase().replace('_', ' ') ?? '-'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Muscles Hit This Week */}
            {Object.keys(muscleData).length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t.dashboard.muscleStats.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(muscleData as Record<string, { volume: number; reps: number; duration: number }>)
                            .sort(([, a], [, b]) => (b.volume || b.duration) - (a.volume || a.duration))
                            .map(([muscle, stats]) => (
                                <div
                                    key={muscle}
                                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                                    style={{ background: `${MUSCLE_COLORS[muscle]}20`, border: `1px solid ${MUSCLE_COLORS[muscle]}40` }}
                                >
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ background: MUSCLE_COLORS[muscle] }}
                                    />
                                    <span className="text-xs font-medium capitalize" style={{ color: MUSCLE_COLORS[muscle] }}>
                                        {muscle.toLowerCase().replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground flex flex-col gap-0.5">
                                        {stats.volume > 0 && (
                                            <span>{(stats.volume / 1000).toFixed(1)}t {t.dashboard.muscleStats.for} {stats.reps} {t.dashboard.muscleStats.reps}</span>
                                        )}
                                        {stats.volume === 0 && stats.reps > 0 && (
                                            <span>{stats.reps} {t.dashboard.muscleStats.reps}</span>
                                        )}
                                        {stats.duration > 0 && (
                                            <span className="flex items-center gap-1">
                                                {stats.volume === 0 && stats.reps === 0 ? '' : '• '}
                                                {formatDuration(stats.duration)}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            ))}
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
                {t.dashboard.cta.start}
            </Button>

            {/* Last workout */}
            {lastWorkout && <LastWorkoutCard workout={lastWorkout} />}

            {/* Monthly calendar */}
            <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    {t.dashboard.activity.title}
                </p>
                <MonthCalendar />
            </div>
        </div>
    )
}