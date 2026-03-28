import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useActiveWorkoutState } from '@/hooks/useActiveWorkoutState'

// Mock localStorage for consistent test behavior
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value }),
        removeItem: vi.fn((key: string) => { delete store[key] }),
        clear: vi.fn(() => { store = {} }),
    }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('useActiveWorkoutState', () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()
    })

    it('should return null workoutId when no workout is active', () => {
        const { result } = renderHook(() => useActiveWorkoutState())

        expect(result.current.workoutId).toBeNull()
    })

    it('startWorkout() should store ID in localStorage and state', () => {
        const { result } = renderHook(() => useActiveWorkoutState())

        act(() => {
            result.current.startWorkout('w-123')
        })

        expect(result.current.workoutId).toBe('w-123')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('activeWorkoutId', 'w-123')
        expect(result.current.startTime).toBeGreaterThan(0)
    })

    it('endWorkout() should clear localStorage and state', () => {
        const { result } = renderHook(() => useActiveWorkoutState())

        act(() => {
            result.current.startWorkout('w-123')
        })

        expect(result.current.workoutId).toBe('w-123')

        act(() => {
            result.current.endWorkout()
        })

        expect(result.current.workoutId).toBeNull()
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeWorkoutId')
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeWorkoutStartTime')
    })

    it('should restore workout ID from localStorage on mount', () => {
        localStorageMock.getItem.mockImplementation(((key: string) => {
            if (key === 'activeWorkoutId') return 'w-saved'
            if (key === 'activeWorkoutStartTime') return String(Date.now() - 5000)
            return null
        }) as any)

        const { result } = renderHook(() => useActiveWorkoutState())

        expect(result.current.workoutId).toBe('w-saved')
        expect(result.current.startTime).toBeGreaterThan(0)
    })
})

