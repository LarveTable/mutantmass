import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddExerciseDialog from '@/components/workout/AddExerciseDialog'
import api from '@/api/axios'

vi.mock('@/api/axios', () => ({
    default: {
        post: vi.fn(),
    }
}))

const mockInvalidateQueries = vi.fn()
vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries })
}))

describe('AddExerciseDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should submit correctly with multiple target muscles selected', async () => {
        const user = userEvent.setup()
        
        render(<AddExerciseDialog open={true} onClose={vi.fn()} />)

        // Type the name
        const nameInput = screen.getByPlaceholderText('e.g. Cable Lateral Raise')
        await user.type(nameInput, 'Cable Rows')

        // Select the Back muscle group (Chest is default, so click Back)
        const backBtn = screen.getByText('Back')
        await user.click(backBtn)

        // The target muscles should appear because BACK has ['trapezius', 'upper-back', 'lower-back']
        // We look for the transformed text labels
        const upperBackBtn = await screen.findByText('upper back')
        const trapBtn = await screen.findByText('trapezius')
        
        // Select both of them
        await user.click(upperBackBtn)
        await user.click(trapBtn)

        // Both should now be active correctly via toggle state
        expect(upperBackBtn).toHaveClass('bg-primary')
        expect(trapBtn).toHaveClass('bg-primary')

        // Click create
        const createBtn = screen.getByText(/add exercise/i)
        await user.click(createBtn)

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledTimes(1)
        })

        // Inspect the FormData payload sent to api.post
        const callArgs = vi.mocked(api.post).mock.calls[0]
        const formData = callArgs[1] as FormData
        
        expect(formData.get('name')).toBe('Cable Rows')
        expect(formData.get('type')).toBe('WEIGHTED')
        expect(formData.get('muscleGroup')).toBe('BACK')
        
        // TargetMuscle should be the stringified JSON array containing both
        const targetString = formData.get('targetMuscle') as string
        const parsedTargets = JSON.parse(targetString)
        expect(parsedTargets).toEqual(['upper-back', 'trapezius'])
        
        // Should invalidate exercises after success
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['exercises'] })
    })

    it('should allow deselecting a target muscle', async () => {
        const user = userEvent.setup()
        
        render(<AddExerciseDialog open={true} onClose={vi.fn()} />)

        const nameInput = screen.getByPlaceholderText('e.g. Cable Lateral Raise')
        await user.type(nameInput, 'Cable Rows')

        const backBtn = screen.getByText('Back')
        await user.click(backBtn)

        const trapBtn = await screen.findByText('trapezius')
        
        // Click on, then off
        await user.click(trapBtn)
        expect(trapBtn).toHaveClass('bg-primary') // Toggled ON
        
        await user.click(trapBtn)
        expect(trapBtn).not.toHaveClass('bg-primary') // Toggled OFF

        const createBtn = screen.getByText(/add exercise/i)
        await user.click(createBtn)

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledTimes(1)
        })

        const callArgs = vi.mocked(api.post).mock.calls[0]
        const formData = callArgs[1] as FormData
        
        // Since it's deselected (empty array), the key shouldn't even be appended to FormData!
        expect(formData.get('targetMuscle')).toBeNull()
    })
})
