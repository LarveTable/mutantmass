import { useFrequencyStats } from '@/hooks/useWorkout'

function toDateString(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

// Component to display the frequency heatmap

function getLast52Weeks(): Date[][] {
    const weeks: Date[][] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)
    // Align to Monday
    const day = startDate.getDay()
    const diff = day === 0 ? -6 : 1 - day
    startDate.setDate(startDate.getDate() + diff)

    let current = new Date(startDate)
    while (current <= today) {
        const week: Date[] = []
        for (let i = 0; i < 7; i++) {
            week.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
        weeks.push(week)
    }
    return weeks
}

export default function FrequencyHeatmap() {
    const { data = {}, isLoading } = useFrequencyStats()
    const weeks = getLast52Weeks()

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const monthLabels: { label: string; col: number }[] = []
    weeks.forEach((week, i) => {
        const firstDay = week[0]
        if (firstDay.getDate() <= 7) {
            monthLabels.push({ label: MONTHS[firstDay.getMonth()], col: i })
        }
    })

    if (isLoading) return (
        <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
    )

    return (
        <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex mb-1 ml-6">
                    {weeks.map((_, i) => {
                        const label = monthLabels.find(m => m.col === i)
                        return (
                            <div key={i} className="w-4 mr-0.5 text-xs text-muted-foreground shrink-0">
                                {label?.label ?? ''}
                            </div>
                        )
                    })}
                </div>

                <div className="flex gap-0.5">
                    {/* Day labels */}
                    <div className="flex flex-col gap-0.5 mr-1">
                        {['M', '', 'W', '', 'F', '', 'S'].map((d, i) => (
                            <div key={i} className="h-4 text-xs text-muted-foreground flex items-center">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-0.5">
                            {week.map((day) => {
                                const dateStr = toDateString(day)
                                const count = (data as any)[dateStr] ?? 0
                                const isToday = dateStr === toDateString(new Date())
                                return (
                                    <div
                                        key={dateStr}
                                        title={`${dateStr}: ${count} workout${count !== 1 ? 's' : ''}`}
                                        className={`h-4 w-4 rounded-sm ${isToday ? 'ring-1 ring-primary' : ''}`}
                                        style={{
                                            background: count === 0
                                                ? 'hsl(var(--muted))'
                                                : count === 1
                                                    ? 'hsl(var(--primary) / 0.4)'
                                                    : count === 2
                                                        ? 'hsl(var(--primary) / 0.7)'
                                                        : 'hsl(var(--primary))',
                                        }}
                                    />
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}