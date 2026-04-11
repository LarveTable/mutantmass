import { useEffect, useState } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { Clock } from 'lucide-react'

interface Props {
    startTime: number // timestamp in ms
}

function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function WorkoutTimer({ startTime }: Props) {
    const { t } = useTranslation()
    const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startTime) / 1000))

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [startTime])

    return (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
            <Clock size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">{t.workout.timer.duration}</span>
            <span className="ml-auto font-mono font-semibold tabular-nums">
                {formatDuration(elapsed)}
            </span>
        </div>
    )
}