import React, { createContext, useContext, useState, useMemo } from 'react'
import { en, type Dictionary } from '../i18n/locales/en'
import { fr } from '../i18n/locales/fr'

export const AVAILABLE_LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
] as const

export type Language = (typeof AVAILABLE_LANGUAGES)[number]['code']
export const DEFAULT_LANGUAGE: Language = 'en'

const dictionaries: Record<Language, Dictionary> = {
    en,
    fr
}

interface LanguageContextType {
    lang: Language
    setLang: (lang: Language) => void
    t: Dictionary
    availableLanguages: typeof AVAILABLE_LANGUAGES
}

const LanguageContext = createContext<LanguageContextType>({
    lang: DEFAULT_LANGUAGE,
    setLang: () => { },
    t: en,
    availableLanguages: AVAILABLE_LANGUAGES
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    // Initialize from localStorage or fallback to browser language
    const [lang, setLangState] = useState<Language>(() => {
        const stored = localStorage.getItem('language') as Language
        const isValid = AVAILABLE_LANGUAGES.some(l => l.code === stored)
        if (isValid) return stored

        // Check browser
        if (typeof window !== 'undefined' && window.navigator) {
            const browserLang = navigator.language.split('-')[0] as Language
            const isSupported = AVAILABLE_LANGUAGES.some(l => l.code === browserLang)
            if (isSupported) return browserLang
        }

        return DEFAULT_LANGUAGE
    })

    const setLang = (newLang: Language) => {
        setLangState(newLang)
        localStorage.setItem('language', newLang)
    }

    // Memoize the context value so it only changes when language changes
    const value = useMemo(() => ({
        lang,
        setLang,
        t: dictionaries[lang],
        availableLanguages: AVAILABLE_LANGUAGES
    }), [lang])

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useTranslation = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider')
    }
    return context
}
