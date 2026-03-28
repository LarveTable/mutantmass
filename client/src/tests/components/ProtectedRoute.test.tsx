import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthContext } from '@/context/AuthContext'

// Mock useAuth indirectly by providing AuthContext values directly

function renderWithAuth(user: any, loading: boolean) {
    const mockAuth = {
        user,
        loading,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
    }

    return render(
        <AuthContext.Provider value={mockAuth}>
            <MemoryRouter initialEntries={['/dashboard']}>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

describe('ProtectedRoute', () => {
    it('should render children when user is authenticated', () => {
        renderWithAuth({ id: 'u1', email: 'test@test.com' }, false)

        expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should redirect to /login when user is null', () => {
        renderWithAuth(null, false)

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should show loading state while auth is checking', () => {
        renderWithAuth(null, true)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
})
