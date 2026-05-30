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