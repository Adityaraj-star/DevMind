// FileNode - represents one file in the codebase being analyzed
export type FileNode = {
    id: string 
    name: string
    path: string
    type: 'component' | 'hook' | 'util' | 'config'
    imports: string[]   // files this node imports become graph edges
    exports: string[]
    linesOfCode: number
}

// GraphEdge - a directed import relationship between two nodes
export type GraphEdge = {
    id: string
    source: string  // id of the node that has the import
    target: string  // id of the node being imported
}

export type Theme = 'dark' | 'light'

// AnalysisStatus - drives conditional rendering throughout the app
export type AnalysisStatus = 'idle' | 'parsing' | 'ready' | 'error'

export type AnalysisResult = {
    id: string
    nodes: FileNode[]
    edges: GraphEdge[]
    analyzedAt: Date
    sourceType: "paste" | "github"
    repoUrl?: string
    language: "javascript" | "typescript"
}