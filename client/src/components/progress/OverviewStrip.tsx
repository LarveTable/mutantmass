import { Dumbbell, Clock, Trophy, Zap } from 'lucide-react'
import { useOverviewStats } from '@/hooks/useWorkout'

interface Props {
    period: string
}

// Component to display the overview stats

function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

export default function OverviewStrip({ period }: Props) {
    const { data, isLoading } = useOverviewStats(period)

    const stats = [
        {
            icon: Dumbbell,
            label: 'Workouts',
            value: isLoading ? '-' : data?.totalWorkouts ?? 0,
        },
        {
            icon: Trophy,
            label: 'Total Sets',
            value: isLoading ? '-' : data?.totalSets ?? 0,
        },
        {
            icon: Zap,
            label: 'Volume',
            value: isLoading ? '-' : `${((data?.totalVolume ?? 0) / 1000).toFixed(1)}t`,
        },
        {
            icon: Clock,
            label: 'Avg Duration',
            value: isLoading ? '-' : formatDuration(data?.avgDuration ?? 0),
        },
    ]

    return (
        <div className="grid grid-cols-4 gap-2">
            {stats.map(({ icon: Icon, label, value }) => (
                <div
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3"
                >
                    <Icon size={16} className="text-primary" />
                    <span className="text-base font-bold tabular-nums">{value}</span>
                    <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
                </div>
            ))}
        </div>
    )
}