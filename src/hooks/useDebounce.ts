import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delayMs: number = 300): T {    // <T> TypeScript Generic (any type) makes hooks reusable
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delayMs)

        return () => clearTimeout(timer)
    }, [value, delayMs])

    return debouncedValue
}