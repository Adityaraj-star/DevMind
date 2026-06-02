import type { FileNode } from "../types"

// combine CSS classes name conditionally
export function cn(
    ...classes: (string | boolean | undefined | null)[]
): string {
    return classes.filter(Boolean).join(" ")
}

export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2)}`
}

// shorten long file paths for display
export function truncate(str: string, max = 20): string {
    if (str.length <= max) return str
    return str.substring(0, max - 3) + '...'
}

export function getFileExtension(filename: string): string {
    return filename.split('.').pop() ?? ''
} 

export function formatDate(date: Date): string {
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

    if (diffSeconds < 60) return rtf.format(-diffSeconds, "second")
    if (diffSeconds < 3600) return rtf.format(-Math.floor(diffSeconds / 60), "minute")
    if (diffSeconds < 86400) return rtf.format(-Math.floor(diffSeconds / 3600), "hour")
    return rtf.format(-Math.floor(diffSeconds / 86400), "day")
}


export function getNodeColor(type: FileNode["type"]): string {
    const colorMap: Record<FileNode["type"], string> = {
        component: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        hook: "bg-teal-500/20 text-teal-300 border-teal-500/30",
        util: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        config: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    }
    return colorMap[type]
}