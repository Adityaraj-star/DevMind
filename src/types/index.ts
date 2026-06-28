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
    graphData?: GraphData
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


// ParsedFile - what the code parser extracts from a single file
export type ParsedFile = {
    path: string
    name: string
    type: 'component' | 'hook' | 'util' | 'config'
    imports: string[]
    exports: string[]
    linesOfCode: number
    rawCode: string
} 

// GraphNode - a node in the D3 force graph.
export type GraphNode = ParsedFile & {
    id: string
    index?: number
    x?: number
    y?: number
    vx?: number
    vy?: number
    fx?: number | null  // null = let simulation control, number = pin here
    fy?: number | null
}

// GraphLink - a directed edge between two nodes
export type GraphLink = {
    source: string | GraphNode  // string before D3 processes, GraphNode after
    target: string | GraphNode
    value?: number              // optional link strength (stronger = nodes pulled closer)
}

// GraphData - the complete parsed graph handed to D3.
export type GraphData = {
    nodes: GraphNode[]
    links: GraphLink[]

    stats: {
        totalFiles: number
        totalLines: number
        componentCount: number
        hookCount: number
        utilCount: number
        configCount: number
        avgLinesPerFile: number
        mostConnected: string       // filename of the most-imported file
    }
}


// SelectedNode - which node the user clicked on
export type SelectedNode = GraphNode | null

// GraphViewState - local UI state inside the graph viewer
export type GraphViewState = {
    selectedNode: SelectedNode
    showInfoPanel: boolean
    activeFilter: 'all' | 'component' | 'hook' | 'util' | 'config'
    transform: { x: number; y: number; k: number }
}