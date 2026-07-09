import { Button } from "../ui/Button"
import { cn } from "../../lib/utils"
import type { GitHubFetchError } from "../../types"

interface GitHubFetchErrorViewProps {
    error: GitHubFetchError
    onRetry: () => void
    onOpenTokenPanel: () => void
}

export function GitHubFetchErrorView({
    error,
    onRetry,
    onOpenTokenPanel,
}: GitHubFetchErrorViewProps) {
    const { title, message, action } = getErrorContent(error, onOpenTokenPanel)

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className={cn(
                "w-14 h-14 rounded-2xl mb-2",
                "bg-red-500/10 border border-red-500/20",
                "flex items-center justify-center"
            )}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5"
                    className="text-red-400" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                </svg>
            </div>
            <h2 className="text-base font-semibold text-(--zinc-200)">{title}</h2>
            <p className="text-sm text-(--zinc-500) max-w-sm leading-relaxed">{message}</p>
            <div className="flex items-center gap-3 mt-2">
                {action}
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Try again
                </Button>
            </div>
        </div>
    )
}

// Return the appropriate UI content for each GitHub error type
function getErrorContent(
    error: GitHubFetchError,
    onOpenTokenPanel: () => void
): { title: string; message: string; action: React.ReactNode } {
    switch (error.type) {
        case 'invalid_url':
            return {
                title: "That doesn't look like a GitHub URL",
                message: "Double-check the URL — it should look like github.com/owner/repo.",
                action: null,
            }

        case 'not_found':
            return {
                title: "Repository not found",
                message: "This repo doesn't exist, is private, or was renamed. DevMind can only analyze public repositories.",
                action: null,
            }

            
        case 'rate_limited': {
            const resetDate = new Date(error.resetAt * 1000)
            const resetTime = resetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return {
                title: "GitHub rate limit reached",
                message: `You've hit GitHub's request limit. It resets at ${resetTime}, or add a free personal access token to raise your limit to 5,000 requests/hour.`,
                action: (
                    <Button variant="primary" size="sm" onClick={onOpenTokenPanel}>
                        Add a token
                    </Button>
                ),
            }
        }

        case 'too_large':
            return {
                title: "Repository is large",
                message: `This repo has ${error.fileCount} relevant files — DevMind analyzes the ${error.limit} most architecturally significant ones (shallowest paths first) to keep the graph readable.`,
                action: null,
            }

        case 'empty_repo':
            return {
                title: "No analyzable files found",
                message: "DevMind looks for .js, .jsx, .ts, and .tsx files. This repo doesn't seem to have any (or they're all in excluded folders like node_modules or dist).",
                action: null,
            }

        case 'network_error':
            return {
                title: "Connection problem",
                message: error.message || "Couldn't reach GitHub. Check your connection and try again.",
                action: null,
            }

        default: {
            const _exhaustive: never = error
            return {
                title: "Something went wrong",
                message: "An unexpected error occurred while fetching the repository.",
                action: null,
            }
        }
    }
}