import { useTargetMuscleStats } from '@/hooks/useWorkout'
import { useTranslation } from '@/context/LanguageContext'
import Model, { type IExerciseData } from 'react-body-highlighter'

interface Props {
    period: string
}

const PRISMA_TO_BODY_HIGHLIGHTER: Record<string, string[]> = {
    CHEST: ['chest'],
    BACK: ['trapezius', 'upper-back', 'lower-back'],
    SHOULDERS: ['front-deltoids', 'back-deltoids'],
    BICEPS: ['biceps'],
    TRICEPS: ['triceps'],
    FOREARMS: ['forearm'],
    LEGS: ['quadriceps', 'hamstring', 'calves', 'adductor', 'abductors'],
    GLUTES: ['gluteal'],
    CORE: ['abs', 'obliques'],
}

// Component to show the most trained muscles in a visual way

export default function BodyHeatmap({ period }: Props) {
    const { t } = useTranslation()
    const { data = {}, isLoading } = useTargetMuscleStats(period)

    if (isLoading) return (
        <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">{t.common.loading}</p>
        </div>
    )

    const rawData = data as Record<string, any>
    
    // Extract volumes and ignore CARDIO
    const volumeData: Record<string, number> = {}
    Object.entries(rawData).forEach(([muscle, stats]) => {
        if (muscle === 'CARDIO') return
        const vol = typeof stats === 'number' ? stats : (stats?.volume || 0)
        if (vol > 0) {
            volumeData[muscle] = vol
        }
    })

    // Get unique volumes sorted descending to determine ranks
    const uniqueVolumes = Array.from(new Set(Object.values(volumeData))).sort((a, b) => b - a)

    // Map volume to a frequency bucket based on actual rank (1st, 2nd, 3rd, Rest)
    function getRankBucket(volume: number): number {
        if (volume === 0) return 0
        const index = uniqueVolumes.indexOf(volume)
        if (index === 0) return 4 // 1st Place
        if (index === 1) return 3 // 2nd Place
        if (index === 2) return 2 // 3rd Place
        return 1 // 4th+ Place
    }

    const highlightedData: IExerciseData[] = Object.entries(volumeData)
        .map(([muscle, volume]) => {
            const bucket = getRankBucket(volume)
            if (bucket === 0) return null
            
            const musclesToHighlight = PRISMA_TO_BODY_HIGHLIGHTER[muscle] || [muscle]

            return {
                name: muscle,
                muscles: musclesToHighlight,
                frequency: bucket
            }
        })
        .filter(Boolean) as IExerciseData[]

    // Red -> Orange -> Green -> Blue
    const colors = [
        '#3b82f6', // 4th+ (Blue)
        '#22c55e', // 3rd (Green)
        '#f97316', // 2nd (Orange)
        '#ef4444', // 1st (Red)
    ]

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 sm:gap-12 justify-center items-center">
                {/* Front view */}
                <div className="flex flex-col items-center gap-3 flex-1 max-w-[180px]">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase opacity-60">{t.progress.charts.heatmap.front}</p>
                    <div className="w-full aspect-[1/2.2] flex items-center justify-center p-0">
                        <Model
                            data={highlightedData}
                            style={{ width: '100%', height: '100%' }}
                            svgStyle={{ stroke: 'hsl(var(--border))', strokeWidth: 0.8 }}
                            bodyColor="hsl(var(--muted) / 0.5)"
                            highlightedColors={colors}
                            type="anterior"
                        />
                    </div>
                </div>

                {/* Back view */}
                <div className="flex flex-col items-center gap-3 flex-1 max-w-[180px]">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase opacity-60">{t.progress.charts.heatmap.back}</p>
                    <div className="w-full aspect-[1/2.2] flex items-center justify-center p-0">
                        <Model
                            data={highlightedData}
                            style={{ width: '100%', height: '100%' }}
                            svgStyle={{ stroke: 'hsl(var(--border))', strokeWidth: 0.8 }}
                            bodyColor="hsl(var(--muted) / 0.5)"
                            highlightedColors={colors}
                            type="posterior"
                        />
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <div className="h-3 w-3 rounded-sm shadow-sm" style={{ background: colors[3] }} /> {t.progress.charts.heatmap.first} -{'>'} {uniqueVolumes[0] / 1000 > 1 ? (uniqueVolumes[0] / 1000).toFixed(1) + 't' : uniqueVolumes[0] + 'kg'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <div className="h-3 w-3 rounded-sm shadow-sm" style={{ background: colors[2] }} /> {t.progress.charts.heatmap.second} -{'>'} {uniqueVolumes[1] / 1000 > 1 ? (uniqueVolumes[1] / 1000).toFixed(1) + 't' : uniqueVolumes[1] + 'kg'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <div className="h-3 w-3 rounded-sm shadow-sm" style={{ background: colors[1] }} /> {t.progress.charts.heatmap.third} -{'>'} {uniqueVolumes[2] / 1000 > 1 ? (uniqueVolumes[2] / 1000).toFixed(1) + 't' : uniqueVolumes[2] + 'kg'}
                </div>
                {uniqueVolumes.length > 3 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <div className="h-3 w-3 rounded-sm shadow-sm" style={{ background: colors[0] }} /> {t.progress.charts.heatmap.other}
                    </div>
                )}
            </div>


        </div>
    )
}