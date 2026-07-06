import { useRef, useEffect, useCallback, useState } from "react"
import * as d3 from "d3"
import type { GraphData, GraphNode, GraphLink } from "../types"

// FORCE SIMULATION CONFIG
const FORCE_CONFIG = {
    chargeStrength: -400,   // How strongly nodes repel each other
    linkDistance: 120,      // The "ideal" length of each link (in pixels)
    centerStrength: 0.1,    // How strongly the center force pulls all nodes toward (0,0)
    collisionRadius: 35,    // Minimum distance between node centers
    alphaDecay: 0.02,       // How many ticks to run before "cooling" (slowing down the simulation)
}

interface UseGraphEngineReturn {
    nodes: GraphNode[]      // Current node positions
    links: GraphLink[]
    isSimulating: boolean
    dragNode: (nodeId: string, x: number, y: number) => void       // Call this when user drags a node — fixes it at that position
    releaseNode: (nodeId: string) => void       // Call this when drag ends — releases the node back to simulation
    restart: () => void
    stop: () => void
}

export function useGraphEngine(graphData: GraphData | null): UseGraphEngineReturn {
    // Keep the D3 simulation instance across renders
    const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null)

    // Mutable graph data used directly by D3
    const nodesRef = useRef<GraphNode[]>([])
    const linksRef = useRef<GraphLink[]>([])

    // Force React to re-render whenever D3 updates node positions
    const [, setTick] = useState(0)
    const [isSimulating, setIsSimulating] = useState(false)

    const rafScheduledRef = useRef(false)

    useEffect(() => {
        if (!graphData || graphData.nodes.length === 0) return

        // Clone incoming data so D3 can safely mutate positions
        nodesRef.current = graphData.nodes.map(n => ({ ...n }))
        linksRef.current = graphData.links.map(l => ({ ...l }))

        // Stop any existing simulation before creating a new one
        if (simulationRef.current) {
            simulationRef.current.stop()
        }

        setIsSimulating(true)

        const linkForce = d3.forceLink<GraphNode, GraphLink>(linksRef.current)
            .id(d => d.id)
            .distance(FORCE_CONFIG.linkDistance)
            .strength(0.5)

        const simulation = d3.forceSimulation<GraphNode>(nodesRef.current)
            .force("link", linkForce)
            .force("charge", d3.forceManyBody<GraphNode>().strength(FORCE_CONFIG.chargeStrength))
            .force("center", d3.forceCenter(0, 0).strength(FORCE_CONFIG.centerStrength))
            .force("collision", d3.forceCollide<GraphNode>().radius(FORCE_CONFIG.collisionRadius))
            .alphaDecay(FORCE_CONFIG.alphaDecay)

        simulation.on("tick", () => {
            scheduleRender()
        })

        simulation.on("end", () => {
            setIsSimulating(false)
        })

        simulationRef.current = simulation

        function scheduleRender() {
            if (rafScheduledRef.current) return
            rafScheduledRef.current = true
            requestAnimationFrame(() => {
                rafScheduledRef.current = false
                setTick(n => n + 1)
            })
        }

        return () => {
            simulation.stop()
            setIsSimulating(false)
        }
    }, [graphData])

    // Lock a node to the cursor while dragging
    const dragNode = useCallback((nodeId: string, x: number, y: number) => {
        const node = nodesRef.current.find(n => n.id === nodeId)
        if (!node) return

        node.fx = x
        node.fy = y

        simulationRef.current?.alphaTarget(0.3).restart()
    }, [])

    // release the node so the simulation controls it again
    const releaseNode = useCallback((nodeId: string) => {
        const node = nodesRef.current.find(n => n.id === nodeId)
        if (!node) return

        node.fx = null
        node.fy = null

        simulationRef.current?.alphaTarget(0)
    }, [])


    const restart = useCallback(() => {
        simulationRef.current?.alpha(1).restart()
        setIsSimulating(true)
    }, [])

    const stop = useCallback(() => {
        simulationRef.current?.stop()
        setIsSimulating(false)
    }, [])

    return {
        // Return the mutated copies
        nodes: nodesRef.current,
        links: linksRef.current as GraphLink[],
        isSimulating,
        dragNode,
        releaseNode,
        restart,
        stop,
    }
}