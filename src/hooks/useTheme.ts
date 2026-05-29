import { useState, useEffect } from 'react'
import type { Theme } from '../types'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('devmind-theme') as Theme) ?? 'dark'
    })

    useEffect(() => {
        localStorage.setItem('devmind-theme', theme)
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme])

    const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark')

    return { theme, toggleTheme }
}
