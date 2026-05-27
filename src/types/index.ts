export type FileNode = {
    id: string 
    name: string
    path: string
    type: 'component' | 'hook' | 'util' | 'config'
    imports: string[]
    exports: string[]
    linesOfCode: number
}

export type GraphEdge = {
    id: string
    source: string
    target: string
}

export type Theme = 'dark' | 'light'

export type AnalysisStatus = 'idle' | 'parsing' | 'ready' | 'error'