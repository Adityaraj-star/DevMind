import { useState, useCallback } from "react"
import type { RateLimitInfo } from "../lib/github"

const TOKEN_STORAGE_KEY = "devmind-github-token"

export interface UseGitHubTokenReturn {
    token: string | null
    setToken: (token: string) => void
    clearToken: () => void
    rateLimitInfo: RateLimitInfo | null
    recordRateLimit: (info: RateLimitInfo) => void
}

function loadTokenFromStorage(): string | null {
    try {
        return localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch {
        return null
    }
}

export function useGitHubToken(): UseGitHubTokenReturn {
    const [token, setTokenState] = useState<string | null>(() => loadTokenFromStorage())

    const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)

    // Persist the token locally and keep React state in sync
    const setToken = useCallback((newToken: string) => {
        const trimmed = newToken.trim()
        try {
            if (trimmed) {
                localStorage.setItem(TOKEN_STORAGE_KEY, trimmed)
            } else {
                localStorage.removeItem(TOKEN_STORAGE_KEY)
            }
        } catch {
            console.warn("[DevMind] Could not save GitHub token to localStorage")
        }
        setTokenState(trimmed || null)
    }, [])

    const clearToken = useCallback(() => {
        try {
            localStorage.removeItem(TOKEN_STORAGE_KEY)
        } catch {
            // localStorage disabled => nothing to clean up
        }
        setTokenState(null)
        setRateLimitInfo(null)
    }, [])

    const recordRateLimit = useCallback((info: RateLimitInfo) => {
        setRateLimitInfo(info)
    }, [])

    return { token, setToken, clearToken, rateLimitInfo, recordRateLimit }
}