import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext } from '@/context/AuthContext'
import RegisterPage from '@/pages/RegisterPage'

const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

function renderRegisterPage(user: any = null) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    const mockAuth = {
        user,
        loading: false,
        login: vi.fn(),
        register: mockRegister,
        logout: vi.fn(),
    }

    return render(
        <QueryClientProvider client={queryClient}>
            <AuthContext.Provider value={mockAuth}>
                <MemoryRouter initialEntries={['/register']}>
                    <RegisterPage />
                </MemoryRouter>
            </AuthContext.Provider>
        </QueryClientProvider>
    )
}

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render email, password, and confirm fields', () => {
        renderRegisterPage()

        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
    })

    it('should show error when passwords do not match', async () => {
        renderRegisterPage()

        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Email'), 'test@test.com')
        await user.type(screen.getByLabelText('Password'), 'password123')
        await user.type(screen.getByLabelText('Confirm password'), 'different')
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        await waitFor(() => {
            expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
        })

        expect(mockRegister).not.toHaveBeenCalled()
    })

    it('should show error when password is too short', async () => {
        renderRegisterPage()

        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Email'), 'test@test.com')
        await user.type(screen.getByLabelText('Password'), 'short')
        await user.type(screen.getByLabelText('Confirm password'), 'short')
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        await waitFor(() => {
            expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
        })

        expect(mockRegister).not.toHaveBeenCalled()
    })

    it('should call register on valid submit', async () => {
        mockRegister.mockResolvedValue(undefined)
        renderRegisterPage()

        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Email'), 'new@test.com')
        await user.type(screen.getByLabelText('Password'), 'password123')
        await user.type(screen.getByLabelText('Confirm password'), 'password123')
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith('new@test.com', 'password123')
        })
    })

    it('should display server error on failed register', async () => {
        mockRegister.mockRejectedValue({
            response: { data: { error: 'Email already in use' } },
        })
        renderRegisterPage()

        const user = userEvent.setup()
        await user.type(screen.getByLabelText('Email'), 'taken@test.com')
        await user.type(screen.getByLabelText('Password'), 'password123')
        await user.type(screen.getByLabelText('Confirm password'), 'password123')
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        await waitFor(() => {
            expect(screen.getByText('Email already in use')).toBeInTheDocument()
        })
    })

    it('should have a link to the login page', () => {
        renderRegisterPage()

        expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
    })
})
