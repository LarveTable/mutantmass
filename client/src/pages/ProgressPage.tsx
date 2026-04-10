import { useState } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import PeriodSelector from '@/components/progress/PeriodSelector'
import OverviewStrip from '@/components/progress/OverviewStrip'
import VolumeChart from '@/components/progress/VolumeChart'
import ExerciseProgress from '@/components/progress/ExerciseProgress'
import PersonalRecords from '@/components/progress/PersonalRecords'
import BodyHeatmap from '@/components/progress/BodyHeatmap'
import ConsistencyTracker from '@/components/progress/ConsistencyTracker'

// Page to display the progress of the user

export default function ProgressPage() {
    const { t } = useTranslation()
    const [period, setPeriod] = useState('month')

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 px-4 py-6 pb-24 max-w-7xl mx-auto w-full">
            <div className="md:col-span-12 flex flex-col gap-4">
                <div className="flex items-center justify-between shadow-sm">
                    <h1 className="text-2xl font-bold tracking-tight">{t.progress.title}</h1>
                </div>
                <PeriodSelector value={period} onChange={setPeriod} />
            </div>

            {/* Overview */}
            <section className="md:col-span-12">
                <OverviewStrip period={period} />
            </section>

            {/* Muscle heatmap - HIGHER UP */}
            <section className="flex flex-col gap-3 md:col-span-6 lg:col-span-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t.progress.sections.muscleGroups}
                </h2>
                <div className="rounded-xl border border-border bg-card p-4 h-full flex items-center justify-center">
                    <BodyHeatmap period={period} />
                </div>
            </section>

            {/* Volume over time */}
            <section className="flex flex-col gap-3 md:col-span-6 lg:col-span-7">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t.progress.sections.volume}
                </h2>
                <div className="rounded-xl border border-border bg-card p-4 h-full min-h-[300px]">
                    <VolumeChart period={period} />
                </div>
            </section>

            {/* Exercise progress */}
            <section className="flex flex-col gap-3 md:col-span-12 lg:col-span-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t.progress.sections.exercises}
                </h2>
                <div className="rounded-xl border border-border bg-card p-4 h-full min-h-[300px]">
                    <ExerciseProgress period={period} />
                </div>
            </section>

            {/* Personal records */}
            <section className="flex flex-col gap-3 md:col-span-12 lg:col-span-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t.progress.sections.records.title}
                </h2>
                {/* Make this wrapper relative and take up remaining space */}
                <div className="flex-1 relative">
                    {/* On desktop, absolute positioning removes it from grid height calculation */}
                    <div className="lg:absolute lg:inset-0 w-full h-full">
                        <PersonalRecords />
                    </div>
                </div>
            </section>

            {/* Consistency */}
            <section className="flex flex-col gap-3 md:col-span-12">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t.progress.sections.consistency}
                </h2>
                <div className="h-full">
                    <ConsistencyTracker />
                </div>
            </section>
        </div>
    )
}