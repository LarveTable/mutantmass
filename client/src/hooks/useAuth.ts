import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// Just a wrapper around the AuthContext, makes it easier to use the context : useAuth() instead of useContext(AuthContext)
// Also throws an error if the context is not used within the AuthProvider
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}