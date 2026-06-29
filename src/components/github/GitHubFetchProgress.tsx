import { cn } from "../../lib/utils"
import type { GitHubFetchProgress as ProgressType } from "../../types"

interface GitHubFetchProgressProps {
    progress: ProgressType
}

const PHASE_LABELS: Record<ProgressType['phase'], string> = {
    resolving: "Resolving repository…",
    tree: "Listing files…",
    files: "Fetching file contents…",
    parsing: "Parsing imports & exports…",
    done: "Done",
}

export function GitHubFetchProgress({ progress }: GitHubFetchProgressProps) {
    // calculate fetch progress for the progress bar
    const percent = progress.filesTotal > 0
        ? Math.round((progress.filesCompleted / progress.filesTotal) * 100)
        : 0

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2
                    border-violet-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2
                    border-t-violet-400 border-violet-500/20 animate-spin" />
            </div>

            <div className="text-center max-w-sm">
                <p className="text-sm font-medium text-zinc-300 mb-1.5">
                    {PHASE_LABELS[progress.phase]}
                </p>

                {/* Show detailed progress only while downloading repository files */}
                {progress.phase === 'files' && progress.filesTotal > 0 && (
                    <>
                        <div className="w-64 h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-2 mx-auto">
                            <div
                                className="h-full bg-violet-500 transition-all duration-200 ease-out"
                                style={{ width: `${percent}%` }}
                                role="progressbar"
                                aria-valuenow={percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                        <p className="text-xs text-zinc-600 font-mono">
                            {progress.filesCompleted} / {progress.filesTotal} files
                        </p>
                        {progress.currentFile && (
                            <p className={cn(
                                "text-[11px] text-zinc-700 font-mono mt-1 truncate max-w-70 mx-auto"
                            )}>
                                {progress.currentFile}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}