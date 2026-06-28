import { cn } from "../../lib/utils"
import type { GraphData, GraphNode } from "../../types"

type FilterType = 'all' | GraphNode['type']

const FILTER_DOTS: Record<FilterType, string> = {
    all:       'bg-zinc-400',
    component: 'bg-violet-400',
    hook:      'bg-teal-400',
    util:      'bg-amber-400',
    config:    'bg-blue-400',
}

interface GraphStatsBarProps {
    graphData: GraphData
    activeFilter: FilterType
    onFilterChange: (filter: FilterType) => void
    isSimulating: boolean
}


export function GraphStatsBar({
    graphData,
    activeFilter,
    onFilterChange,
    isSimulating,
}: GraphStatsBarProps) {
    const { stats } = graphData

    const filterOptions: { key: FilterType; label: string; count: number }[] = [
        { key: 'all' as const, label: 'All', count: stats.totalFiles },
        { key: 'component' as const, label: 'Components', count: stats.componentCount },
        { key: 'hook' as const, label: 'Hooks', count: stats.hookCount },
        { key: 'util' as const, label: 'Utils', count: stats.utilCount },
        { key: 'config' as const, label: 'Config', count: stats.configCount },
    ].filter(opt => opt.key === 'all' || opt.count > 0)


    return (
        <div className={cn(
            "flex items-center justify-between gap-4 flex-wrap",
            "px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-950/80",
            "backdrop-blur-sm"
        )}>

            <div className="flex items-center gap-3 flex-wrap">
                <StatPill label="Files" value={stats.totalFiles} />
                <span className="text-zinc-800" aria-hidden="true">·</span>

                <StatPill label="Lines" value={stats.totalLines.toLocaleString()} />
                <span className="text-zinc-800" aria-hidden="true">·</span>

                <StatPill label="Avg lines/file" value={stats.avgLinesPerFile} />

                {stats.mostConnected && stats.mostConnected !== 'none' && (
                    <>
                        <span className="text-zinc-800" aria-hidden="true">·</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-zinc-600">Most imported:</span>
                            <span className="text-[11px] font-mono text-amber-400">
                                {stats.mostConnected}
                            </span>
                        </div>
                    </>
                )}            
            </div>

            <div className="flex items-center gap-1" role="group" aria-label="Filter by node type">
                {filterOptions.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => onFilterChange(opt.key)}
                        // aria-pressed: communicates toggle state to screen readers
                        aria-pressed={activeFilter === opt.key}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px]",
                            "font-medium transition-colors duration-100",
                            activeFilter === opt.key
                                ? "bg-zinc-800 text-zinc-100"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                        )}
                    >
                        {/* Colored dot indicator */}
                        <span
                            className={cn("w-1.5 h-1.5 rounded-full", FILTER_DOTS[opt.key])}
                            aria-hidden="true"
                        />
                        {opt.label}
                        {/* Count badge */}
                        <span className={cn(
                            "ml-0.5",
                            activeFilter === opt.key ? "text-zinc-400" : "text-zinc-600"
                        )}>
                            {opt.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

interface StatPillProps {
    label: string
    value: number | string
}

function StatPill({ label, value }: StatPillProps) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-600">{label}</span>
            <span className="text-[11px] font-mono font-medium text-zinc-300">{value}</span>
        </div>
    )
}