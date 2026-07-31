import type { GitHubRepoInfo, GitHubTreeEntry, GitHubFetchError } from "../types"

const GITHUB_API_BASE = "https://api.github.com"
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com"

export const MAX_FILES = 60

// Supported source file extensions
const PARSEABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

// Directories that are ignored during repository analysis
const EXCLUDED_DIR_SEGMENTS = new Set([
    'node_modules', 'dist', 'build', '.git', '.next', '.turbo',
    'coverage', '__tests__', '__mocks__', 'fixtures', 'vendor',
])

// Ignore test files, declaration files and tooling configs
const EXCLUDED_FILENAME_PATTERNS = [
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
    /\.d\.ts$/,            // type declaration files have no real imports/exports to graph
    /^\.eslintrc/,
]

// Extract repository metadata from a GitHub URL
export function parseGitHubUrl(rawUrl: string): GitHubRepoInfo | null {
    try {
        const normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
        const url = new URL(normalized)

        if (url.hostname !== 'github.com') return null

        const parts = url.pathname.split('/').filter(Boolean)
        if (parts.length < 2) return null

        const owner = parts[0]
        const repo = parts[1].replace(/\.git$/, '')

        let branch: string | undefined
        let path: string | undefined

        if (parts[2] === 'tree' && parts[3]) {
            branch = parts[3]
            if (parts.length > 4) {
                path = parts.slice(4).join('/')
            }
        }

        return { owner, repo, branch, path }
    } catch {
        return null
    }
}

export type RateLimitInfo = {
    remaining: number
    limit: number
    resetAt: number   // unix timestamp, seconds
}

// Read GitHub API rate limit information from response headers
function readRateLimitHeaders(response: Response): RateLimitInfo | null {
    const remaining = response.headers.get('x-ratelimit-remaining')
    const limit = response.headers.get('x-ratelimit-limit')
    const reset = response.headers.get('x-ratelimit-reset')

    if (remaining == null || limit == null || reset == null) return null

    return {
        remaining: parseInt(remaining, 10),
        limit: parseInt(limit, 10),
        resetAt: parseInt(reset, 10),
    }
}

// Attach authentication headers when a personal access token is available
function buildHeaders(token: string | null): HeadersInit {
    const headers: HeadersInit = {
        Accept: 'application/vnd.github+json',
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }
    return headers
}

// resolve the repository's default branch when one isn't specified
async function resolveDefaultBranch(
    owner: string,
    repo: string,
    token: string | null,
    onRateLimit?: (info: RateLimitInfo) => void
): Promise<string> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: buildHeaders(token),
    })

    const rateLimitInfo = readRateLimitHeaders(response)
    if (rateLimitInfo && onRateLimit) onRateLimit(rateLimitInfo)

    if (!response.ok) {
        if (response.status === 404) throw { type: 'not_found' } satisfies GitHubFetchError
        if (response.status === 403) {
            throw {
                type: 'rate_limited',
                resetAt: rateLimitInfo?.resetAt ?? Date.now() / 1000 + 3600,
            } satisfies GitHubFetchError
        }
        throw { type: 'network_error', message: `GitHub returned ${response.status}` } satisfies GitHubFetchError
    }

    const data = await response.json()
    return data.default_branch as string
}

// Fetch the complete repository tree in a single GitHub API request
export async function fetchRepoTree(
    owner: string,
    repo: string,
    branch: string,
    token: string | null,
    onRateLimit?: (info: RateLimitInfo) => void
): Promise<GitHubTreeEntry[]> {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    const response = await fetch(url, { headers: buildHeaders(token) })

    const rateLimitInfo = readRateLimitHeaders(response)
    if (rateLimitInfo && onRateLimit) onRateLimit(rateLimitInfo)

    if (!response.ok) {
        if (response.status === 404) throw { type: 'not_found' } satisfies GitHubFetchError
        if (response.status === 403) {
            throw {
                type: 'rate_limited',
                resetAt: rateLimitInfo?.resetAt ?? Date.now() / 1000 + 3600,
            } satisfies GitHubFetchError
        }
        throw { type: 'network_error', message: `GitHub returned ${response.status}` } satisfies GitHubFetchError
    }

    const data = await response.json()

    return data.tree as GitHubTreeEntry[]
}

// keep only source files that are useful for dependency analysis
export function filterRelevantFiles(entries: GitHubTreeEntry[]): GitHubTreeEntry[] {
    const filtered = entries.filter(entry => {
        if (entry.type !== 'blob') return false

        const segments = entry.path.split('/')

        if (segments.some(seg => EXCLUDED_DIR_SEGMENTS.has(seg))) return false

        const ext = '.' + (entry.path.split('.').pop() ?? '')
        if (!PARSEABLE_EXTENSIONS.has(ext)) return false

        if (EXCLUDED_FILENAME_PATTERNS.some(pattern => pattern.test(entry.path))) return false

        return true
    })

    // Prefer files closer to the project root when the repository exceeds MAX_FILES
    const sorted = filtered.sort((a, b) => {
        const depthA = a.path.split('/').length
        const depthB = b.path.split('/').length
        if (depthA !== depthB) return depthA - depthB
        return a.path.localeCompare(b.path)
    })

    return sorted.slice(0, MAX_FILES)
}

const BATCH_SIZE = 8

// Download source files in small batches to avoid excessive concurrent requests
export async function fetchFileContents(
    owner: string,
    repo: string,
    branch: string,
    entries: GitHubTreeEntry[],
    onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<{ path: string; content: string }[]> {
    const results: { path: string; content: string }[] = []
    let completed = 0

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE)

        const batchResults = await Promise.all(
            batch.map(async (entry) => {
                onProgress?.(completed, entries.length, entry.path)

                const rawUrl = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${entry.path}`

                try {
                    const response = await fetch(rawUrl)
                    if (!response.ok) {
                        return null
                    }
                    const content = await response.text()
                    return { path: entry.path, content }
                } catch {
                    return null   // network hiccup on this one file — skip it
                } finally {
                    completed += 1
                    onProgress?.(completed, entries.length, entry.path)
                }
            })
        )

        for (const result of batchResults) {
            if (result) results.push(result)
        }
    }

    return results
}

export async function fetchGitHubRepo(
    repoInfo: GitHubRepoInfo,
    token: string | null,
    callbacks?: {
        onRateLimit?: (info: RateLimitInfo) => void
        onProgress?: (phase: 'tree' | 'files', completed: number, total: number, currentFile?: string) => void
    }
): Promise<{ files: { path: string; content: string }[]; branch: string; truncated: boolean }> {
    const { owner, repo } = repoInfo

    const branch = repoInfo.branch ?? await resolveDefaultBranch(owner, repo, token, callbacks?.onRateLimit)

    callbacks?.onProgress?.('tree', 0, 1)
    const tree = await fetchRepoTree(owner, repo, branch, token, callbacks?.onRateLimit)
    callbacks?.onProgress?.('tree', 1, 1)

    const scopedTree = repoInfo.path
        ? tree.filter(entry => entry.path.startsWith(repoInfo.path! + '/'))
        : tree

    const relevant = filterRelevantFiles(scopedTree)

    if (relevant.length === 0) {
        throw { type: 'empty_repo' } satisfies GitHubFetchError
    }

    const files = await fetchFileContents(
        owner, repo, branch, relevant,
        (completed, total, currentFile) => callbacks?.onProgress?.('files', completed, total, currentFile)
    )

    return {
        files,
        branch,
        truncated: scopedTree.filter(e => e.type === 'blob').length > relevant.length,
    }
}