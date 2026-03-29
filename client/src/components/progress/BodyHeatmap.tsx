import { useMuscleStats } from '@/hooks/useWorkout'
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
    const { data = {}, isLoading } = useMuscleStats(period)

    if (isLoading) return (
        <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
    )

    const rawData = data as Record<string, number>
    // Get unique volumes sorted descending to determine ranks
    const uniqueVolumes = Array.from(new Set(Object.values(rawData).filter((v) => v > 0))).sort((a, b) => b - a)

    // Map volume to a frequency bucket based on actual rank (1st, 2nd, 3rd, Rest)
    function getRankBucket(volume: number): number {
        if (volume === 0) return 0
        const index = uniqueVolumes.indexOf(volume)
        if (index === 0) return 4 // 1st Place
        if (index === 1) return 3 // 2nd Place
        if (index === 2) return 2 // 3rd Place
        return 1 // 4th+ Place
    }

    const highlightedData: IExerciseData[] = Object.entries(rawData)
        .map(([muscle, volume]) => {
            const bucket = getRankBucket(volume)
            if (bucket === 0 || !PRISMA_TO_BODY_HIGHLIGHTER[muscle]) return null
            return {
                name: muscle,
                muscles: PRISMA_TO_BODY_HIGHLIGHTER[muscle],
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
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {/* Front view */}
                <div className="flex flex-col items-center gap-2">
                    <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Front</p>
                    <div className="w-[140px] aspect-[1/2] px-2 svg-container flex items-start justify-center overflow-hidden">
                        <Model
                            data={highlightedData}
                            style={{ width: '100%', fill: 'hsl(var(--muted))' }}
                            svgStyle={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                            bodyColor="hsl(var(--muted))"
                            highlightedColors={colors}
                            type="anterior"
                        />
                    </div>
                </div>

                {/* Back view */}
                <div className="flex flex-col items-center gap-2">
                    <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Back</p>
                    <div className="w-[140px] aspect-[1/2] px-2 svg-container flex items-start justify-center overflow-hidden">
                        <Model
                            data={highlightedData}
                            style={{ width: '100%', fill: 'hsl(var(--muted))' }}
                            svgStyle={{ stroke: 'hsl(var(--border))', strokeWidth: 1, transform: 'scale(0.92) translateY(-4%)' }}
                            bodyColor="hsl(var(--muted))"
                            highlightedColors={colors}
                            type="posterior"
                        />
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <div className="h-3 w-3 rounded-sm shadow-sm" style={{ background: colors[3] }} /> 1st
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <div className="h-3 w-3 rounded-sm shadow-sm" style={{ background: colors[2] }} /> 2nd
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <div className="h-3 w-3 rounded-sm shadow-sm" style={{ background: colors[1] }} /> 3rd
                </div>
                {uniqueVolumes.length > 3 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <div className="h-3 w-3 rounded-sm shadow-sm" style={{ background: colors[0] }} /> Other
                    </div>
                )}
            </div>


        </div>
    )
}