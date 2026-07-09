import { useState, useCallback, memo } from "react"
import { useNavigate } from "react-router-dom"
import { cn, formatRelativeTime } from "../../lib/utils"
import { useAppContext } from "../../context/AppContext"
import { useDebounce } from "../../hooks/useDebounce"
import type { AnalysisRecord } from "../../types"

export function Sidebar() {
    // global state
    const { state, dispatch } = useAppContext()

    const navigate = useNavigate()

    // local state
    const [searchQuery, setSearchQuery] = useState("")

    const debouncedSearch = useDebounce(searchQuery, 250)

    const filteredAnalyses = state.analyses.filter(a =>
        a.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    
    const handleSelectAnalysis = useCallback((analysis: AnalysisRecord) => {
        dispatch({ type: "SET_ACTIVE_ANALYSIS", payload: analysis.id })
        navigate(`/analysis/${analysis.id}`)

        if (window.innerWidth < 768) {
            dispatch({ type: "SET_SIDEBAR", payload: false })
        }
    }, [navigate, dispatch])

    const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation() // to stop default behavior of event bubbling
        dispatch({ type: "DELETE_ANALYSIS", payload: id })
    }, [dispatch])

    return (
        <>
            {/*mobile backdrop:- dark overlay behind sidebar*/}
            {state.sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-(--zinc-950)/60 backdrop-blur-sm md:hidden"
                    onClick={() => dispatch({ type: "SET_SIDEBAR", payload: false })}
                    aria-hidden="true"
                />
            )}

            {/* Main sidebar panel */}
            {/* translate-x-0 when open, -translate-x-full when closed */} 
            <aside
                className={cn(
                    "fixed top-14 left-0 bottom-0 z-40",
                    "w-72 flex flex-col",
                    "bg-(--zinc-950) border-r border-(--zinc-800)/60",
                    "transition-transform duration-300 ease-in-out",
                    state.sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
                aria-label="Analysis history"
                // aria-hidden when closed — screen readers should skip hidden sidebar
                aria-hidden={!state.sidebarOpen}  
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-(--zinc-800)/60">
                    <h2 className="text-sm font-medium text-(--zinc-300)">History</h2>
                    <button
                        onClick={() => dispatch({ type: "SET_SIDEBAR", payload: false })}
                        className="p-1 rounded-md text-(--zinc-500)hover:text-(--zinc-300) hover:bg-(--zinc-800) transition-colors"
                        aria-label="Close sidebar"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search only shown when there are enough analyses to search */}
                {state.analyses.length > 3 && (
                    <div className="px-3 py-2 border-b border-(--zinc-800)/60">
                        <div className="relative">
                            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--zinc-600)]"
                                width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search analyses..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={cn(
                                    "w-full h-8 pl-8 pr-3 rounded-lg text-xs",
                                    "bg-[var(--zinc-900)] border border-[var(--zinc-800)]",
                                    "text-(--zinc-300) placeholder:text-[var(--zinc-600)]",
                                    "focus:outline-none focus:border-[var(--zinc-700)]"
                                )}
                                aria-label="Search analyses"
                            />
                        </div>
                    </div>
                )}

                {/* Analysis list */}
                <div className="flex-1 overflow-y-auto">
                    {filteredAnalyses.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                            <div className="w-10 h-10 rounded-xl bg-[var(--zinc-900)] border border-[var(--zinc-800)] flex items-center justify-center mb-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="1.5" className="text-[var(--zinc-600)]" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 8v4M12 16h.01" />
                                </svg>
                            </div>
                            <p className="text-sm text-[var(--zinc-400)] mb-1">
                                {searchQuery ? "No results" : "No analyses yet"}
                            </p>
                            <p className="text-xs text-[var(--zinc-600)] leading-relaxed">
                                {searchQuery
                                    ? `No analyses matching "${searchQuery}"`
                                    : "Analyze a codebase to see it here"
                                }
                            </p>
                        </div>
                    ) : (
                        <ul className="py-1" role="list">
                            {filteredAnalyses.map(analysis => (
                                <AnalysisItem
                                    key={analysis.id}
                                    analysis={analysis}
                                    isActive={analysis.id === state.activeAnalysisId}
                                    onSelect={() => handleSelectAnalysis(analysis)}
                                    onDelete={e => handleDelete(e, analysis.id)}
                                />
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-(--zinc-800)/60">
                    <p className="text-xs text-[var(--zinc-600)] font-mono">
                        {state.analyses.length} {state.analyses.length === 1 ? "analysis" : "analyses"} saved locally
                    </p>
                </div>
            </aside>
        </>
    )
}


interface AnalysisItemProps {
    analysis: AnalysisRecord
    isActive: boolean
    onSelect: (analysis: AnalysisRecord) => void
    onDelete: (e: React.MouseEvent, id: string) => void
}



const AnalysisItem =  memo(function AnalysisItem({ analysis, isActive, onSelect, onDelete }: AnalysisItemProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect(analysis)
        }
    }

    return (
        <li>
            <div
                onClick={() => onSelect(analysis)}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                className={cn(
                    "group w-full text-left px-3 py-3",
                    "flex items-start gap-3",
                    "transition-colors duration-100 hover:bg-[var(--zinc-900)]/60 cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                    isActive && "bg-violet-500/10 border-l-2 border-l-violet-500"
                )}
                aria-current={isActive ? "true" : undefined}
            >

                <span className={cn(
                    "text-base mt-0.5 shrink-0 font-mono",
                    isActive ? "text-violet-400" : "text-[var(--zinc-600)]"
                )}>
                    {analysis.sourceType === "github" ? "⬡" : "⌗"}
                </span>

                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-violet-300" : "text-(--zinc-300)"
                    )}>
                        {analysis.title}
                    </p>
                    <p className="text-xs text-[var(--zinc-600)] mt-0.5">
                        {formatRelativeTime(analysis.createdAt)}
                        {analysis.fileCount != null && ` · ${analysis.fileCount} files`}
                    </p>
                    <span className={cn(
                        "inline-flex mt-1.5 px-1.5 py-0.5 text-[10px] font-mono rounded",
                        analysis.language === "typescript"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-amber-500/15 text-amber-400"
                    )}>
                        {analysis.language === "typescript" ? "TS" : "JS"}
                    </span>
                </div>

                <button
                    onClick={(e) => onDelete(e, analysis.id)}
                    className={cn(
                        "shrink-0 p-1 rounded",
                        "text-[var(--zinc-700)] hover:text-red-400 hover:bg-red-500/10",
                        "opacity-0 group-hover:opacity-100 transition-all duration-150"
                    )}
                    aria-label={`Delete ${analysis.title}`}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                </button>
            </div>
        </li>
    )
})
