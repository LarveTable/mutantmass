import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/context/LanguageContext'
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
    DialogDescription,
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
    Globe,
} from 'lucide-react'
import { LanguageDialog } from '@/components/LanguageSelector'

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
    const { t } = useTranslation()
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
                                <span className="text-muted-foreground italic">{t.profile.common.notSet}</span>
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
    const { t } = useTranslation()
    const changePassword = useChangePassword()
    const [current, setCurrent] = useState('')
    const [next, setNext] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSave = async () => {
        setError('')
        if (next.length < 8) return setError(t.profile.changePassword.errorMinChars)
        if (next !== confirm) return setError(t.profile.changePassword.errorMatch)
        try {
            await changePassword.mutateAsync({ currentPassword: current, newPassword: next })
            setSuccess(true)
            setTimeout(() => { setSuccess(false); onClose() }, 1500)
        } catch (err: any) {
            setError(err.response?.data?.error ?? t.profile.common.error)
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
                    <DialogTitle>{t.profile.changePassword.title}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                {success ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Check size={24} className="text-primary" />
                        </div>
                        <p className="font-medium">{t.profile.changePassword.success}</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-4 py-2">
                            <div className="flex flex-col gap-1.5">
                                <Label>{t.profile.changePassword.currentPassword}</Label>
                                <Input type="password" value={current} onChange={e => setCurrent(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>{t.profile.changePassword.newPassword}</Label>
                                <Input type="password" value={next} onChange={e => setNext(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>{t.profile.changePassword.confirmPassword}</Label>
                                <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>{t.profile.common.cancel}</Button>
                            <Button onClick={handleSave} disabled={changePassword.isPending}>
                                {changePassword.isPending ? t.profile.common.saving : t.profile.common.update}
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
    const { t } = useTranslation()
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleConfirm = () => {
        if (!password) return setError(t.profile.deleteDialog.errorPassword)
        setError('')
        onConfirm(password)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-destructive">{t.profile.deleteDialog.title}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        {t.profile.deleteDialog.description}
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <Label>{t.profile.deleteDialog.confirmLabel}</Label>
                        <Input
                            type="password"
                            placeholder={t.profile.deleteDialog.placeholder}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>{t.profile.deleteDialog.cancel}</Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        {t.profile.deleteDialog.confirm}
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

function getBMILabel(bmi: number, t: any) {
    if (bmi < 18.5) return { label: t.profile.bmi.underweight, color: 'text-blue-400' }
    if (bmi < 25) return { label: t.profile.bmi.normal, color: 'text-green-500' }
    if (bmi < 30) return { label: t.profile.bmi.overweight, color: 'text-yellow-500' }
    return { label: t.profile.bmi.obese, color: 'text-red-500' }
}

// --- Main page ---
export default function ProfilePage() {
    const { logout } = useAuth()
    const { data: profile, isLoading } = useProfile()
    const updateProfile = useUpdateProfile()
    const deleteAccount = useDeleteAccount()
    const { t, lang, availableLanguages } = useTranslation()

    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [languageDialogOpen, setLanguageDialogOpen] = useState(false)

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
            alert(err.response?.data?.error ?? t.profile.common.error)
        }
    }

    const bmi = getBMI(profile?.weight, profile?.height)
    const bmiInfo = bmi ? getBMILabel(Number(bmi), t) : null

    if (isLoading) return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <p className="text-muted-foreground">{t.profile.common.loading}</p>
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
                    <p className="text-lg font-bold">{profile?.name ?? t.profile.personalInfo.noName}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
                {/* Member since */}
                <p className="text-xs text-muted-foreground">
                    {t.profile.personalInfo.memberSince} {new Date(profile?.createdAt).toLocaleDateString(lang, {
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
            </div>

            {/* BMI card */}
            {bmi && bmiInfo && (
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">{t.profile.bmi.title}</p>
                        <p className="text-2xl font-bold">{bmi}</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-semibold ${bmiInfo.color}`}>{bmiInfo.label}</p>
                        <p className="text-xs text-muted-foreground">{profile?.weight}{t.profile.common.kg} · {profile?.height}{t.profile.common.cm}</p>
                    </div>
                </div>
            )}

            {/* Personal info */}
            <section className="rounded-xl border border-border bg-card px-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-4 pb-2">
                    {t.profile.personalInfo.title}
                </p>
                <EditableField
                    label={t.profile.personalInfo.name}
                    value={profile?.name}
                    onSave={handleUpdate('name')}
                    icon={User}
                />
                <EditableField
                    label={t.profile.personalInfo.age}
                    value={profile?.age}
                    onSave={handleUpdate('age')}
                    type="number"
                    unit={t.profile.common.years}
                    icon={Calendar}
                />
                <EditableField
                    label={t.profile.personalInfo.sex}
                    value={profile?.sex}
                    onSave={handleUpdate('sex')}
                    icon={User}
                    options={[
                        { value: 'MALE', label: t.profile.personalInfo.male },
                        { value: 'FEMALE', label: t.profile.personalInfo.female },
                        { value: 'OTHER', label: t.profile.personalInfo.other },
                    ]}
                />
                <EditableField
                    label={t.profile.personalInfo.weight}
                    value={profile?.weight}
                    onSave={handleUpdate('weight')}
                    type="number"
                    unit={t.profile.common.kg}
                    icon={Scale}
                />
                <EditableField
                    label={t.profile.personalInfo.height}
                    value={profile?.height}
                    onSave={handleUpdate('height')}
                    type="number"
                    unit={t.profile.common.cm}
                    icon={Ruler}
                />
            </section>

            {/* Training preferences */}
            <section className="rounded-xl border border-border bg-card px-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-4 pb-2">
                    {t.profile.training.title}
                </p>
                <EditableField
                    label={t.profile.training.weeklyGoal}
                    value={profile?.weeklyGoal}
                    onSave={(val) => {
                        const clamped = Math.min(Math.max(Number(val), 1), 7)
                        handleUpdate('weeklyGoal')(String(clamped))
                    }}
                    type="number"
                    unit={t.profile.training.workoutsPerWeek}
                    icon={Target}
                />
            </section>

            {/* Account actions */}
            <section className="rounded-xl border border-border bg-card overflow-hidden">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-4 pb-2">
                    {t.profile.account.title}
                </p>
                <button
                    onClick={() => setLanguageDialogOpen(true)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-accent transition-colors"
                >
                    <Globe size={16} className="text-muted-foreground" />
                    <span className="text-sm flex-1 text-left">{t.profile.account.language}</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <span className="text-[14px] leading-none">{availableLanguages.find(l => l.code === lang)?.flag}</span>
                        <span>{availableLanguages.find(l => l.code === lang)?.label}</span>
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <button
                    onClick={() => setPasswordDialogOpen(true)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-accent transition-colors"
                >
                    <Lock size={16} className="text-muted-foreground" />
                    <span className="text-sm flex-1 text-left">{t.profile.account.changePassword}</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-accent transition-colors"
                >
                    <LogOut size={16} className="text-muted-foreground" />
                    <span className="text-sm flex-1 text-left">{t.profile.account.logout}</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <button
                    onClick={() => setDeleteDialogOpen(true)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors"
                >
                    <Trash2 size={16} className="text-destructive" />
                    <span className="text-sm flex-1 text-left text-destructive">{t.profile.account.deleteAccount}</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                </button>
            </section>

            <ChangePasswordDialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
            />

            <LanguageDialog
                open={languageDialogOpen}
                onClose={() => setLanguageDialogOpen(false)}
            />

            <DeleteAccountDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteAccount}
            />

            {/* Version number */}
            <div className="mt-8 text-center">
                <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em]">
                    {t.profile.common.version}
                </p>
            </div>
        </div>
    )
}