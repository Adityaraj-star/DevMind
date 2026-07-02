import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { PageShell } from "../components/layout/PageShell"
import { CodePastePanel } from "../components/layout/CodePastePanel"
import { useAppContext } from "../context/AppContext"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { cn, generateId, isGitHubUrl, extractRepoName } from "../lib/utils"
import { parsePastedCode } from "../lib/parser"
import { parseGitHubUrl } from "../lib/github"
import { GitHubTokenInput } from "../components/github/GitHubTokenInput"
import { useGitHubToken } from "../hooks/useGitHubToken"
import type { AnalysisRecord } from "../types"


type InputTab = "paste" | "github"

type GitHubFormData = {
    url: string
    branch: string
}

export function Analyze() {
    const navigate = useNavigate()
    const { state, dispatch } = useAppContext()

    const [activeTab, setActiveTab] = useState<InputTab>("paste")

    const githubToken = useGitHubToken()

    // ##### React Hook Form setup for GitHub URL form #####
    // useForm<T>: T is the shape of form data (GitHubFormData)
    // register: connects an input to the form (returns ref + onChange + onBlur)
    // handleSubmit: validates all fields, then calls your function
    // formState.errors: object containing validation error messages
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<GitHubFormData>({
        defaultValues: { url: "", branch: "main" },
    })

    // watch('url'): reads the current value of the url field reactively.
    // We use it to show a preview of the extracted repo name.
    const watchedUrl = watch("url")
    const repoPreview = watchedUrl && isGitHubUrl(watchedUrl)
        ? extractRepoName(watchedUrl)
        : null
    
    // submit handler for Github form
    const onSubmitGitHub = (data: GitHubFormData) => {
        const repoInfo = parseGitHubUrl(data.url)

        if (!repoInfo) return

        const record: AnalysisRecord = {
            id: generateId(),
            title: `${repoInfo.owner}/${repoInfo.repo}`,
            sourceType: "github",
            repoUrl: data.url,
            language: "typescript",
            createdAt: new Date().toISOString(),
            status: "parsing",
        }

        dispatch({ type: "ADD_ANALYSIS", payload: record })

        navigate(`/analysis/${record.id}`)
    }

    // submit handler for paste form
    const onSubmitPaste = (code: string, language: "javascript" | "typescript") => {
        const graphData = parsePastedCode(code, language)

        const record: AnalysisRecord = {
            id: generateId(),
            title: graphData.stats.totalFiles > 1
                ? `Pasted ${language} code (${graphData.stats.totalFiles} files)`
                : `Pasted ${language} code`,
            sourceType: "paste",
            language,
            createdAt: new Date().toISOString(),
            status: "ready",
            fileCount: graphData.stats.totalFiles,
            graphData,
        }
        dispatch({ type: "ADD_ANALYSIS", payload: record })
        navigate(`/analysis/${record.id}`)
    }

    return (
        <PageShell>
            <div className="min-h-screen px-6 py-16">

                {/* Page header */}
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-4">
                        Start here
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
                        Analyze your codebase
                    </h1>
                    <p className="text-zinc-400 text-base leading-relaxed">
                        Paste code directly or enter a GitHub URL. DevMind builds
                        an interactive graph of every file and its connections.
                    </p>
                </div>

                 {/* Tab switcher */}
                <div className="max-w-3xl mx-auto mb-6">
                    <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 w-fit mx-auto">
                        {(["paste", "github"] as InputTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                aria-pressed={activeTab === tab} // aria-pressed: tells screen readers whether this tab is active
                                className={cn(
                                    "px-5 py-2 text-sm font-medium rounded-lg transition-all duration-150",
                                    activeTab === tab
                                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {tab === "paste" ? "📋  Paste code" : "⬡  GitHub URL"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Panels*/}
                <div className="max-w-3xl mx-auto">
                    {activeTab === "paste" && (
                        <>
                            <CodePastePanel
                                onAnalyze={onSubmitPaste}
                                status={state.currentStatus}
                                className="py-0!"
                            />

                            <div className={cn(
                                "flex items-start gap-2.5 px-4 py-3 rounded-xl mx-auto max-w-4xl",
                                "bg-violet-500/5 border border-violet-500/15"
                            )}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2"
                                    className="text-violet-400 mt-0.5 shrink-0" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4M12 8h.01" />
                                </svg>
                                <p className="text-[11px] text-zinc-500 leading-relaxed">
                                    <strong className="text-zinc-400">Tip:</strong> paste multiple files
                                    by separating them with{" "}
                                    <code className="text-violet-400 font-mono">{"// --- file: Button.tsx ---"}</code>{" "}
                                    on its own line before each file's code — DevMind will graph
                                    the relationships between them.
                                </p>
                            </div>
                        </>
                    )}

                    {activeTab === "github" && (
                        <div className="space-y-4">
                            <GitHubTokenInput
                                token={githubToken.token}
                                onSetToken={githubToken.setToken}
                                onClearToken={githubToken.clearToken}
                                rateLimitInfo={githubToken.rateLimitInfo}
                            />

                            <form
                                onSubmit={handleSubmit(onSubmitGitHub)}
                                noValidate
                            >
                                <div className={cn(
                                    "rounded-2xl p-8",
                                    "border border-zinc-800 bg-zinc-900/40",
                                    "space-y-5"
                                )}>
                                    <div>
                                        <h2 className="text-base font-medium text-zinc-200 mb-1">
                                            GitHub repository
                                        </h2>
                                        <p className="text-sm text-zinc-500">
                                            Paste a public GitHub URL. DevMind fetches the real
                                            file structure and builds the graph from it.
                                        </p>
                                    </div>

                                    <Input
                                        label="Repository URL"
                                        placeholder="https://github.com/facebook/react"
                                        error={errors.url?.message}
                                        hint="Must be a public repository"
                                        leftIcon={
                                            <svg 
                                                width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                            </svg>
                                        }
                                        {...register("url", {
                                            required: "Please enter a GitHub URL",
                                            validate: (v) => isGitHubUrl(v) || "Must be a valid github.com URL",
                                        })}
                                    />

                                    {repoPreview && (
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg",
                                            "bg-violet-500/10 border border-violet-500/20"
                                        )}>
                                            <span className="text-violet-400 text-xs">↳</span>
                                            <span className="text-violet-300 text-sm font-medium">
                                                {repoPreview}
                                            </span>
                                            <span className="text-zinc-500 text-xs">will be used as the analysis title</span>
                                        </div>
                                    )}

                                    <Input
                                        label="Branch (optional)"
                                        placeholder="main"
                                        hint="Leave empty to use the default branch"
                                        {...register("branch")}
                                    />


                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        size="md"
                                        rightIcon={
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        }
                                    >
                                        Generate graph
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    )
}