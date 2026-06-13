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

// one row in a database table(a saved analysis)
export type AnalysisRecord = {
    id: string
    title: string
    sourceType: "paste" | "github"
    repoUrl?: string
    language: "javascript" | "typescript"
    createdAt: string   // ISO string - safe for localStorage
    status: AnalysisStatus
    fileCount?: number
}

// entire database(all global state)
export type AppState = {
    theme: Theme
    analyses: AnalysisRecord[]
    activeAnalysisId: string | null
    sidebarOpen: boolean
    currentStatus: AnalysisStatus   // status of the current running operation
    errorMessage: string | null
}

// every allowed db operation
export type AppAction = 
    | { type: 'TOGGLE_THEME' }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'SET_SIDEBAR'; payload: boolean }
    | { type: 'ADD_ANALYSIS'; payload: AnalysisRecord }
    | { type: 'DELETE_ANALYSIS'; payload: string }
    | { type: 'SET_ACTIVE_ANALYSIS'; payload: string | null }
    | { type: 'SET_STATUS'; payload: AnalysisStatus }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'UPDATE_ANALYSIS'; payload: {id: string; updates: Partial<AnalysisRecord>} }