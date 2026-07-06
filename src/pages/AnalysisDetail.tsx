import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PageShell } from "../components/layout/PageShell"
import { GraphCanvas } from "../components/graph/GraphCanvas"
import { GraphStatsBar } from "../components/graph/GraphStatsBar"
import { GraphLegend } from "../components/graph/GraphLegend"
import { NodeInfoPanel } from "../components/graph/NodeInfoPanel"
import { GitHubFetchProgress } from "../components/github/GitHubFetchProgress"
import { GitHubFetchErrorView } from "../components/github/GitHubFetchErrorView"
import { ErrorBoundary } from "../components/ErrorBoundary"
import { useAppContext } from "../context/AppContext"
import { useGitHubToken } from "../hooks/useGitHubToken"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { cn, formatRelativeTime } from "../lib/utils"
import { buildGraphDataFromFiles } from "../lib/parser"
import { parseGitHubUrl, fetchGitHubRepo, MAX_FILES } from "../lib/github"

import type {
    GraphNode, GraphData, GraphViewState,
    GitHubFetchProgress as ProgressType, GitHubFetchError,
} from "../types"


export function AnalysisDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { state, dispatch } = useAppContext()
    const githubToken = useGitHubToken()

    const [viewState, setViewState] = useState<Omit<GraphViewState, 'transform'>>({
        selectedNode: null,
        showInfoPanel: false,
        activeFilter: 'all',
    })

    const [graphData, setGraphData] = useState<GraphData | null>(null)
    const [progress, setProgress] = useState<ProgressType | null>(null)
    const [fetchError, setFetchError] = useState<GitHubFetchError | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const activeFetchIdRef = useRef<string | null>(null)

    // find the analysis with this id in global state
    const analysis = state.analyses.find(a => a.id === id)

    useEffect(() => {
        // Keep track of which analysis is currently open
        // so other parts of the app can react accordingly.
        if (id) {
            dispatch({ type: "SET_ACTIVE_ANALYSIS", payload: id })
        }

        // Cleanup: when leaving this page, clear the active selection
        return () => {
            dispatch({ type: "SET_ACTIVE_ANALYSIS", payload: null })
        }
    }, [id, dispatch])

    useEffect(() => {
        if (!analysis) return

        const currentAnalysis = analysis

        setFetchError(null)

        if (currentAnalysis.graphData) {
            setGraphData(currentAnalysis.graphData)
            setProgress(null)
            return
        }

        if (currentAnalysis.sourceType === "paste") {
            setFetchError({ type: 'network_error', message: 'No code data found for this analysis.' })
            return
        }
        
        const repoInfo = currentAnalysis.repoUrl ? parseGitHubUrl(currentAnalysis.repoUrl) : null
        if (!repoInfo) {
            setFetchError({ type: 'invalid_url' })
            return
        }

        const fetchId = currentAnalysis.id
        activeFetchIdRef.current = fetchId

        dispatch({ type: "SET_STATUS", payload: "parsing" })
        setProgress({ phase: 'resolving', filesCompleted: 0, filesTotal: 0 })

        async function runFetch() {
            try {
                const result = await fetchGitHubRepo(repoInfo!, githubToken.token, {
                    onRateLimit: githubToken.recordRateLimit,
                    onProgress: (phase, completed, total, currentFile) => {
                        if (activeFetchIdRef.current !== fetchId) return
                        setProgress({ phase, filesCompleted: completed, filesTotal: total, currentFile })
                    },
                })

                if (activeFetchIdRef.current !== fetchId) return

                setProgress({ phase: 'parsing', filesCompleted: result.files.length, filesTotal: result.files.length })

                const data = buildGraphDataFromFiles(result.files)

                if (result.truncated) {
                    console.info(`[DevMind] Showing ${result.files.length} of more files (truncated at ${MAX_FILES}).`)
                }

                dispatch({
                    type: "UPDATE_ANALYSIS",
                    payload: {
                        id: currentAnalysis.id,
                        updates: {
                            graphData: data,
                            fileCount: data.stats.totalFiles,
                            status: "ready",
                            rawFiles: result.files,
                        },
                    },
                })

                setGraphData(data)
                setProgress(null)
                dispatch({ type: "SET_STATUS", payload: "ready" })
            } catch (err) {
                if (activeFetchIdRef.current !== fetchId) return

                const typedError = err as GitHubFetchError
                setFetchError(typedError)
                setProgress(null)
                dispatch({ type: "SET_ERROR", payload: "Failed to fetch repository." })
            }
        }

        runFetch()

    }, [analysis?.id, retryCount])

    const handleRetry = useCallback(() => {
        setRetryCount(n => n + 1)
    }, [])

    const handleNodeClick = useCallback((node: GraphNode) => {
        setViewState(prev => ({
            ...prev,
            selectedNode: node,
            showInfoPanel: true,
        }))
    }, [])

    const handleCanvasClick = useCallback(() => {
        // click empty space = deselect node
        setViewState(prev => ({
            ...prev,
            selectedNode: null,
            showInfoPanel: false,
        }))
    }, [])

    const handleFilterChange = useCallback((filter: typeof viewState.activeFilter) => {
        setViewState(prev => ({ ...prev, activeFilter: filter }))
    }, [])

    const handleClosePanel = useCallback(() => {
        setViewState(prev => ({
            ...prev,
            selectedNode: null,
            showInfoPanel: false,
        }))
    }, [])

    const handleGraphErrorReset = useCallback(() => {
        setGraphData(null)
        setRetryCount(n => n + 1)
    }, [])

    // GUARD CLAUSE — handle not found FIRST
    if (!analysis) {
        // Gracefully handle invalid URLs or deleted analyses
        // instead of rendering a broken page.
        return (
            <PageShell>
                <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl mb-6",
                        "bg-zinc-900 border border-zinc-800",
                        "flex items-center justify-center"
                    )}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.5"
                            className="text-zinc-600" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-zinc-200 mb-2">
                        Analysis not found
                    </h1>
                    <p className="text-zinc-500 text-sm mb-8 max-w-md leading-relaxed">
                        This analysis doesn't exist or was deleted.
                        It may have been removed from your local history.
                    </p>
                    <div className="flex items-center gap-3">
                        <Button variant="primary" onClick={() => navigate("/analyze")}>
                            Start a new analysis
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(-1)}>
                            Go back
                        </Button>
                    </div>
                </div>
            </PageShell>
        )
    }

    // analysis exists
    return (
        <PageShell className="p-0!">
            <div className="flex flex-col h-[calc(100vh-56px)]">

                {/* PAGE HEADER */}
                <div className={cn(
                    "flex items-center justify-between gap-4 flex-wrap",
                    "px-6 py-3 border-b border-zinc-800/60 bg-zinc-950",
                    "shrink-0"    // prevent header from shrinking when graph needs space
                )}>
                    {/* Left: breadcrumb + title + badges */}
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300
                                hover:bg-zinc-800 transition-colors shrink-0"
                            aria-label="Go back"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M19 12H5M12 5l-7 7 7 7" />
                            </svg>
                        </button>
                        <h1 className="text-sm font-semibold text-zinc-100 truncate">
                            {analysis.title}
                        </h1>
                        <Badge variant={analysis.language === "typescript" ? "config" : "util"}>
                            {analysis.language === "typescript" ? "TS" : "JS"}
                        </Badge>
                        <Badge variant={analysis.sourceType === "github" ? "component" : "hook"}>
                            {analysis.sourceType === "github" ? "GitHub" : "Pasted"}
                        </Badge>
                        <span className="text-xs text-zinc-600 font-mono">
                            {formatRelativeTime(analysis.createdAt)}
                        </span>
                        {analysis.fileCount != null && (
                            <span className="text-xs text-zinc-600 font-mono">
                                {analysis.fileCount} files
                            </span>
                        )}

                        {analysis.repoUrl && (
                            <a
                                href={analysis.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-mono"
                            >
                                View on GitHub ↗
                            </a>
                        )}
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                                dispatch({ type: "DELETE_ANALYSIS", payload: analysis.id })
                                navigate("/analyze")
                            }}
                            leftIcon={
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                                </svg>
                            }
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* GRAPH AREA */}
                <div className="flex-1 flex flex-col min-h-0">

                    {fetchError ? (
                        <GitHubFetchErrorView
                            error={fetchError}
                            onRetry={handleRetry}
                            onOpenTokenPanel={() => navigate("/analyze")}
                        />
                    ) : progress ? (
                        <GitHubFetchProgress progress={progress} />
                    ) : graphData ? (
                        // GRAPH VIEW
                        <ErrorBoundary section="the graph visualization" onReset={handleGraphErrorReset}>
                            {/* Stats bar*/}
                            <GraphStatsBar
                                graphData={graphData}
                                activeFilter={viewState.activeFilter}
                                onFilterChange={handleFilterChange}
                                isSimulating={false}
                            />

                            {/* Main graph area*/}
                            <div className="flex-1 relative min-h-0">
                                <GraphCanvas
                                    graphData={graphData}
                                    selectedNode={viewState.selectedNode}
                                    onNodeClick={handleNodeClick}
                                    onCanvasClick={handleCanvasClick}
                                    activeFilter={viewState.activeFilter}
                                    className="w-full h-full"
                                />

                                {/* Legend - bottom left of graph area */}
                                <GraphLegend />
                            </div>

                            {/* Node info panel - slides in from the right when a node is selected */}
                            <NodeInfoPanel
                                node={viewState.selectedNode}
                                links={graphData.links}
                                onClose={handleClosePanel}
                            />
                        </ ErrorBoundary>
                    ) : (
                        // ERROR / NO DATA STATE
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <p className="text-sm text-zinc-500">
                                Could not generate graph data.
                            </p>
                            <Button variant="secondary" size="sm"
                                onClick={() => navigate("/analyze")}>
                                Start new analysis
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    )
}