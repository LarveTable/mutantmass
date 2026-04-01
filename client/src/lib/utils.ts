import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDefaultWorkoutName(exercises: { muscleGroup?: string }[]): string {
    if (!exercises || exercises.length === 0) return "Empty Workout"
    
    let pushCount = 0
    let pullCount = 0
    let legCount = 0
    let cardioCount = 0
    let coreCount = 0
    let fullBodyCount = 0
    
    for (const ex of exercises) {
        const mg = ex.muscleGroup?.toUpperCase()
        if (!mg) continue
        
        if (["CHEST", "SHOULDERS", "TRICEPS"].includes(mg)) pushCount++
        else if (["BACK", "BICEPS", "FOREARMS"].includes(mg)) pullCount++
        else if (["LEGS", "GLUTES"].includes(mg)) legCount++
        else if (mg === "CORE") coreCount++
        else if (mg === "FULL_BODY") fullBodyCount++
        else if (mg === "CARDIO") cardioCount++
    }
    
    const counts = [
        { name: "Push Day", count: pushCount },
        { name: "Pull Day", count: pullCount },
        { name: "Leg Day", count: legCount },
        { name: "Cardio", count: cardioCount },
        { name: "Core Day", count: coreCount },
        { name: "Full Body Day", count: fullBodyCount }
    ]
    
    let max = -1
    let tops: string[] = []
    
    for (const c of counts) {
        if (c.count > max) {
            max = c.count
            tops = [c.name]
        } else if (c.count === max && c.count > 0) {
            tops.push(c.name)
        }
    }
    
    if (max === 0 || tops.length > 1) return "Mixed Day"
    
    return tops[0]
}
