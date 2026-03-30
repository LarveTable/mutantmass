import { usePRs } from '@/hooks/useWorkout'
import { Trophy } from 'lucide-react'

// Component to display personal records

export default function PersonalRecords() {
    const { data: prs = [], isLoading } = usePRs()

    if (isLoading) return (
        <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
    )

    if (prs.length === 0) return (
        <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">No PRs yet — start lifting!</p>
        </div>
    )

    const sortedPrs = [...prs].sort((a: any, b: any) => {
        const scoreA = a.type === 'WEIGHTED' ? (a.estimatedOneRM || 0) :
                       a.type === 'BODYWEIGHT' ? (a.bestReps || 0) :
                       (a.bestDistance || a.bestDuration || 0)
        
        const scoreB = b.type === 'WEIGHTED' ? (b.estimatedOneRM || 0) :
                       b.type === 'BODYWEIGHT' ? (b.bestReps || 0) :
                       (b.bestDistance || b.bestDuration || 0)
        
        return scoreB - scoreA
    })

    return (
        <div className="flex flex-col gap-2 overflow-y-auto h-full max-h-[500px] lg:max-h-none pr-2 custom-scrollbar transition-all">
            {sortedPrs.map((pr: any, index: number) => {
                const isWeighted = pr.type === 'WEIGHTED'
                const isBodyweight = pr.type === 'BODYWEIGHT'
                const isCardio = pr.type === 'CARDIO'

                return (
                    <div
                        key={pr.exerciseId}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                    >
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            index === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                                index === 2 ? 'bg-amber-700/20 text-amber-700' :
                                    'bg-muted text-muted-foreground'
                            }`}>
                            {index < 3 ? <Trophy size={14} /> : index + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{pr.exerciseName}</p>
                            <p className="text-xs text-muted-foreground">
                                {isWeighted && `${pr.bestWeight}kg × ${pr.bestReps} reps`}
                                {isBodyweight && `${pr.bestReps} reps`}
                                {isCardio && (
                                    pr.bestDistance
                                        ? `${pr.bestDistance} km ${pr.bestDuration ? `in ${Math.floor(pr.bestDuration / 60)}m` : ''}`
                                        : `${Math.floor(pr.bestDuration / 60)} min`
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                                {isWeighted && `${pr.estimatedOneRM}kg`}
                                {isBodyweight && `${pr.bestReps} reps`}
                                {isCardio && (pr.bestDistance ? `${pr.bestDistance}km` : `${Math.floor(pr.bestDuration / 60)}m`)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isWeighted ? 'e1RM' : isBodyweight ? 'Max Reps' : 'Best'}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}