import { useState } from 'react'
import PeriodSelector from '@/components/progress/PeriodSelector'
import OverviewStrip from '@/components/progress/OverviewStrip'
import VolumeChart from '@/components/progress/VolumeChart'
import ExerciseProgress from '@/components/progress/ExerciseProgress'
import PersonalRecords from '@/components/progress/PersonalRecords'
import BodyHeatmap from '@/components/progress/BodyHeatmap'
import FrequencyHeatmap from '@/components/progress/FrequencyHeatmap'
import ConsistencyTracker from '@/components/progress/ConsistencyTracker'

// Page to display the progress of the user

export default function ProgressPage() {
    const [period, setPeriod] = useState('month')

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 px-4 py-6 pb-24 max-w-7xl mx-auto w-full">
            <div className="md:col-span-12 flex flex-col gap-4">
                <div className="flex items-center justify-between shadow-sm">
                    <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
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
                    Muscle Groups
                </h2>
                <div className="rounded-xl border border-border bg-card p-4 h-full flex items-center justify-center">
                    <BodyHeatmap period={period} />
                </div>
            </section>

            {/* Volume over time */}
            <section className="flex flex-col gap-3 md:col-span-6 lg:col-span-7">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Volume Over Time
                </h2>
                <div className="rounded-xl border border-border bg-card p-4 h-full min-h-[300px]">
                    <VolumeChart period={period} />
                </div>
            </section>

            {/* Consistency */}
            <section className="flex flex-col gap-3 md:col-span-12 lg:col-span-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Consistency
                </h2>
                <div className="h-full">
                    <ConsistencyTracker />
                </div>
            </section>

            {/* Workout Frequency */}
            <section className="flex flex-col gap-3 md:col-span-12 lg:col-span-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Workout Frequency
                </h2>
                <div className="rounded-xl border border-border bg-card p-4 overflow-hidden h-full">
                    <FrequencyHeatmap />
                </div>
            </section>

            {/* Exercise progress */}
            <section className="flex flex-col gap-3 md:col-span-12 lg:col-span-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Exercise Progress
                </h2>
                <div className="rounded-xl border border-border bg-card p-4 h-full min-h-[300px]">
                    <ExerciseProgress period={period} />
                </div>
            </section>

            {/* Personal records */}
            <section className="flex flex-col gap-3 md:col-span-12 lg:col-span-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Personal Records
                </h2>
                <div className="h-full">
                    <PersonalRecords />
                </div>
            </section>
        </div>
    )
}