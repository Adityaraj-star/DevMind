import { useState } from "react"
import { cn } from "../../lib/utils"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"
import type { RateLimitInfo } from "../../lib/github"

// Optional GitHub Personal Access Token panel.

// Lets users increase GitHub API rate limits for larger repositories
// while keeping token management entirely client-side.

interface GitHubTokenInputProps {
    token: string | null
    onSetToken: (token: string) => void
    onClearToken: () => void
    rateLimitInfo: RateLimitInfo | null
}

export function GitHubTokenInput({
    token,
    onSetToken,
    onClearToken,
    rateLimitInfo,
}: GitHubTokenInputProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [draftToken, setDraftToken] = useState("")

    // Persist the token and reset the temporary input state
    const handleSave = () => {
        onSetToken(draftToken)
        setDraftToken("")
        setIsOpen(false)
    }

    const formatResetTime = (resetAt: number): string => {
        const resetDate = new Date(resetAt * 1000)
        return resetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className={cn(
            "rounded-xl border border-[var(--zinc-800)] bg-[var(--zinc-900)]/30 overflow-hidden"
        )}>
            {/* Collapsible panel header */}
            <button
                type="button"
                onClick={() => setIsOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3
                    text-left hover:bg-[var(--zinc-900)]/40 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" aria-hidden="true"
                        className={token ? "text-green-400" : "text-(--zinc-500)"}>
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <span className="text-sm text-(--zinc-300)">
                        {token ? "GitHub token connected" : "Add a GitHub token (optional)"}
                    </span>
                    {token && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded
                            bg-green-500/15 text-green-400 border border-green-500/25">
                            5,000 req/hr
                        </span>
                    )}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" aria-hidden="true"
                    className={cn(
                        "text-(--zinc-500) transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {/* display the current GitHub API rate limit once available */}
            {rateLimitInfo && !isOpen && (
                <div className="px-4 pb-3 -mt-1">
                    <p className="text-[11px] text-[var(--zinc-600)] font-mono">
                        {rateLimitInfo.remaining} / {rateLimitInfo.limit} requests remaining
                        {rateLimitInfo.remaining < 10 && (
                            <span className="text-amber-400">
                                {" "}· resets at {formatResetTime(rateLimitInfo.resetAt)}
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Expanded panel */}
            {isOpen && (
                <div className="px-4 pb-4 border-t border-(--zinc-800)/60 pt-4 space-y-3">
                    <p className="text-xs text-(--zinc-500) leading-relaxed">
                        Without a token, GitHub allows 60 requests/hour per IP —
                        enough for one or two small repos. A free personal access
                        token raises this to 5,000/hour.
                    </p>

                    <div className={cn(
                        "flex items-start gap-2 p-3 rounded-lg",
                        "bg-[var(--zinc-800)]/40 border border-[var(--zinc-700)]/50"
                    )}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                            className="text-violet-400 mt-0.5 shrink-0" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <p className="text-[11px] text-(--zinc-500) leading-relaxed">
                            Create a <strong className="text-[var(--zinc-400)]">fine-grained token</strong> at{" "}
                            <span className="text-violet-400 font-mono">github.com/settings/tokens</span>{" "}
                            scoped to <strong className="text-[var(--zinc-400)]">"Public repositories (read-only)"</strong>.
                            It's stored only in your browser's local storage and sent only to
                            api.github.com — never to any DevMind server.
                        </p>
                    </div>

                    {token ? (
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-(--zinc-500) font-mono">
                                Token saved (•••• {token.slice(-4)})
                            </p>
                            <Button variant="danger" size="sm" onClick={onClearToken}>
                                Remove token
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <Input
                                    type="password"
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    value={draftToken}
                                    onChange={(e) => setDraftToken(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleSave}
                                disabled={draftToken.trim().length === 0}
                            >
                                Save
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}