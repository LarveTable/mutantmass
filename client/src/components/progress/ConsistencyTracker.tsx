import { useState } from 'react'
import { useConsistencyStats, useUpdateWeeklyGoal } from '@/hooks/useWorkout'
import { Check, X, Minus } from 'lucide-react'

// Component to track consistency

export default function ConsistencyTracker() {
    const { data, isLoading } = useConsistencyStats()
    const updateGoal = useUpdateWeeklyGoal()
    const [editing, setEditing] = useState(false)
    const [goalInput, setGoalInput] = useState('')

    if (isLoading || !data) return (
        <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
    )

    const { weeks, weeklyGoal } = data
    const currentWeek = weeks[weeks.length - 1]
    const pastWeeks = [...weeks].slice(0, -1)
    const pastStreakBreak = [...pastWeeks].reverse().findIndex(w => !w.met)
    const pastStreak = pastStreakBreak === -1 ? pastWeeks.length : pastStreakBreak
    const actualStreak = currentWeek.met ? pastStreak + 1 : pastStreak

    const handleGoalSave = () => {
        const val = parseInt(goalInput)
        if (val >= 1 && val <= 7) {
            updateGoal.mutate(val)
        }
        setEditing(false)
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Goal + streak row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Weekly goal:</span>
                    {editing ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                className="w-12 rounded border border-border bg-card px-2 py-0.5 text-sm text-center outline-none focus:border-primary"
                                min={1}
                                max={7}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
                            />
                            <button onClick={handleGoalSave} className="text-primary">
                                <Check size={14} />
                            </button>
                            <button onClick={() => setEditing(false)} className="text-muted-foreground">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { setGoalInput(String(weeklyGoal)); setEditing(true) }}
                            className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
                        >
                            {weeklyGoal}x / week
                        </button>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">{actualStreak} week{actualStreak !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-muted-foreground">streak 🔥</p>
                </div>
            </div>

            {/* Current week progress */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">This week</p>
                    <p className="text-sm text-muted-foreground">
                        {currentWeek.count} / {weeklyGoal} workouts
                    </p>
                </div>
                <div className="flex gap-2">
                    {Array.from({ length: weeklyGoal }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-colors ${i < currentWeek.count ? 'bg-primary' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>
                {currentWeek.met && (
                    <p className="text-xs text-primary font-medium">✅ Goal met this week!</p>
                )}
            </div>

            {/* Last 8 weeks grid */}
            <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Last 8 weeks
                </p>
                <div className="grid grid-cols-8 gap-1.5">
                    {weeks.map((week: any, i: number) => {
                        const isCurrentWeek = i === weeks.length - 1
                        return (
                            <div key={week.weekStart} className="flex flex-col items-center gap-1">
                                <div
                                    className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-colors ${week.met
                                        ? 'bg-primary text-primary-foreground'
                                        : week.count > 0
                                            ? 'bg-primary/30 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                        } ${isCurrentWeek ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                                >
                                    {week.met ? (
                                        <Check size={14} />
                                    ) : week.count > 0 ? (
                                        week.count
                                    ) : (
                                        <Minus size={12} />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}