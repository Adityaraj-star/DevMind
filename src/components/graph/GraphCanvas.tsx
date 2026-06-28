import { useMemo, useCallback, useRef, useState } from "react"
import { useGraphEngine } from "../../hooks/useGraphEngine"
import { useZoom } from "../../hooks/useZoom"
import { cn } from "../../lib/utils"
import type { GraphData, GraphNode, SelectedNode, GraphLink } from "../../types"

const NODE_COLORS: Record<GraphNode['type'], { fill: string; stroke: string; label: string }> = {
    component: { fill: '#7c3aed22', stroke: '#7c3aed', label: '#a78bfa' },  // violet
    hook:      { fill: '#0d948822', stroke: '#0d9488', label: '#5eead4' },  // teal
    util:      { fill: '#d9770622', stroke: '#d97706', label: '#fbbf24' },  // amber
    config:    { fill: '#1d4ed822', stroke: '#1d4ed8', label: '#60a5fa' },  // blue
}

function getNodeRadius(linesOfCode: number): number {
    return Math.max(12, Math.min(28, 8 + Math.sqrt(linesOfCode) * 0.8))
}

interface GraphCanvasProps {
    graphData: GraphData
    selectedNode: SelectedNode
    onNodeClick: (node: GraphNode) => void
    onCanvasClick: () => void    // clicking empty space deselects
    activeFilter: 'all' | GraphNode['type']
    className?: string
}

export function GraphCanvas({
    graphData,
    selectedNode,
    onNodeClick,
    onCanvasClick,
    activeFilter,
    className,
}: GraphCanvasProps) {
    const { nodes, links, isSimulating, dragNode, releaseNode } = useGraphEngine(graphData)

    const { svgRef, transform, zoomIn, zoomOut, resetZoom } = useZoom(0.85)

    const [draggingId, setDraggingId] = useState<string | null>(null)

    const isDragging = useRef(false)

    const visibleNodes = useMemo(() => {
        if (activeFilter === 'all') return nodes
        return nodes.filter(n => n.type === activeFilter)
    }, [nodes, activeFilter])

    const visibleNodeIds = useMemo(
        () => new Set(visibleNodes.map(n => n.id)),
        [visibleNodes]
    )

    const visibleLinks = useMemo(() => {
        return links.filter(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id
            return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId)
        })
    }, [links, visibleNodeIds])

    const handleNodeMouseDown = useCallback((
        e: React.MouseEvent<SVGGElement>,
        node: GraphNode
    ) => {
        e.stopPropagation()    // prevent canvas click from also firing
        isDragging.current = true
        setDraggingId(node.id)

        dragNode(node.id, node.x ?? 0, node.y ?? 0)

        const svg = svgRef.current
        if (!svg) return

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isDragging.current) return
            const rect = svg.getBoundingClientRect()

            // Convert screen coordinates to SVG coordinate space
            const svgX = (moveEvent.clientX - rect.left - transform.x) / transform.k
            const svgY = (moveEvent.clientY - rect.top - transform.y) / transform.k

            dragNode(node.id, svgX, svgY)
        }

        const handleMouseUp = () => {
            isDragging.current = false
            setDraggingId(null)
            releaseNode(node.id)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }, [dragNode, releaseNode, transform, svgRef])


    const handleNodeClick = useCallback((
        e: React.MouseEvent,
        node: GraphNode
    ) => {
        e.stopPropagation()
        // Don't fire click if this was actually a drag (user moved mouse)
        if (!isDragging.current) {
            onNodeClick(node)
        }
    }, [onNodeClick])


    return (
        <div className={cn("relative w-full h-full", className)}>

            {isSimulating && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                    flex items-center gap-2 px-3 py-1.5 rounded-full
                    bg-zinc-900/90 border border-zinc-700 text-xs text-zinc-400"
                    aria-live="polite"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    Calculating layout…
                </div>
            )}

            <svg
                ref={svgRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onClick={onCanvasClick}
                aria-label="Code architecture graph"
                role="img"
            >
                <defs>

                    <marker
                        id="arrowhead"
                        viewBox="0 -5 10 10"
                        refX="20"      // offset from line end (leave space for node circle)
                        refY="0"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"  // rotate to match line direction
                    >
                        <path d="M0,-5L10,0L0,5" fill="#3f3f46" />
                    </marker>

                </defs>

                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>

                    <g aria-hidden="true">
                        {visibleLinks.map((link, i) => {
                            // after D3 processes links, source and target are GraphNode objects
                            // (not strings anymore)
                            const source = link.source as GraphNode
                            const target = link.target as GraphNode

                            // if D3 hasn't placed nodes yet (x/y undefined), skip rendering
                            if (source.x == null || target.x == null) return null

                            const isHighlighted = selectedNode && (
                                source.id === selectedNode.id ||
                                target.id === selectedNode.id
                            )

                            return (
                                <line
                                    key={i}
                                    x1={source.x}
                                    y1={source.y}
                                    x2={target.x}
                                    y2={target.y}
                                    stroke={isHighlighted ? '#7c3aed' : '#3f3f46'}
                                    strokeWidth={isHighlighted ? 1.5 : 1}
                                    strokeOpacity={isHighlighted ? 0.8 : 0.4}
                                    markerEnd="url(#arrowhead)"  // attach the arrowhead marker
                                />
                            )
                        })}
                    </g>

                    <g>
                        {visibleNodes.map((node) => {
                            // D3 hasn't placed this node yet so skip
                            if (node.x == null || node.y == null) return null

                            const colors = NODE_COLORS[node.type]
                            const radius = getNodeRadius(node.linesOfCode)
                            const isSelected = selectedNode?.id === node.id
                            const isDraggingThis = draggingId === node.id

                            // determine if this node is connected to the selected node
                            const isConnected = selectedNode && links.some(link => {
                                const sourceId = typeof link.source === 'string' ? link.source : link.source.id
                                const targetId = typeof link.target === 'string' ? link.target : link.target.id
                                return (
                                    (sourceId === selectedNode.id && targetId === node.id) ||
                                    (targetId === selectedNode.id && sourceId === node.id)
                                )
                            })

                            // when a node is selected, dim all unconnected, unselected nodes
                            const isDimmed = selectedNode && !isSelected && !isConnected

                            return (
                                // <g> groups the circle + label together as one unit
                                // we attach events to the group (so clicking label = same as clicking circle)
                                <g
                                    key={node.id}
                                    transform={`translate(${node.x}, ${node.y})`}
                                    onClick={(e) => handleNodeClick(e, node)}
                                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                                    style={{
                                        cursor: isDraggingThis ? 'grabbing' : 'pointer',
                                        opacity: isDimmed ? 0.25 : 1,
                                        transition: 'opacity 0.2s ease',
                                    }}
                                    role="button"
                                    aria-label={`${node.name} — ${node.type}, ${node.linesOfCode} lines`}
                                    aria-pressed={isSelected}
                                >
                                    {/* Outer glow ring — only shown when selected */}
                                    {isSelected && (
                                        <circle
                                            r={radius + 6}
                                            fill="none"
                                            stroke={colors.stroke}
                                            strokeWidth={2}
                                            strokeOpacity={0.4}
                                        />
                                    )}

                                    {/* Main node circle */}
                                    <circle
                                        r={radius}
                                        fill={colors.fill}
                                        stroke={isSelected ? colors.stroke : colors.stroke}
                                        strokeWidth={isSelected ? 2 : 1.5}
                                        strokeOpacity={isSelected ? 1 : 0.6}
                                    />

                                    {/* Node type indicator dot — tiny dot at center */}
                                    <circle
                                        r={3}
                                        fill={colors.stroke}
                                        opacity={0.8}
                                    />

                                    {/* File name label */}
                                    {/* dy="..." positions text relative to node center */}
                                    {/* dy={radius + 14} puts text just below the circle */}
                                    <text
                                        dy={radius + 14}
                                        textAnchor="middle"     // center the text horizontally
                                        fontSize={10}
                                        fill={isSelected ? colors.label : '#71717a'}
                                        fontFamily="ui-monospace, monospace"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {/* Truncate long names to prevent label overflow */}
                                        {node.name.length > 18
                                            ? node.name.slice(0, 16) + '…'
                                            : node.name
                                        }
                                    </text>
                                </g>
                            )
                        })}
                    </g>
                </g>
            </svg>

            <div className="absolute bottom-6 right-6 flex flex-col gap-1.5">
                <button
                    onClick={zoomIn}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700
                        text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800
                        flex items-center justify-center transition-colors text-lg font-light"
                    aria-label="Zoom in"
                >
                    +
                </button>
                <button
                    onClick={zoomOut}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700
                        text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800
                        flex items-center justify-center transition-colors text-lg font-light"
                    aria-label="Zoom out"
                >
                    −
                </button>
                <button
                    onClick={resetZoom}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700
                        text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800
                        flex items-center justify-center transition-colors"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                >
                    <svg 
                        width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

