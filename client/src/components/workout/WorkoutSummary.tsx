import { useEffect } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Dumbbell, Clock, Trophy, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useExerciseStats } from '@/hooks/useWorkout'
import ExerciseImage from './ExerciseImage'

interface Set {
    id: string
    reps?: number | null
    weight?: number | null
    duration?: number | null
    distance?: number | null
    isUnilateral?: boolean | null
}

interface WorkoutExercise {
    id: string
    exercise: {
        id: string
        name: string
        type: 'WEIGHTED' | 'BODYWEIGHT' | 'CARDIO'
        imageUrl?: string | null
    }
    sets: Set[]
}

interface Workout {
    id: string
    name?: string | null
    duration?: number | null
    restTimer?: number | null
    date: string
    workoutExercises: WorkoutExercise[]
    note?: string | null
}

interface Props {
    workout: Workout
    onDone: () => void
}

function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

function getTotalVolume(exercises: WorkoutExercise[]) {
    return exercises.reduce((total, we) => {
        return total + we.sets.reduce((setTotal, set) => {
            if (set.weight && set.reps) return setTotal + set.weight * set.reps * (set.isUnilateral ? 2 : 1)
            return setTotal
        }, 0)
    }, 0)
}

function getTotalSets(exercises: WorkoutExercise[]) {
    return exercises.reduce((total, we) => total + we.sets.length, 0)
}

function getBestSet(sets: Set[], type: string) {
    if (sets.length === 0) return null

    return sets.reduce((best, set) => {
        if (!best) return set

        if (type === 'WEIGHTED') {
            const currentVol = (set.weight && set.reps) ? set.weight * set.reps * (set.isUnilateral ? 2 : 1) : 0
            const bestVol = (best.weight && best.reps) ? best.weight * best.reps * (best.isUnilateral ? 2 : 1) : 0
            return currentVol > bestVol ? set : best
        } else if (type === 'BODYWEIGHT') {
            return ((set.reps ?? 0) * (set.isUnilateral ? 2 : 1)) > ((best.reps ?? 0) * (best.isUnilateral ? 2 : 1)) ? set : best
        } else if (type === 'CARDIO') {
            const currentDist = set.distance ?? 0; const bestDist = best.distance ?? 0;
            if (currentDist > bestDist) return set
            if (currentDist === bestDist && (set.duration ?? 0) > (best.duration ?? 0)) return set
            return best
        }

        return best
    }, sets[0])
}

function WorkoutSummaryExerciseCard({ we, t, workoutId }: { we: WorkoutExercise, t: any, workoutId: string }) {
    const { data: rawStats = [] } = useExerciseStats(we.exercise.id, 'all')
    const bestSet = getBestSet(we.sets, we.exercise.type)
    const exerciseVolume = we.sets.reduce((total, set) => {
        if (set.weight && set.reps) return total + set.weight * set.reps * (set.isUnilateral ? 2 : 1)
        return total
    }, 0)
    const totalReps = we.sets.reduce((total, set) => total + ((set.reps || 0) * (set.isUnilateral ? 2 : 1)), 0)

    const currentKgPerRep = (exerciseVolume > 0 && totalReps > 0) ? parseFloat((exerciseVolume / totalReps).toFixed(1)) : null
    
    let prevStat = null
    if (rawStats.length > 0) {
        const lastStat = rawStats[rawStats.length - 1]
        if (lastStat.workoutId === workoutId) {
            prevStat = rawStats.length > 1 ? rawStats[rawStats.length - 2] : null
        } else {
            prevStat = lastStat
        }
    }

    const prevKgPerRep = (prevStat && prevStat.volume > 0 && prevStat.totalReps > 0) 
        ? parseFloat((prevStat.volume / prevStat.totalReps).toFixed(1)) 
        : null

    const kgPerRepDiff = (currentKgPerRep !== null && prevKgPerRep !== null) 
        ? parseFloat((currentKgPerRep - prevKgPerRep).toFixed(1)) 
        : null
    
    let bestSetDiff: number | null = null;
    let bestSetDiffMetric = '';

    if (we.exercise.type === 'WEIGHTED') {
        const prevBestVolume = (prevStat?.bestWeight && prevStat?.bestReps) ? (prevStat.bestWeight * prevStat.bestReps * (prevStat.isUnilateral ? 2 : 1)) : null
        const currentBestVolume = (bestSet?.weight && bestSet?.reps) ? (bestSet.weight * bestSet.reps * (bestSet.isUnilateral ? 2 : 1)) : null
        if (currentBestVolume !== null && prevBestVolume !== null) {
            bestSetDiff = parseFloat((currentBestVolume - prevBestVolume).toFixed(1))
        }
    } else if (we.exercise.type === 'BODYWEIGHT') {
        const prevReps = prevStat?.bestReps ? (prevStat.bestReps * (prevStat.isUnilateral ? 2 : 1)) : null
        const currentReps = bestSet?.reps ? (bestSet.reps * (bestSet.isUnilateral ? 2 : 1)) : null
        if (currentReps !== null && prevReps !== null) {
            bestSetDiff = currentReps - prevReps
        }
    } else if (we.exercise.type === 'CARDIO') {
        const prevDist = prevStat?.bestDistance ?? null
        const currentDist = bestSet?.distance ?? null
        const prevDur = prevStat?.bestDuration ?? null
        const currentDur = bestSet?.duration ?? null

        if (currentDist !== null || prevDist !== null) {
            if ((currentDist ?? 0) !== (prevDist ?? 0)) {
                bestSetDiff = parseFloat(((currentDist ?? 0) - (prevDist ?? 0)).toFixed(2))
                bestSetDiffMetric = 'distance'
            } else if (currentDur !== null && prevDur !== null && currentDur !== prevDur) {
                bestSetDiff = Math.floor((currentDur - prevDur) / 60)
                bestSetDiffMetric = 'duration'
            }
        } else if (currentDur !== null && prevDur !== null && currentDur !== prevDur) {
            bestSetDiff = Math.floor((currentDur - prevDur) / 60)
            bestSetDiffMetric = 'duration'
        }
    }

    return (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            {/* Exercise header */}
            <div className="flex items-center gap-3">
                <ExerciseImage imageUrl={we.exercise.imageUrl} name={we.exercise.name} size="md" zoomable />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{we.exercise.name}</p>
                    <div className="flex flex-wrap gap-x-1.5 text-xs text-muted-foreground items-center mt-0.5">
                        <span>
                            {we.sets.length} {we.sets.length !== 1 ? t.workout.summary.sets : t.workout.summary.set}
                            {exerciseVolume > 0 && ` · ${exerciseVolume.toLocaleString()} kg`}
                        </span>
                        {currentKgPerRep !== null && (
                            <span className="flex items-center gap-1">
                                · {currentKgPerRep} kg/rep
                                {kgPerRepDiff !== null && kgPerRepDiff !== 0 && (
                                    <span className={`text-[10px] flex items-center bg-card shadow-sm px-1 py-0.5 rounded ${kgPerRepDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        ({kgPerRepDiff > 0 ? '+' : ''}{kgPerRepDiff})
                                        {kgPerRepDiff > 0 ? <TrendingUp size={10} className="ml-0.5" /> : <TrendingDown size={10} className="ml-0.5" />}
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Sets table */}
            <div className="flex flex-col gap-1">
                <div className="grid grid-cols-[2rem_1fr_1fr] gap-2 px-1">
                    <span className="text-xs text-muted-foreground text-center">#</span>
                    {we.exercise.type === 'WEIGHTED' && (
                        <>
                            <span className="text-xs text-muted-foreground text-center">{t.common.units.reps}</span>
                            <span className="text-xs text-muted-foreground text-center">{t.common.units.kg}</span>
                        </>
                    )}
                    {we.exercise.type === 'BODYWEIGHT' && (
                        <>
                            <span className="text-xs text-muted-foreground text-center">{t.common.units.reps}</span>
                            <span className="text-xs text-muted-foreground text-center" />
                        </>
                    )}
                    {we.exercise.type === 'CARDIO' && (
                        <>
                            <span className="text-xs text-muted-foreground text-center">{t.workout.setLogger.time}</span>
                            <span className="text-xs text-muted-foreground text-center">{t.common.units.km}</span>
                        </>
                    )}
                </div>
                {we.sets.map((set, index) => (
                    <div
                        key={set.id}
                        className="grid grid-cols-[2rem_1fr_1fr] gap-2 items-center px-1 py-1.5 rounded-lg bg-muted/40"
                    >
                        <span className="text-sm text-muted-foreground text-center">
                            {index + 1}
                            {set.isUnilateral && <span className="text-[10px] ml-1 text-primary">{t.workout.setLogger.unilateralBadge}</span>}
                        </span>
                        {we.exercise.type === 'WEIGHTED' && (
                            <>
                                <span className="text-sm text-center font-medium">{set.reps}</span>
                                <span className="text-sm text-center font-medium">{set.weight}</span>
                            </>
                        )}
                        {we.exercise.type === 'BODYWEIGHT' && (
                            <>
                                <span className="text-sm text-center font-medium">{set.reps}</span>
                                <span />
                            </>
                        )}
                        {we.exercise.type === 'CARDIO' && (
                            <>
                                <span className="text-sm text-center font-medium">
                                    {set.duration ? `${Math.floor(set.duration / 60)}m` : '-'}
                                </span>
                                <span className="text-sm text-center font-medium">
                                    {set.distance ?? '-'}
                                </span>
                            </>
                        )}
                    </div>
                ))}

                {/* Best set highlight for all types */}
                {bestSet && (
                    <div className="flex justify-between items-center mt-1 px-1">
                        <p className="text-xs text-primary font-medium">
                            {t.workout.summary.bestSetPart1}
                            {we.exercise.type === 'WEIGHTED' && `${bestSet.reps}${t.workout.summary.bestSetPart2}${bestSet.weight}${t.workout.summary.bestSetPart3}`}
                            {we.exercise.type === 'BODYWEIGHT' && `${bestSet.reps} ${t.common.units.reps}`}
                            {we.exercise.type === 'CARDIO' && `${bestSet.distance ? `${bestSet.distance}${t.common.units.km}` : ''}${bestSet.distance && bestSet.duration ? ' · ' : ''}${bestSet.duration ? `${Math.floor(bestSet.duration / 60)}${t.common.units.m}` : ''}`}
                        </p>
                        {bestSetDiff !== null && bestSetDiff !== 0 && (
                            <span className={`text-[11px] flex items-center font-bold pb-0.5 ${bestSetDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {bestSetDiff > 0 ? '+' : ''}{bestSetDiff}
                                {we.exercise.type === 'WEIGHTED' ? 'kg' : we.exercise.type === 'BODYWEIGHT' ? ` ${t.common.units.reps}` : we.exercise.type === 'CARDIO' ? (bestSetDiffMetric === 'distance' ? t.common.units.km : t.common.units.m) : ''}
                                {bestSetDiff > 0 ? <TrendingUp size={12} className="ml-0.5" /> : <TrendingDown size={12} className="ml-0.5" />}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function WorkoutSummary({ workout, onDone }: Props) {
    const { t } = useTranslation()

    useEffect(() => {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#7c3aed', '#ffffff', '#fbbf24'],
        })
    }, [])

    const totalVolume = getTotalVolume(workout.workoutExercises)
    const totalSets = getTotalSets(workout.workoutExercises)

    return (
        <div className="flex flex-col gap-6 px-4 py-8 pb-24">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-5xl mb-2">🎉</div>
                <h1 className="text-2xl font-bold">{t.workout.summary.title}</h1>
                <p className="text-muted-foreground">
                    {workout.name ?? t.workout.summary.greatSession}
                </p>
            </div>

            {/* Stats row */}
            <div className={`grid gap-3 ${workout.restTimer ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
                    <Clock size={16} className="text-primary" />
                    <span className="text-base font-bold whitespace-nowrap">
                        {workout.duration ? formatDuration(workout.duration) : '-'}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t.workout.summary.duration}</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
                    <Trophy size={16} className="text-primary" />
                    <span className="text-base font-bold">{totalSets}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t.workout.summary.setsLabel}</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
                    <Dumbbell size={16} className="text-primary" />
                    <span className="text-base font-bold">
                        {totalVolume > 0 ? `${totalVolume.toLocaleString()}` : '-'}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        {totalVolume > 0 ? t.workout.summary.kgVolume : t.workout.summary.volume}
                    </span>
                </div>
                {workout.restTimer && (
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
                        <Clock size={16} className="text-primary rotate-12" />
                        <span className="text-base font-bold">{workout.restTimer}s</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t.workout.summary.rest}</span>
                    </div>
                )}
            </div>

            {/* Notes section */}
            {workout.note && (
                <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{t.workout.summary.sessionNote}</p>
                    <p className="text-sm">{workout.note}</p>
                </div>
            )}

            {/* Exercise breakdown */}
            <div className="flex flex-col gap-3">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {t.workout.summary.breakdown}
                </h2>
                {workout.workoutExercises.map((we) => (
                    <WorkoutSummaryExerciseCard key={we.id} we={we} t={t} workoutId={workout.id} />
                ))}
            </div>

            {/* Done button */}
            <Button size="lg" className="w-full" onClick={onDone}>
                {t.workout.summary.done}
                <ChevronRight size={18} className="ml-1" />
            </Button>
        </div>
    )
}