import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
    useProfile,
    useUpdateProfile,
    useChangePassword,
    useDeleteAccount,
} from '@/hooks/useWorkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    User,
    Lock,
    LogOut,
    Trash2,
    ChevronRight,
    Pencil,
    Check,
    X,
    Target,
    Scale,
    Ruler,
    Calendar,
} from 'lucide-react'

// Profile page, basic informations, settings and logout

// --- Inline editable field ---
function EditableField({
    label,
    value,
    onSave,
    type = 'text',
    unit,
    icon: Icon,
    options,
}: {
    label: string
    value: string | number | null | undefined
    onSave: (val: string) => void
    type?: string
    unit?: string
    icon?: any
    options?: { value: string; label: string }[]
}) {
    const [editing, setEditing] = useState(false)
    const [input, setInput] = useState(String(value ?? ''))

    const handleSave = () => {
        onSave(input)
        setEditing(false)
    }

    const handleCancel = () => {
        setInput(String(value ?? ''))
        setEditing(false)
    }

    return (
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
                {Icon && <Icon size={16} className="text-muted-foreground shrink-0" />}
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    {editing ? (
                        options ? (
                            <div className="flex gap-2 mt-1">
                                {options.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { onSave(opt.value); setEditing(false) }}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${input === opt.value
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border hover:bg-accent'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-1">
                                <Input
                                    type={type}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="h-7 w-32 text-sm"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave()
                                        if (e.key === 'Escape') handleCancel()
                                    }}
                                />
                                {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
                                <button onClick={handleSave} className="text-primary"><Check size={14} /></button>
                                <button onClick={handleCancel} className="text-muted-foreground"><X size={14} /></button>
                            </div>
                        )
                    ) : (
                        <p className="text-sm font-medium">
                            {value ? `${value}${unit ? ` ${unit}` : ''}` : (
                                <span className="text-muted-foreground italic">Not set</span>
                            )}
                        </p>
                    )}
                </div>
            </div>
            {!editing && (
                <button
                    onClick={() => { setInput(String(value ?? '')); setEditing(true) }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Pencil size={14} />
                </button>
            )}
        </div>
    )
}

// --- Change password dialog ---
function ChangePasswordDialog({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const changePassword = useChangePassword()
    const [current, setCurrent] = useState('')
    const [next, setNext] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSave = async () => {
        setError('')
        if (next.length < 8) return setError('Password must be at least 8 characters')
        if (next !== confirm) return setError('Passwords do not match')
        try {
            await changePassword.mutateAsync({ currentPassword: current, newPassword: next })
            setSuccess(true)
            setTimeout(() => { setSuccess(false); onClose() }, 1500)
        } catch (err: any) {
            setError(err.response?.data?.error ?? 'Something went wrong')
        }
    }

    const handleClose = () => {
        setCurrent(''); setNext(''); setConfirm(''); setError(''); setSuccess(false)
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                {success ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Check size={24} className="text-primary" />
                        </div>
                        <p className="font-medium">Password updated!</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-4 py-2">
                            <div className="flex flex-col gap-1.5">
                                <Label>Current password</Label>
                                <Input type="password" value={current} onChange={e => setCurrent(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>New password</Label>
                                <Input type="password" value={next} onChange={e => setNext(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Confirm new password</Label>
                                <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleSave} disabled={changePassword.isPending}>
                                {changePassword.isPending ? 'Saving...' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

// --- Delete account dialog ---
function DeleteAccountDialog({
    open,
    onClose,
    onConfirm,
}: {
    open: boolean
    onClose: () => void
    onConfirm: (password: string) => void
}) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleConfirm = () => {
        if (!password) return setError('Please enter your password')
        setError('')
        onConfirm(password)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        This will permanently delete your account and all associated data including workouts, exercises, and progress. This action cannot be undone.
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <Label>Enter your password to confirm</Label>
                        <Input
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        Delete Everything
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// --- BMI helper ---
function getBMI(weight?: number | null, height?: number | null) {
    if (!weight || !height) return null
    const bmi = weight / Math.pow(height / 100, 2)
    return bmi.toFixed(1)
}

function getBMILabel(bmi: number) {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' }
    if (bmi < 25) return { label: 'Normal', color: 'text-green-500' }
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' }
    return { label: 'Obese', color: 'text-red-500' }
}

// --- Main page ---
export default function ProfilePage() {
    const { logout } = useAuth()
    const { data: profile, isLoading } = useProfile()
    const updateProfile = useUpdateProfile()
    const deleteAccount = useDeleteAccount()

    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const handleUpdate = (field: string) => (value: string) => {
        const numericFields = ['age', 'weight', 'height', 'weeklyGoal']
        updateProfile.mutate({
            [field]: numericFields.includes(field) ? Number(value) : value || null,
        })
    }

    const handleDeleteAccount = async (password: string) => {
        try {
            await deleteAccount.mutateAsync(password)
            logout()
        } catch (err: any) {
            alert(err.response?.data?.error ?? 'Something went wrong')
        }
    }

    const bmi = getBMI(profile?.weight, profile?.height)
    const bmiInfo = bmi ? getBMILabel(Number(bmi)) : null

    if (isLoading) return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
        </div>
    )

    return (
        <div className="flex flex-col gap-6 px-4 py-6 pb-24">
            {/* Avatar + name header */}
            <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                    {profile?.name ? profile.name[0].toUpperCase() : profile?.email[0].toUpperCase()}
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold">{profile?.name ?? 'No name set'}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
                {/* Member since */}
                <p className="text-xs text-muted-foreground">
                    Member since {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
            </div>

            {/* BMI card */}
            {bmi && bmiInfo && (
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">BMI</p>
                        <p className="text-2xl font-bold">{bmi}</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-semibold ${bmiInfo.color}`}>{bmiInfo.label}</p>
                        <p className="text-xs text-muted-foreground">{profile?.weight}kg · {profile?.height}cm</p>
                    </div>
                </div>
            )}

            {/* Personal info */}
            <section className="rounded-xl border border-border bg-card px-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-4 pb-2">
                    Personal Info
                </p>
                <EditableField
                    label="Name"
                    value={profile?.name}
                    onSave={handleUpdate('name')}
                    icon={User}
                />
                <EditableField
                    label="Age"
                    value={profile?.age}
                    onSave={handleUpdate('age')}
                    type="number"
                    unit="years"
                    icon={Calendar}
                />
                <EditableField
                    label="Sex"
                    value={profile?.sex}
                    onSave={handleUpdate('sex')}
                    icon={User}
                    options={[
                        { value: 'MALE', label: 'Male' },
                        { value: 'FEMALE', label: 'Female' },
                        { value: 'OTHER', label: 'Other' },
                    ]}
                />
                <EditableField
                    label="Weight (kg)"
                    value={profile?.weight}
                    onSave={handleUpdate('weight')}
                    type="number"
                    unit="kg"
                    icon={Scale}
                />
                <EditableField
                    label="Height (cm)"
                    value={profile?.height}
                    onSave={handleUpdate('height')}
                    type="number"
                    unit="cm"
                    icon={Ruler}
                />
            </section>

            {/* Training preferences */}
            <section className="rounded-xl border border-border bg-card px-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-4 pb-2">
                    Training
                </p>
                <EditableField
                    label="Weekly Goal"
                    value={profile?.weeklyGoal}
                    onSave={(val) => {
                        const clamped = Math.min(Math.max(Number(val), 1), 7)
                        handleUpdate('weeklyGoal')(String(clamped))
                    }}
                    type="number"
                    unit="workouts / week"
                    icon={Target}
                />
            </section>

            {/* Account actions */}
            <section className="rounded-xl border border-border bg-card overflow-hidden">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-4 pb-2">
                    Account
                </p>
                <button
                    onClick={() => setPasswordDialogOpen(true)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-accent transition-colors"
                >
                    <Lock size={16} className="text-muted-foreground" />
                    <span className="text-sm flex-1 text-left">Change Password</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-accent transition-colors"
                >
                    <LogOut size={16} className="text-muted-foreground" />
                    <span className="text-sm flex-1 text-left">Log Out</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <button
                    onClick={() => setDeleteDialogOpen(true)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors"
                >
                    <Trash2 size={16} className="text-destructive" />
                    <span className="text-sm flex-1 text-left text-destructive">Delete Account</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>
            </section>

            <ChangePasswordDialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
            />

            <DeleteAccountDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteAccount}
            />

            {/* Version number */}
            <div className="mt-8 text-center">
                <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em]">
                    MutantMass v0.1.0-beta
                </p>
            </div>
        </div>
    )
}