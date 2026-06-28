import { useRef, useEffect, useCallback, useState } from "react"
import * as d3 from "d3"
 
interface ZoomTransform {
    x: number
    y: number
    k: number   // k = scale (zoom level)
}
 
interface UseZoomReturn {
    svgRef: React.RefObject<SVGSVGElement | null>
    transform: ZoomTransform
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void
}
 
export function useZoom(initialScale = 1): UseZoomReturn {
    const svgRef = useRef<SVGSVGElement | null>(null)
 
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
 
    const [transform, setTransform] = useState<ZoomTransform>({
        x: 0, y: 0, k: initialScale
    })
 
    useEffect(() => {
        if (!svgRef.current) return
 
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
                const { x, y, k } = event.transform
                setTransform({ x, y, k })
            })
 
        const svgEl = svgRef.current
        d3.select(svgEl).call(zoom)
        zoomRef.current = zoom
 
        const { width, height } = svgEl.getBoundingClientRect()
        const centerTransform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(initialScale)
 
        
        d3.select(svgEl).call(zoom.transform, centerTransform)
 
        // CLEANUP: Remove D3's event listeners when component unmounts
        return () => {
            d3.select(svgEl).on(".zoom", null)
        }
    }, [initialScale])
 
    const zoomIn = useCallback(() => {
        if (!svgRef.current || !zoomRef.current) return
        d3.select(svgRef.current)
            .transition()
            .duration(200)
            .call(zoomRef.current.scaleBy, 1.4)
    }, [])
 
    const zoomOut = useCallback(() => {
        if (!svgRef.current || !zoomRef.current) return
        d3.select(svgRef.current)
            .transition()
            .duration(200)
            .call(zoomRef.current.scaleBy, 1 / 1.4)
    }, [])
 
    const resetZoom = useCallback(() => {
        if (!svgRef.current || !zoomRef.current) return
        const { width, height } = svgRef.current.getBoundingClientRect()
        const centerTransform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(0.85)
 
        d3.select(svgRef.current)
            .transition()
            .duration(400)
            .call(zoomRef.current.transform, centerTransform)
    }, [])
 
    return { svgRef, transform, zoomIn, zoomOut, resetZoom }
}