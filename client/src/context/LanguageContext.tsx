import React, { createContext, useContext, useState, useMemo } from 'react'
import { en, type Dictionary } from '../i18n/locales/en'
import { fr } from '../i18n/locales/fr'

export type Language = 'en' | 'fr'

const dictionaries: Record<Language, Dictionary> = {
    en,
    fr
}

interface LanguageContextType {
    lang: Language
    setLang: (lang: Language) => void
    t: Dictionary
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => {},
    t: en
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    // Initialize from localStorage or fallback to browser language ('fr' if French, else 'en')
    const [lang, setLangState] = useState<Language>(() => {
        const stored = localStorage.getItem('language')
        if (stored === 'en' || stored === 'fr') return stored
        
        // Check browser
        if (typeof window !== 'undefined' && window.navigator) {
            const browserLang = navigator.language.split('-')[0]
            if (browserLang === 'fr') return 'fr'
        }
        
        return 'en'
    })

    const setLang = (newLang: Language) => {
        setLangState(newLang)
        localStorage.setItem('language', newLang)
    }

    // Memoize the context value so it only changes when language changes
    const value = useMemo(() => ({
        lang,
        setLang,
        t: dictionaries[lang]
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
