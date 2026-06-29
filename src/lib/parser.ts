import type { ParsedFile, GraphNode, GraphLink, GraphData } from "../types"

const IMPORT_REGEX = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/gm
const EXPORT_NAMED_REGEX = /export\s+(?:default\s+)?(?:function|const|class|type|interface|enum)\s+(\w+)/gm
const EXPORT_BRACES_REGEX = /export\s*\{([^}]+)\}/gm
const REQUIRE_REGEX = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/gm

export function parseCode(code: string, filename: string): ParsedFile {
    const imports = extractImports(code)
    const exports = extractExports(code)
    const linesOfCode = countLines(code)
    const type = detectFileType(filename)
    const name = getFilename(filename)

    return {
        path: filename,
        name,
        type,
        imports,
        exports,
        linesOfCode,
        rawCode: code,
    }
}

function extractImports(code: string): string[] {
    const imports: string[] = []

    // ES6 imports
    const esMatches = [...code.matchAll(new RegExp(IMPORT_REGEX.source, 'gm'))]
    for (const match of esMatches) {
        if (match[1]) imports.push(match[1])
    }

    // CommonJS requires
    const cjsMatches = [...code.matchAll(new RegExp(REQUIRE_REGEX.source, 'gm'))]
    for (const match of cjsMatches) {
        if (match[1]) imports.push(match[1])
    }

    return [...new Set(imports)]
}   

function extractExports(code: string): string[] {
    const exports: string[] = []

    const namedMatches = [...code.matchAll(new RegExp(EXPORT_NAMED_REGEX.source, 'gm'))]
    for (const match of namedMatches) {
        if (match[1]) exports.push(match[1])
    }

    const braceMatches = [...code.matchAll(new RegExp(EXPORT_BRACES_REGEX.source, 'gm'))]
    for (const match of braceMatches) {
        if (match[1]) {
            // match[1] = "X, Y as Z, W" - split by comma, strip "as Alias" and whitespace
            const names = match[1].split(',').map(n => n.split(' as ')[0].trim()).filter(Boolean)
            exports.push(...names)
        }
    }

    return [...new Set(exports)]
}


function countLines(code: string): number {
    return code.split('\n').filter(Boolean).length
}

function detectFileType(path: string): ParsedFile['type'] {
    const filename = getFilename(path).toLowerCase()
    const basename = filename.replace(/\.(tsx?|jsx?|js|ts)$/, '') 

    if (
        filename.includes('config') ||
        filename.includes('setup') ||
        filename.includes('tailwind') ||
        filename.includes('vite') ||
        filename === 'index.ts' ||
        filename === 'index.tsx'
    ) {
        return 'config'
    }

    if (basename.startsWith('use')) {
        return 'hook'
    }

    if (/^[A-Z]/.test(basename) && (path.endsWith('.tsx') || path.endsWith('.jsx'))) {
        return 'component'
    }

    return 'util'
}

function getFilename(path: string): string {
    return path.split(/[/\\]/).pop() ?? path
}

const PASTE_FILE_DELIMITER = /^\/\/\s*-{2,}\s*file:\s*(.+?)\s*-{2,}\s*$/gm

export function parsePastedCode(
    code: string,
    language: "javascript" | "typescript"
): GraphData {
    const ext = language === "typescript" ? "tsx" : "jsx"
    const files = splitPastedFiles(code, ext)

    const nodes: GraphNode[] = files.map(({ path, content }) => {
        const parsed = parseCode(content, path)
        return { ...parsed, id: parsed.path }
    })

    return buildGraphData(nodes)
}

function splitPastedFiles(
    code: string,
    fallbackExt: string
): { path: string; content: string }[] {
    const matches = [...code.matchAll(new RegExp(PASTE_FILE_DELIMITER.source, 'gm'))]

    // No delimiters found → treat the whole paste as one file
    if (matches.length === 0) {
        return [{ path: `pasted.${fallbackExt}`, content: code }]
    }

    const files: { path: string; content: string }[] = []

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i]
        const filename = match[1].trim()
        
        const contentStart = match.index! + match[0].length
        const contentEnd = i + 1 < matches.length ? matches[i + 1].index! : code.length

        const content = code.slice(contentStart, contentEnd).trim()
        if (content.length > 0) {
            files.push({ path: filename, content })
        }
    }

    return files
}

export function buildGraphDataFromFiles(
    files: { path: string; content: string }[]
): GraphData {
    const nodes: GraphNode[] = files.map(({ path, content }) => {
        const parsed = parseCode(content, path)
        return { ...parsed, id: parsed.path }
    })

    return buildGraphData(nodes)
}

export function buildGraphData(nodes: GraphNode[]): GraphData {
    const links: GraphLink[] = [] 
    const nodePathArray = nodes.map(n => n.path)

    for (const node of nodes) {
        for (const importPath of node.imports) {
            // Skip external packages (no dot at start = node_modules)
            if (!importPath.startsWith('.')) continue

            // Try to find which node this import resolves to
            const resolvedPath = resolveImportPath(importPath, node.path, nodePathArray)
            if (resolvedPath && resolvedPath !== node.path) {
                links.push({
                    source: node.path,    // D3 replaces this with the actual GraphNode
                    target: resolvedPath,
                })
            }
        }
    }

    // Calculate stats for the info panel
    const stats = calculateStats(nodes, links)

    return { nodes, links, stats }
}

function resolveImportPath(
    importPath: string,
    fromPath: string,
    allPaths: string[]
): string | null {
    const cleanImport = importPath.replace(/^[./]+/, '')

    if (!cleanImport) return null

    const extensions = ['', '.ts', '.tsx', '.js', '.jsx']

    for (const ext of extensions) {
        const candidate = cleanImport + ext
        const found = allPaths.find(p =>
            p.endsWith(candidate) || p.includes(`/${candidate}`)
        )
        if (found) return found
    }

    const indexCandidate = `${cleanImport}/index`
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        const found = allPaths.find(p => p.endsWith(indexCandidate + ext))
        if (found) return found
    }

    return null
}

function calculateStats(nodes: GraphNode[], links: GraphLink[]) {
    const importCounts = new Map<string, number>()
    for (const link of links) {
        const targetId = typeof link.target === 'string' ? link.target : link.target.id
        importCounts.set(targetId, (importCounts.get(targetId) ?? 0) + 1)
    }

    let mostConnected = ''
    let maxCount = 0
    for (const [id, count] of importCounts) {
        if (count > maxCount) {
            maxCount = count
            mostConnected = id
        }
    }

    const mostConnectedName = mostConnected
        ? getFilename(mostConnected)
        : nodes[0]?.name ?? 'none'

    const totalLines = nodes.reduce((sum, n) => sum + n.linesOfCode, 0)

    return {
        totalFiles: nodes.length,
        totalLines,
        componentCount: nodes.filter(n => n.type === 'component').length,
        hookCount: nodes.filter(n => n.type === 'hook').length,
        utilCount: nodes.filter(n => n.type === 'util').length,
        configCount: nodes.filter(n => n.type === 'config').length,
        avgLinesPerFile: nodes.length > 0 ? Math.round(totalLines / nodes.length) : 0,
        mostConnected: mostConnectedName,
    }
}

export function generateDemoGraphData(): GraphData {
    const demoFiles: GraphNode[] = [
        {
            id: 'src/App.tsx', path: 'src/App.tsx', name: 'App.tsx',
            type: 'component', imports: ['react-router-dom', './context/AppContext'],
            exports: ['App'], linesOfCode: 28, rawCode: '',
        },
        {
            id: 'src/context/AppContext.tsx', path: 'src/context/AppContext.tsx',
            name: 'AppContext.tsx', type: 'component',
            imports: ['react', '../lib/reducer', '../types'],
            exports: ['AppProvider', 'useAppContext'], linesOfCode: 72, rawCode: '',
        },
        {
            id: 'src/lib/reducer.ts', path: 'src/lib/reducer.ts',
            name: 'reducer.ts', type: 'util',
            imports: ['../types'],
            exports: ['appReducer', 'initialState', 'saveAnalysesToStorage'],
            linesOfCode: 95, rawCode: '',
        },
        {
            id: 'src/lib/utils.ts', path: 'src/lib/utils.ts',
            name: 'utils.ts', type: 'util',
            imports: ['../types'],
            exports: ['cn', 'generateId', 'formatDate', 'truncate', 'extractRepoName'],
            linesOfCode: 68, rawCode: '',
        },
        {
            id: 'src/types/index.ts', path: 'src/types/index.ts',
            name: 'index.ts', type: 'config',
            imports: [],
            exports: ['FileNode', 'GraphEdge', 'Theme', 'AnalysisStatus', 'AppState', 'AppAction'],
            linesOfCode: 85, rawCode: '',
        },
        {
            id: 'src/components/ui/Button.tsx', path: 'src/components/ui/Button.tsx',
            name: 'Button.tsx', type: 'component',
            imports: ['react', '../../lib/utils'],
            exports: ['Button'], linesOfCode: 116, rawCode: '',
        },
        {
            id: 'src/components/ui/Badge.tsx', path: 'src/components/ui/Badge.tsx',
            name: 'Badge.tsx', type: 'component',
            imports: ['react', '../../lib/utils'],
            exports: ['Badge'], linesOfCode: 36, rawCode: '',
        },
        {
            id: 'src/components/ui/Input.tsx', path: 'src/components/ui/Input.tsx',
            name: 'Input.tsx', type: 'component',
            imports: ['react', '../../lib/utils'],
            exports: ['Input'], linesOfCode: 68, rawCode: '',
        },
        {
            id: 'src/components/layout/Navbar.tsx', path: 'src/components/layout/Navbar.tsx',
            name: 'Navbar.tsx', type: 'component',
            imports: ['react', 'react-router-dom', '../../context/AppContext', '../ui/Button'],
            exports: ['Navbar'], linesOfCode: 78, rawCode: '',
        },
        {
            id: 'src/components/layout/Sidebar.tsx', path: 'src/components/layout/Sidebar.tsx',
            name: 'Sidebar.tsx', type: 'component',
            imports: ['react', 'react-router-dom', '../../context/AppContext', '../../hooks/useDebounce'],
            exports: ['Sidebar'], linesOfCode: 148, rawCode: '',
        },
        {
            id: 'src/components/layout/PageShell.tsx', path: 'src/components/layout/PageShell.tsx',
            name: 'PageShell.tsx', type: 'component',
            imports: ['react', '../../context/AppContext', './Navbar', './Sidebar'],
            exports: ['PageShell'], linesOfCode: 42, rawCode: '',
        },
        {
            id: 'src/hooks/useDebounce.ts', path: 'src/hooks/useDebounce.ts',
            name: 'useDebounce.ts', type: 'hook',
            imports: ['react'],
            exports: ['useDebounce'], linesOfCode: 18, rawCode: '',
        },
        {
            id: 'src/pages/Home.tsx', path: 'src/pages/Home.tsx',
            name: 'Home.tsx', type: 'component',
            imports: ['react', 'react-router-dom', '../context/AppContext', '../components/layout/PageShell'],
            exports: ['Home'], linesOfCode: 88, rawCode: '',
        },
        {
            id: 'src/pages/Analyze.tsx', path: 'src/pages/Analyze.tsx',
            name: 'Analyze.tsx', type: 'component',
            imports: ['react', 'react-hook-form', 'react-router-dom', '../context/AppContext'],
            exports: ['Analyze'], linesOfCode: 152, rawCode: '',
        },
        {
            id: 'src/pages/AnalysisDetail.tsx', path: 'src/pages/AnalysisDetail.tsx',
            name: 'AnalysisDetail.tsx', type: 'component',
            imports: ['react', 'react-router-dom', '../context/AppContext', '../lib/parser'],
            exports: ['AnalysisDetail'], linesOfCode: 198, rawCode: '',
        },
    ]

    return buildGraphData(demoFiles)
}