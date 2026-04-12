import { describe, it, expect } from 'vitest'
import * as enLocale from '../../i18n/locales/en'
import * as frLocale from '../../i18n/locales/fr'

// In a real generic setup, we'd use import.meta.glob, 
// but for clarity and stability in this environment, 
// we'll use the exported locales from context if possible, 
// or manually list them if we must.
// The goal is to ensure parity between English and any other language.

const baseLocale = enLocale.en as Record<string, any>
const otherLocales: Record<string, Record<string, any>> = {
    fr: frLocale.fr as Record<string, any>,
}

/**
 * Recursively gets all keys in a nested object
 */
function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
    return Object.keys(obj).reduce((keys: string[], key: string) => {
        const value = obj[key]
        const newPrefix = prefix ? `${prefix}.${key}` : key
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return [...keys, ...getAllKeys(value, newPrefix)]
        }
        return [...keys, newPrefix]
    }, [])
}

/**
 * Gets the value at a dot-notated path
 */
function getValueAtPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

/**
 * extracts {{placeholder}} patterns from a string
 */
function getPlaceholders(str: string): string[] {
    if (typeof str !== 'string') return []
    const matches = str.match(/{{[^}]+}}/g)
    return matches ? matches.sort() : []
}

describe('I18n Structural Parity', () => {
    const baseKeys = getAllKeys(baseLocale)

    Object.entries(otherLocales).forEach(([lang, locale]) => {
        describe(`Locale: ${lang}`, () => {
            const localeKeys = getAllKeys(locale)

            it('should have all keys present in the base locale', () => {
                baseKeys.forEach(key => {
                    expect(localeKeys).toContain(key)
                })
            })

            it('should not have extra keys that are not in the base locale', () => {
                localeKeys.forEach(key => {
                    expect(baseKeys).toContain(key)
                })
            })

            it('should not have empty translation strings', () => {
                localeKeys.forEach(key => {
                    const value = getValueAtPath(locale, key)
                    if (typeof value === 'string') {
                        expect(value.trim().length).toBeGreaterThan(0)
                    }
                })
            })

            it('should have consistent placeholders with base locale', () => {
                baseKeys.forEach(key => {
                    const baseValue = getValueAtPath(baseLocale, key)
                    const localeValue = getValueAtPath(locale, key)

                    if (typeof baseValue === 'string' && typeof localeValue === 'string') {
                        const basePlaceholders = getPlaceholders(baseValue)
                        const localePlaceholders = getPlaceholders(localeValue)
                        expect(localePlaceholders).toEqual(basePlaceholders)
                    }
                })
            })
        })
    })
})
