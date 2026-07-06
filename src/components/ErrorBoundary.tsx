import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "./ui/Button"
import { cn } from "../lib/utils"

interface ErrorBoundaryProps {
    children: ReactNode
    section?: string
    onReset?: () => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

     // updates state when a descendant throws during rendering
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    // Runs after an error is caught
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(
            `[DevMind] Error boundary caught an error${this.props.section ? ` in ${this.props.section}` : ''}:`,
            error,
            errorInfo.componentStack
        )
    }

    handleReset = () => {
        // Clear the error state and allow the subtree to render again
        this.setState({ hasError: false, error: null })
        this.props.onReset?.()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={cn(
                    "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
                    "min-h-75"
                )}>
                    <div className={cn(
                        "w-14 h-14 rounded-2xl mb-2",
                        "bg-red-500/10 border border-red-500/20",
                        "flex items-center justify-center"
                    )}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.5"
                            className="text-red-400" aria-hidden="true">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <path d="M12 9v4M12 17h.01" />
                        </svg>
                    </div>
                    <h2 className="text-base font-semibold text-zinc-200">
                        {this.props.section
                            ? `Something went wrong in ${this.props.section}`
                            : "Something went wrong"}
                    </h2>
                    <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                        This is likely caused by unexpected data — DevMind hit
                        a case it didn't know how to render. Your other analyses
                        and saved data are unaffected.
                    </p>
                    
                    {this.state.error && (
                        <p className="text-xs text-zinc-700 font-mono max-w-md truncate">
                            {this.state.error.message}
                        </p>
                    )}
                    <Button variant="secondary" size="sm" onClick={this.handleReset}>
                        Try again
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}