import { Dumbbell, Clock, Trophy, Zap } from 'lucide-react'
import { useTranslation } from '@/context/LanguageContext'
import { useOverviewStats } from '@/hooks/useWorkout'

interface Props {
    period: string
}

// Component to display the overview stats

function formatDuration(seconds: number, t: any) {
    const h = Math.floor(seconds /3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}${t.history.duration.hourAbbr} ${m}${t.history.duration.minAbbr}`
    return `${m}${t.history.duration.minAbbr}`
}

export default function OverviewStrip({ period }: Props) {
    const { t } = useTranslation()
    const { data, isLoading } = useOverviewStats(period)

    const stats = [
        {
            icon: Dumbbell,
            label: t.progress.overview.workouts,
            value: isLoading ? '-' : data?.totalWorkouts ?? 0,
        },
        {
            icon: Trophy,
            label: t.progress.overview.totalSets,
            value: isLoading ? '-' : data?.totalSets ?? 0,
        },
        {
            icon: Zap,
            label: t.progress.overview.volume,
            value: isLoading ? '-' : (
                (data?.totalVolume ?? 0) >= 1000 
                    ? `${((data?.totalVolume ?? 0) / 1000).toFixed(1)}t` 
                    : `${data?.totalVolume ?? 0}kg`
            ),
        },
        {
            icon: Clock,
            label: t.progress.overview.avgDuration,
            value: isLoading ? '-' : formatDuration(data?.avgDuration ?? 0, t),
        },
    ]

    return (
        <div className="grid grid-cols-4 gap-2">
            {stats.map(({ icon: Icon, label, value }) => (
                <div
                    key={label}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card p-3 h-full"
                >
                    <Icon size={16} className="text-primary shrink-0" />
                    <span className="text-base font-bold tabular-nums text-center leading-tight">{value}</span>
                    <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
                </div>
            ))}
        </div>
    )
}