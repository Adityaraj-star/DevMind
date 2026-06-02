import { useState, useRef, useCallback } from 'react'
import { cn } from "../../lib/utils"
import { Button } from '../ui/Button'
import { Badge } from "../ui/Badge"
import type { AnalysisStatus } from "../../types"

interface CodePastePanelProps {
    onAnalyze: (code: string, language: "javascript" | "typescript") => void
    status: AnalysisStatus
    className?: string
}

const LANGUAGES = [
    { value: "typescript" as const, label: "TypeScript", ext: ".ts/.tsx" },
    { value: "javascript" as const, label: "JavaScript", ext: ".js/.jsx" },
]

const MIN_CODE_LENGTH = 50
const MAX_CODE_LENGTH = 50_000

export function CodePastePanel({ onAnalyze, status, className }: CodePastePanelProps) {
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState<"javascript" | "typescript">("typescript")
    const [isDragging, setIsDragging] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const charCount = code.length
    const lineCount = code === '' ? 0 : code.split('\n').length
    const isTooShort = charCount > 0 && charCount < MIN_CODE_LENGTH
    const isTooLong = charCount > MAX_CODE_LENGTH
    const canAnalyze = charCount >= MIN_CODE_LENGTH && !isTooLong && status !== "parsing"

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (!file) return

        const ext = file.name.split(".").pop()?.toLowerCase()
        if (ext === "ts" || ext === "tsx") setLanguage("typescript")
        if (ext === "js" || ext === "jsx") setLanguage("javascript")

        const reader = new FileReader()
        reader.onload = (event) => {
            setCode(event.target?.result as string)
            textareaRef.current?.focus()
        }
        reader.readAsText(file)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault() 
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleAnalyze = () => {
        if (!canAnalyze) return
        onAnalyze(code.trim(), language)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        handleAnalyze()
        }
    }

    return (
        <section
            id="analyze-section"
            className={cn("py-24 px-6", className)}
            aria-labelledby="analyze-heading"
        >
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-4">
                        Start here
                    </p>
                    <h2
                        id="analyze-heading"
                        className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4"
                    >
                        Paste your code
                    </h2>
                    <p className="text-zinc-400 text-base max-w-xl mx-auto">
                        Drop a file, paste a snippet, or type directly below.
                        DevMind handles the rest.
                    </p>
                </div>

                <div className={cn(
                    "rounded-2xl overflow-hidden",
                    "border",
                    isDragging ? "border-violet-500/60" : "border-zinc-800",
                    "transition-colors duration-200",
                    "bg-zinc-900/40"
                )}>

                    <div className={cn(
                        "flex items-center justify-between",
                        "px-4 py-3",
                        "bg-zinc-900/80",
                        "border-b border-zinc-800"
                    )}>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5" aria-hidden="true">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            </div>
                            <span className="font-mono text-xs text-zinc-500">
                                code-input.{language === "typescript" ? "tsx" : "jsx"}
                            </span>
                        </div>

                
                        <div className="flex items-center gap-2">
                            <label htmlFor="language-select" className="sr-only">
                                Select language
                            </label>
                            <select
                                id="language-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as "javascript" | "typescript")}
                                className={cn(
                                "bg-zinc-800 text-zinc-300 text-xs",
                                "border border-zinc-700 rounded-md",
                                "px-2 py-1",
                                "focus:outline-none focus:border-violet-500/50",
                                "cursor-pointer"
                                )}
                            >
                                {LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label} ({lang.ext})
                                </option>
                                ))}
                            </select>
                        </div>
                    </div>

            
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className="relative"
                    >

                        {isDragging && (
                            <div
                                className={cn(
                                "absolute inset-0 z-10",
                                "flex flex-col items-center justify-center gap-3",
                                "bg-zinc-950/90",
                                "border-2 border-dashed border-violet-500/60 rounded-b-2xl"
                                )}
                                aria-live="polite"
                                aria-label="Drop file to analyze"
                            >

                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="1.5"
                                className="text-violet-400 animate-bounce" aria-hidden="true">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                </svg>
                                <p className="text-violet-300 font-medium">Drop to analyze</p>
                                <p className="text-zinc-500 text-sm">Supports .js, .ts, .jsx, .tsx</p>
                            </div>
                        )}

                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    `// Paste your code here, or drop a file above\n` +
                                    `// Example:\n` +
                                    `import { useState } from 'react'\n\n` +
                                    `export function App() {\n` +
                                    `  const [count, setCount] = useState(0)\n` +
                                    `  return <button onClick={() => setCount(c => c + 1)}>{count}</button>\n` +
                                    `}`
                                }
                                spellCheck={false}           
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                className={cn(
                                    "w-full min-h-80 resize-y",
                                    "bg-transparent",
                                    "font-mono text-sm leading-relaxed",
                                    "text-zinc-300",
                                    "px-5 py-4",
                                    "placeholder:text-zinc-600",
                                    "focus:outline-none",
                                    "tab-size-2",
                                )}
                                aria-label="Code input area"
                                aria-describedby="code-input-help"
                            />
                        </div>

                    
                        <div className={cn(
                            "flex items-center justify-between",
                            "px-4 py-3",
                            "bg-zinc-900/80",
                            "border-t border-zinc-800",
                            "gap-4"
                        )}>
                
                            <div className="flex items-center gap-3 flex-wrap">
                                <span
                                    className={cn(
                                    "font-mono text-xs",
                                    isTooLong  ? "text-red-400"    :
                                    isTooShort ? "text-amber-400"  :
                                    charCount > 0 ? "text-green-400" :
                                    "text-zinc-600"
                                    )}
                                    aria-live="polite"
                                    aria-label={`${charCount} characters`}
                                >
                                    {charCount.toLocaleString()} chars
                                </span>

                        
                                {lineCount > 0 && (
                                    <span className="font-mono text-xs text-zinc-600">
                                    {lineCount} lines
                                    </span>
                                )}

                                {isTooShort && (
                                    <Badge variant="warning">
                                    Needs more code
                                    </Badge>
                                )}

                        
                                {isTooLong && (
                                    <Badge variant="error">
                                    Too large — split into smaller files
                                    </Badge>
                                )}

                                {canAnalyze && (
                                    <span className="text-xs text-zinc-600 hidden sm:block" id="code-input-help">
                                    ⌘ Enter to analyze
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">

                                {code.length > 0 && (
                                    <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCode("")}
                                    aria-label="Clear code input"
                                    >
                                    Clear
                                    </Button>
                                )}

                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAnalyze}
                                    disabled={!canAnalyze}
                                    isLoading={status === "parsing"}
                                    rightIcon={
                                    status !== "parsing" ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    ) : undefined
                                    }
                                >
                                    {status === "parsing" ? "Analyzing..." : "Analyze"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-zinc-600 text-xs mt-4">
                    DevMind processes code locally in your browser. Nothing is stored without your permission.
                    </p>
                </div>
        </section>
    )
}