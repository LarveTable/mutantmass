import { useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { useTranslation } from '@/context/LanguageContext'
import type { Language } from '@/context/LanguageContext'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'


export function LanguageDialog({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const { t, lang, setLang, availableLanguages } = useTranslation()

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xs sm:max-w-sm rounded-[24px]">
                <DialogHeader>
                    <DialogTitle>{t.profile.account.language}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <div className="flex flex-col gap-2 py-4 max-h-[60vh] overflow-y-auto pr-1">
                    {availableLanguages.map((l) => {
                        const isActive = lang === l.code
                        return (
                            <button
                                key={l.code}
                                onClick={() => {
                                    setLang(l.code as Language)
                                    setTimeout(onClose, 200)
                                }}
                                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all ${isActive
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-card hover:bg-accent hover:border-accent-foreground/20 text-foreground'
                                    }`}
                            >
                                <span className="text-xl leading-none">{l.flag}</span>
                                <span className="font-medium flex-1 text-left">{l.label}</span>
                                {isActive && <Check size={18} className="text-primary" />}
                            </button>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function LanguageToggle({ variant = 'default' }: { variant?: 'default' | 'neon' }) {
    const [open, setOpen] = useState(false)
    const { lang, availableLanguages } = useTranslation()
    const currentLang = availableLanguages.find(l => l.code === lang)

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={`flex items-center rounded-full z-50 transition-all ${variant === 'neon'
                    ? 'min-w-[100px] justify-center gap-3 px-8 py-3 border border-[#00ff87]/40 hover:border-[#00ff87]/80 bg-black/30 backdrop-blur-md text-[#00ff87] hover:text-[#00ff87] [text-shadow:0_0_8px_rgba(0,255,135,0.6)] hover:[text-shadow:0_0_15px_rgba(0,255,135,1)] font-bold tracking-widest'
                    : 'gap-2 px-3 py-2 fixed right-4 border border-border bg-card/50 backdrop-blur-sm hover:bg-accent shadow-sm'
                    }`}
                style={variant === 'neon' ? {} : { top: 'calc(1rem + env(safe-area-inset-top))' }}
            >
                {variant !== 'neon' && <Globe size={16} className="text-muted-foreground" />}
                <span className={`uppercase tracking-wider ${variant === 'neon' ? 'text-lg' : 'text-xs font-medium'}`}>{currentLang?.code}</span>
                <span className={variant === 'neon' ? 'text-lg' : 'text-sm'}>{currentLang?.flag}</span>
            </button>
            <LanguageDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
