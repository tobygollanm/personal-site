import { useEffect, useState, useRef, useCallback, useImperativeHandle, useMemo } from 'react'

type Phase = 'idle' | 'firing' | 'release' | 'reveal'

type StimulateNeuronHeroProps = {
  onDone: () => void
  onPeptideImpact?: () => void
  onPeptideRelease?: () => void
}

type NeuronHandle = {
  conduct: (duration: number) => void
  axonOverlayRef: React.RefObject<SVGGElement> | null
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(media.matches)
    const handler = () => setReduced(media.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])
  return reduced
}

function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(false)
  
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.matchMedia('(orientation: landscape)').matches)
    }
    
    checkOrientation()
    const mediaQuery = window.matchMedia('(orientation: landscape)')
    mediaQuery.addEventListener('change', checkOrientation)
    
    return () => {
      mediaQuery.removeEventListener('change', checkOrientation)
    }
  }, [])
  
  return isLandscape
}

export default function StimulateNeuronHero({ onDone, onPeptideImpact, onPeptideRelease }: StimulateNeuronHeroProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const prefersReduced = usePrefersReducedMotion()
  const isLandscape = useIsLandscape()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const neuronRef = useRef<NeuronHandle>(null)
  const releaseTimeoutRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null) // Ref to SVG element for peptide positioning
  const introContainerRef = useRef<HTMLDivElement>(null)
  const scrollProgressRef = useRef<number>(0)
  const pathLengthRef = useRef<number>(0)
  const animationCompleteRef = useRef<boolean>(false)
  const scrollPositionRef = useRef<number>(0)
  const topBranchPathRef = useRef<SVGPathElement | null>(null)
  const bottomBranchPathRef = useRef<SVGPathElement | null>(null)
  const topBranchLengthRef = useRef<number>(0)
  const bottomBranchLengthRef = useRef<number>(0)

  const firingIntervalRef = useRef<number | null>(null)

  // Touch state refs (persist across renders)
  const touchStartXRef = useRef<number>(0)
  const touchStartYRef = useRef<number>(0)
  const touchStartScrollPosRef = useRef<number>(0)
  const isTouchActiveRef = useRef<boolean>(false)

  // Simple seeded random for deterministic cloud pattern
  const seeded = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // Generate lightning-like axon path that splits into two ends at 90%
  // This is defined here so we can access peptideStartX/Y for dots calculation
  const generateLightningAxon = useMemo(() => {
    const startX = 150
    const startY = 200
    const endX = 475
    const endY = 199.8
    const pattern = 0 // Use pattern 0 for intro neuron
    
    const segments: Array<{ path: string; width: number }> = []
    const pathParts: string[] = []
    
    // Width at soma, taper down by 20%
    const startWidth = 2.53
    const endWidth = startWidth * 0.8 // 20% reduction
    
    // Calculate split point at 90% of the way
    const splitT = 0.9
    const splitX = startX + (endX - startX) * splitT
    const splitY = startY + (endY - startY) * splitT
    
    // Number of segments for lightning-like zigzag (up to split point)
    const numSegments = 7 // Reduced to account for split
    
    let currentX = startX
    let currentY = startY
    
    // Generate main axon path up to split point
    for (let i = 0; i < numSegments; i++) {
      const t = (i + 1) / numSegments * splitT // Scale to reach split point
      const targetX = startX + (endX - startX) * t
      const targetY = startY + (endY - startY) * t
      
      // Direction vector for zigzag calculation
      const dx = targetX - currentX
      const dy = targetY - currentY
      
      // Add zigzag variation (lightning-like)
      const seed = pattern * 100 + i * 17
      const baseZigzagAmount = 8 + seeded(seed) * 6
      const zigzagAmount = baseZigzagAmount * (1 + seeded(seed + 20) * 0.3)
      const zigzagAngle = seeded(seed + 5) * Math.PI * 2
      
      // Perpendicular to main direction
      const perpAngle = Math.atan2(dy, dx) + Math.PI / 2
      const zigzagX = targetX + Math.cos(perpAngle + zigzagAngle) * zigzagAmount * (seeded(seed + 10) - 0.5)
      const zigzagY = targetY + Math.sin(perpAngle + zigzagAngle) * zigzagAmount * (seeded(seed + 10) - 0.5)
      
      // Calculate width at this segment (even taper)
      const width = startWidth - (startWidth - endWidth) * t
      
      const segmentPath = i === 0 
        ? `M ${currentX} ${currentY} L ${zigzagX} ${zigzagY}`
        : `L ${zigzagX} ${zigzagY}`
      
      segments.push({ path: segmentPath, width })
      pathParts.push(segmentPath)
      currentX = zigzagX
      currentY = zigzagY
    }
    
    // Final connection to split point
    const splitSegment = `L ${splitX} ${splitY}`
    const splitWidth = startWidth - (startWidth - endWidth) * splitT
    segments.push({ path: splitSegment, width: splitWidth })
    pathParts.push(splitSegment)
    
    // Build main path string (up to split point only)
    const mainPath = pathParts.join(' ')
    
    // Generate two split ends with zigzags
    // Split end 1: upward angle - will split again at 50% of its length
    const splitEnd1Length = endX - splitX
    const splitEnd1MidX = splitX + splitEnd1Length * 0.5
    const splitEnd1MidY = splitY - 4 // Midpoint Y (halfway to final Y)
    
    // First half of split end 1 (up to 50% split)
    const split1PathPart1 = `M ${splitX} ${splitY} L ${splitX + 6} ${splitY - 1} L ${splitX + 12} ${splitY - 2} L ${splitX + 18} ${splitY - 3} L ${splitEnd1MidX} ${splitEnd1MidY}`
    
    // Split end 1 splits into two sub-ends at 50%
    // Sub-end 1a: continues upward-right
    const split1aEndX = endX
    const split1aEndY = splitY - 8
    const split1aPath = `M ${splitEnd1MidX} ${splitEnd1MidY} L ${splitEnd1MidX + 6} ${splitEnd1MidY - 1} L ${splitEnd1MidX + 12} ${splitEnd1MidY - 2} L ${splitEnd1MidX + 18} ${splitEnd1MidY - 3} L ${split1aEndX} ${split1aEndY}`
    
    // Sub-end 1b: angles upward-left
    const split1bEndX = endX
    const split1bEndY = splitY - 6
    const split1bPath = `M ${splitEnd1MidX} ${splitEnd1MidY} L ${splitEnd1MidX + 6} ${splitEnd1MidY - 0.5} L ${splitEnd1MidX + 12} ${splitEnd1MidY - 1} L ${splitEnd1MidX + 18} ${splitEnd1MidY - 1.5} L ${split1bEndX} ${split1bEndY}`
    
    // Split end 2: downward angle with slight zigzags
    const splitEnd2X = endX
    const splitEnd2Y = splitY + 8 // Slight downward
    const split2Path = `M ${splitX} ${splitY} L ${splitX + 6} ${splitY + 2} L ${splitX + 12} ${splitY + 4} L ${splitX + 18} ${splitY + 5} L ${splitX + 24} ${splitY + 6} L ${splitX + 30} ${splitY + 7} L ${splitEnd2X} ${splitEnd2Y}`
    
    // Peptide starting point is at the center between the two endpoints
    // Endpoints are at (endX, splitY - 8) and (endX, splitY + 8)
    // Center is at (endX, splitY)
    const peptideStartX = endX
    const peptideStartY = splitY
    
    // Store the actual end points (use the rightmost end)
    const actualEndX = endX
    const actualEndY = splitY
    
    // Build continuous path for animation (built once during generation)
    // Helper to extract L commands from a path string
    const extractLCoords = (pathStr: string): string => {
      const parts = pathStr.trim().split(/\s+/)
      if (parts.length >= 3 && parts[0].toUpperCase() === 'M') {
        // Skip M and the two coordinates after it, keep everything else
        return parts.slice(3).join(' ')
      }
      return pathStr
    }
    
    // Extract L commands from branch paths
    const split1Part1Coords = extractLCoords(split1PathPart1)
    const split1aCoords = extractLCoords(split1aPath)
    const split1bCoords = extractLCoords(split1bPath)
    const split2Coords = extractLCoords(split2Path)
    
    // Build continuous path in optimal order:
    // main -> split1Part1 -> split1a -> (backtrack) -> split1b -> (backtrack) -> split2
    // Backtracking segments will be hidden by large gaps in stroke-dasharray
    // 
    // IMPORTANT: Verify coordinates connect properly
    // - Main path ends at (splitX, splitY)
    // - split1Part1Coords starts from (splitX, splitY) - extracted L commands continue from there
    // - After split1Part1, we're at (splitEnd1MidX, splitEnd1MidY)
    // - split1aCoords starts from (splitEnd1MidX, splitEnd1MidY) - extracted L commands continue
    // - After split1a, we're at (split1aEndX, split1aEndY) = (endX, splitY - 8)
    // - Backtrack to (splitEnd1MidX, splitEnd1MidY)
    // - split1bCoords starts from (splitEnd1MidX, splitEnd1MidY)
    // - After split1b, we're at (split1bEndX, split1bEndY) = (endX, splitY - 6)
    // - Backtrack to (splitX, splitY)
    // - split2Coords starts from (splitX, splitY)
    
    // Verify extracted coordinates aren't empty
    if (!split1Part1Coords || !split1aCoords || !split1bCoords || !split2Coords) {
      console.error('ERROR: Failed to extract path coordinates!')
      console.error('split1Part1Coords:', split1Part1Coords)
      console.error('split1aCoords:', split1aCoords)
      console.error('split1bCoords:', split1bCoords)
      console.error('split2Coords:', split2Coords)
    }
    
    const continuousPath = [
      mainPath.trim(),                              // Main: soma to split point (ends at splitX, splitY)
      split1Part1Coords,                           // Split1Part1: continues from split point to midpoint
      split1aCoords,                               // Split1a: continues from midpoint to end
      `L ${splitEnd1MidX} ${splitEnd1MidY}`,      // Backtrack: from split1a end (endX, splitY-8) back to midpoint
      split1bCoords,                               // Split1b: continues from midpoint to end
      `L ${splitX} ${splitY}`,                     // Backtrack: from split1b end (endX, splitY-6) back to split point
      split2Coords                                 // Split2: continues from split point to end
    ].filter(s => s && s.trim().length > 0).join(' ')
    
    return { 
      path: mainPath, 
      segments, 
      endX: actualEndX, 
      endY: actualEndY,
      splitX,
      splitY,
      peptideStartX,
      peptideStartY,
      splitEnd1Part1: { path: split1PathPart1, width: splitWidth * 0.9 },
      splitEnd1a: { path: split1aPath, width: splitWidth * 0.8 },
      splitEnd1b: { path: split1bPath, width: splitWidth * 0.8 },
      splitEnd2: { path: split2Path, width: splitWidth * 0.9 },
      continuousPath: continuousPath // Pre-built continuous path for animation
    }
  }, [seeded])

  // Generate peptides for a streaming release over 2 seconds
  // Memoize to prevent recalculation on every render
  const dots = useMemo(() => {
    // Calculate travel distance to sidebar neurons
    // Peptides use translateX() which moves them relative to their starting position
    // Starting position: peptide is positioned at intro neuron's axon end (in viewport coords)
    // Target position: neurons in sidebar at 100vw + padding
    // 
    // Sidebar layout:
    // - Sidebar is w-64 (256px) scaled to 70% = 179.2px visible width
    // - Inside sidebar: p-8 (32px padding, scaled to 22.4px)
    // - Neurons are 120px wide (scaled to 84px)
    // - So neurons start at: 100vw (menu page left) + 22.4px (padding)
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    
    // Peptide starting position in viewport coordinates
    // The peptide is positioned using calc(50vw + offset), so we need to calculate from there
    // Use peptideStartX from generateLightningAxon (at endX, the center between endpoints)
    const peptideStartX = generateLightningAxon.peptideStartX
    const svgViewBoxWidth = 850
    const estimatedSvgWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 1037) : 1037
    
    // Convert SVG coordinates to viewport coordinates
    const peptideXInSvg = peptideStartX + 95 // Add transform offset
    const peptideXInPixels = (peptideXInSvg / svgViewBoxWidth) * estimatedSvgWidth
    const peptideOffsetFromCenter = peptideXInPixels - estimatedSvgWidth / 2
    const peptideStartXInViewport = viewportWidth / 2 + peptideOffsetFromCenter
    
    // Target position: left edge of neurons
    const sidebarPaddingScaled = 32 * 0.7 // 22.4px
    const neuronLeftEdge = viewportWidth + sidebarPaddingScaled
    
    // Travel distance is the difference
    const travelDistance = neuronLeftEdge - peptideStartXInViewport
    
    // More peptides (96 instead of 48) releasing as a stream over 2 seconds
    return Array.from({ length: 96 }, (_, i) => {
      // Start at bouton end with cloud-like vertical spread in initial position
      // All move horizontally to the right towards menu neurons
      // Stream release: peptides spawn continuously over 2 seconds
      // Small initial spread: ±2px for tight circular cloud at origin
      const initialYOffset = (seeded(i * 17) - 0.5) * 4 // Small initial spread: ±2px
      const delay = seeded(i * 19) * 2.0 // Stream over 2 seconds: 0-2.0s spawn delay
      
      // Random stopping point within neuron X boundaries
      // Neurons are 120px wide, scaled to 84px (120 * 0.7)
      // Add randomness so peptides stop at different depths within the neuron area
      const stopRandomness = seeded(i * 29) // 0-1 random value
      const neuronWidthScaled = 120 * 0.7 // 84px (scaled neuron width)
      const randomStopOffset = stopRandomness * neuronWidthScaled // 0-84px into neuron area
      const travelDistanceWithStop = travelDistance + randomStopOffset
      
      return { 
        initialYOffset,
        travelDistance: travelDistanceWithStop,
        delay
      }
    })
  }, [generateLightningAxon, seeded]) // Empty deps - only calculate once

  // Initialize the path elements for scroll-based animation (two separate branches)
  const initializeScrollPath = useCallback(() => {
    const group = neuronRef.current?.axonOverlayRef?.current
    if (!group) return

    // Remove any existing paths
    const oldPaths = group.querySelectorAll('path.scroll-controlled-path')
    oldPaths.forEach(path => group.removeChild(path))

    const mainPath = generateLightningAxon.path

    // Build two paths for the two main branches:
    // 1. Top branch: main + split1Part1 + split1a (using 1a as the representative top branch)
    // 2. Bottom branch: main + split2
    
    const split1PathPart1 = generateLightningAxon.splitEnd1Part1.path
    const split1aPath = generateLightningAxon.splitEnd1a.path
    const split2Path = generateLightningAxon.splitEnd2.path
    
    // Extract L commands from split paths (removes the M command to make paths continuous)
    const extractLCoords = (pathStr: string): string => {
      const parts = pathStr.trim().split(/\s+/)
      if (parts.length >= 3 && parts[0].toUpperCase() === 'M') {
        // Remove M and its two coordinates, keep the rest (L commands)
        return parts.slice(3).join(' ')
      }
      return pathStr
    }
    
    // Build continuous paths from soma to each endpoint
    // Top branch: main path (ends at splitX, splitY) + split1Part1 (continues from split to midpoint) + split1a (continues from midpoint)
    const split1Part1Coords = extractLCoords(split1PathPart1) // Removes "M splitX splitY", keeps L commands
    const split1aCoords = extractLCoords(split1aPath) // Removes "M splitEnd1MidX splitEnd1MidY", keeps L commands
    const split2Coords = extractLCoords(split2Path) // Removes "M splitX splitY", keeps L commands
    const topBranchPathStr = `${mainPath.trim()} ${split1Part1Coords} ${split1aCoords}`.replace(/\s+/g, ' ').trim()
    
    // Bottom branch: main path (ends at split point) + split2 (continues from split)
    const bottomBranchPathStr = `${mainPath.trim()} ${split2Coords}`.replace(/\s+/g, ' ').trim()
    
    // Debug: log path strings to verify they're constructed correctly
    console.log('=== Path Construction Debug ===')
    console.log('Main path ends at split point:', generateLightningAxon.splitX.toFixed(2), generateLightningAxon.splitY.toFixed(2))
    console.log('Top branch path length:', topBranchPathStr.length, 'chars')
    console.log('Bottom branch path length:', bottomBranchPathStr.length, 'chars')
    console.log('Main path (last 50 chars):', mainPath.substring(Math.max(0, mainPath.length - 50)))
    console.log('Split1Part1 (first 50 chars):', split1PathPart1.substring(0, 50))
    console.log('Split1Part1Coords (extracted, first 50 chars):', split1Part1Coords.substring(0, 50))
    console.log('Top branch path (first 150 chars):', topBranchPathStr.substring(0, 150))
    console.log('Bottom branch path (first 150 chars):', bottomBranchPathStr.substring(0, 150))
    console.log('==============================')

    // Create top branch path
    const topPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    topPath.classList.add('scroll-controlled-path')
    topPath.setAttribute('stroke', 'url(#axonGlow)')
    topPath.setAttribute('stroke-width', '2.53')
    topPath.setAttribute('stroke-linecap', 'round')
    topPath.setAttribute('stroke-linejoin', 'round')
    topPath.setAttribute('fill', 'none')
    topPath.setAttribute('stroke-opacity', '1')
    topPath.style.filter = 'drop-shadow(0 0 4px rgba(255,255,255,.8))'
    topPath.setAttribute('d', topBranchPathStr)
    group.appendChild(topPath)

    // Create bottom branch path
    const bottomPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    bottomPath.classList.add('scroll-controlled-path')
    bottomPath.setAttribute('stroke', 'url(#axonGlow)')
    bottomPath.setAttribute('stroke-width', '2.53')
    bottomPath.setAttribute('stroke-linecap', 'round')
    bottomPath.setAttribute('stroke-linejoin', 'round')
    bottomPath.setAttribute('fill', 'none')
    bottomPath.setAttribute('stroke-opacity', '1')
    bottomPath.style.filter = 'drop-shadow(0 0 4px rgba(255,255,255,.8))'
    bottomPath.setAttribute('d', bottomBranchPathStr)
    group.appendChild(bottomPath)

    // Measure path lengths
    void topPath.getBoundingClientRect()
    void bottomPath.getBoundingClientRect()
    
    let topLength = topPath.getTotalLength()
    let bottomLength = bottomPath.getTotalLength()
    
    if (!topLength || topLength === 0 || isNaN(topLength)) {
      void topPath.getBoundingClientRect()
      topLength = topPath.getTotalLength() || 250
    }
    if (!bottomLength || bottomLength === 0 || isNaN(bottomLength)) {
      void bottomPath.getBoundingClientRect()
      bottomLength = bottomPath.getTotalLength() || 250
    }

    topBranchLengthRef.current = topLength
    bottomBranchLengthRef.current = bottomLength
    // Use the longest path length for animation completion
    pathLengthRef.current = Math.max(topLength, bottomLength)
    
    console.log('=== Path Lengths Measured ===')
    console.log('Top branch length:', topLength.toFixed(2), 'px')
    console.log('Bottom branch length:', bottomLength.toFixed(2), 'px')
    console.log('Max path length:', pathLengthRef.current.toFixed(2), 'px')
    console.log('Recommended scroll distance:', (pathLengthRef.current * 1.5).toFixed(2), 'px')
    console.log('============================')
    
    topBranchPathRef.current = topPath
    bottomBranchPathRef.current = bottomPath

    // Set up dash patterns for both paths
    const dashLength = 40
    
    topPath.style.strokeDasharray = `${dashLength} ${topLength * 3}`
    topPath.style.strokeDashoffset = `${topLength}px`
    
    bottomPath.style.strokeDasharray = `${dashLength} ${bottomLength * 3}`
    bottomPath.style.strokeDashoffset = `${bottomLength}px`

    // Initially hidden
    group.style.opacity = '0'
  }, [generateLightningAxon, neuronRef])

  // Update animation based on scroll progress (0 to 1) - animates both branches simultaneously
  const updateScrollProgress = useCallback((progress: number) => {
    const topPath = topBranchPathRef.current
    const bottomPath = bottomBranchPathRef.current
    const group = neuronRef.current?.axonOverlayRef?.current
    if (!topPath || !bottomPath || !group) return

    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress))
    scrollProgressRef.current = progress

    const topLength = topBranchLengthRef.current
    const bottomLength = bottomBranchLengthRef.current
    const dashLength = 40
    const bufferAmount = 300 // Increased buffer to ensure dash fully clears the end

    // Calculate offsets for both paths
    // Start: dash is positioned at beginning (offset = pathLength)
    // End: dash has traveled past the end (offset = negative)
    const topStartOffset = topLength
    const topEndOffset = -(dashLength + bufferAmount)
    const topCurrentOffset = topStartOffset + (topEndOffset - topStartOffset) * progress
    
    const bottomStartOffset = bottomLength
    const bottomEndOffset = -(dashLength + bufferAmount)
    const bottomCurrentOffset = bottomStartOffset + (bottomEndOffset - bottomStartOffset) * progress

    // Update both paths simultaneously
    topPath.style.strokeDashoffset = `${topCurrentOffset}px`
    bottomPath.style.strokeDashoffset = `${bottomCurrentOffset}px`
    
    // Show/hide the group based on progress
    group.style.opacity = progress > 0 ? '1' : '0'
    
    // Debug logging for path offsets
    if (progress > 0.88 && progress < 0.92) {
      console.log('Near split - Progress:', (progress * 100).toFixed(1) + '%', 'Top offset:', topCurrentOffset.toFixed(1), 'Bottom offset:', bottomCurrentOffset.toFixed(1))
    }

    // Mark animation as complete when progress reaches 1
    // Immediately trigger peptide release when animation completes
    if (progress >= 1) {
      animationCompleteRef.current = true
      // Trigger peptide release immediately when white line fully leaves axon
      if (phase === 'firing') {
        setPhase('release')
      }
    } else {
      animationCompleteRef.current = false
    }
  }, [phase])

  // Start firing phase immediately on mount - no scroll required
  useEffect(() => {
    if (phase === 'idle') {
      setPhase('firing')
    }
  }, [phase])

  // Initialize paths when entering firing phase and show animation immediately
  useEffect(() => {
    if (phase === 'firing' && !topBranchPathRef.current && !bottomBranchPathRef.current) {
      initializeScrollPath()
      // Show animation immediately at start (progress 0) - no scroll needed
      // Use multiple requestAnimationFrame calls to ensure paths are rendered first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (topBranchPathRef.current && bottomBranchPathRef.current) {
            scrollPositionRef.current = 0
            updateScrollProgress(0)
          }
        })
      })
    }
  }, [phase, initializeScrollPath, updateScrollProgress])

  // Handle wheel events (desktop) and touch events (mobile) directly - no DOM scrolling
  useEffect(() => {
    const section = introContainerRef.current
    if (!section) return

    // Use screen width / 1.5 as the scroll distance for mobile horizontal swipe (1.5x more sensitive)
    // Desktop uses 250px for vertical scroll
    const scrollDistanceForFullAnimation = isMobile ? window.innerWidth / 1.5 : 250

    const updateAnimation = (scrollPos: number) => {
      // Ensure we're in firing phase before updating
      if (phase === 'idle') {
        setPhase('firing')
      }
      
      // Update animation during firing phase - tracks finger position in real-time
      if (phase === 'firing') {
        // Map scroll position to progress (0-1)
        // For mobile, use screen width / 1.5 as full swipe distance (1.5x more sensitive)
        const fullDistance = isMobile ? window.innerWidth / 1.5 : scrollDistanceForFullAnimation
        const progress = Math.min(scrollPos / fullDistance, 1)
        
        // Update animation if paths are ready - updates in real-time to track finger
        if (topBranchPathRef.current && bottomBranchPathRef.current) {
          updateScrollProgress(progress)
        }
        
        // Note: Peptide release is now triggered immediately in updateScrollProgress when progress >= 1
      }
      
      // If scrolled back to top, reset everything
      if (scrollPos <= 0) {
        animationCompleteRef.current = false
        scrollProgressRef.current = 0
        if (phase !== 'idle') {
          setPhase('idle')
          const group = neuronRef.current?.axonOverlayRef?.current
          if (group) {
            group.style.opacity = '0'
          }
          if (topBranchPathRef.current) {
            topBranchPathRef.current.style.strokeDashoffset = `${topBranchLengthRef.current}px`
          }
          if (bottomBranchPathRef.current) {
            bottomBranchPathRef.current.style.strokeDashoffset = `${bottomBranchLengthRef.current}px`
          }
        }
      }
    }

    const handleWheel = (e: WheelEvent) => {
      // Only handle if we're on the intro page (before slide)
      if (phase === 'release' || phase === 'reveal') return
      
      // Prevent default to avoid page scrolling
      e.preventDefault()
      e.stopPropagation()
      
      // Update scroll position (virtual scroll) - clamp to animation completion distance
      scrollPositionRef.current = Math.max(0, Math.min(300, scrollPositionRef.current + e.deltaY))
      
      // Update animation based on virtual scroll position
      updateAnimation(scrollPositionRef.current)
    }

    // Touch event handlers for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      // Check if touch is within the intro section
      const sectionEl = introContainerRef.current
      if (!sectionEl) return
      
      const touch = e.touches[0]
      if (!touch) return
      
      const sectionRect = sectionEl.getBoundingClientRect()
      const touchX = touch.clientX
      const touchY = touch.clientY
      
      // Only handle if touch is within the intro section bounds
      if (touchX < sectionRect.left || touchX > sectionRect.right || 
          touchY < sectionRect.top || touchY > sectionRect.bottom) {
        return
      }
      
      // Only handle if we're on the intro page (before slide)
      const currentPhase = phase
      if (currentPhase === 'release' || currentPhase === 'reveal') return
      
      // Ensure firing phase is active
      if (currentPhase === 'idle') {
        setPhase('firing')
      }
      
      if (e.touches.length === 1) {
        touchStartXRef.current = e.touches[0].clientX
        touchStartYRef.current = e.touches[0].clientY
        touchStartScrollPosRef.current = scrollPositionRef.current
        isTouchActiveRef.current = true
        // Prevent default to avoid page scrolling and browser gestures
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const currentPhase = phase
      if (!isTouchActiveRef.current || currentPhase === 'release' || currentPhase === 'reveal') {
        return
      }
      
      // Ensure firing phase is active
      if (currentPhase === 'idle') {
        setPhase('firing')
      }
      
      if (e.touches.length === 1) {
        const touchX = e.touches[0].clientX
        const touchY = e.touches[0].clientY
        
        if (isMobile) {
          // Mobile: use horizontal swipe (left to right)
          const deltaX = touchX - touchStartXRef.current // Swipe right = positive delta
          
          // Use screen width / 1.5 as full swipe distance (1.5x more sensitive)
          const screenWidth = window.innerWidth
          const fullSwipeDistance = screenWidth / 1.5
          const scrollDelta = deltaX
          
          // Update scroll position (virtual scroll) - clamp to animation completion distance
          scrollPositionRef.current = Math.max(0, Math.min(fullSwipeDistance, touchStartScrollPosRef.current + scrollDelta))
        } else {
          // Desktop: use vertical scroll
          const deltaY = touchStartYRef.current - touchY // Inverted: swipe up = positive delta
          
          // Convert touch delta to scroll delta (scale factor for sensitivity)
          const touchScaleFactor = 1.5
          const scrollDelta = deltaY * touchScaleFactor
          
          // Update scroll position (virtual scroll) - clamp to animation completion distance
          scrollPositionRef.current = Math.max(0, Math.min(300, touchStartScrollPosRef.current + scrollDelta))
        }
        
        // Update animation based on virtual scroll position - track finger in real-time
        updateAnimation(scrollPositionRef.current)
        
        // Prevent default to avoid page scrolling and browser gestures
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      isTouchActiveRef.current = false
      // Update touch start position for next gesture
      if (e.changedTouches.length === 1) {
        touchStartXRef.current = e.changedTouches[0].clientX
        touchStartYRef.current = e.changedTouches[0].clientY
        touchStartScrollPosRef.current = scrollPositionRef.current
      }
    }

    // Add CSS to prevent touch actions on the section - CRITICAL for mobile
    section.style.touchAction = 'none'
    section.style.webkitUserSelect = 'none'
    section.style.userSelect = 'none'
    section.style.overscrollBehavior = 'none'
    section.style.webkitOverflowScrolling = 'touch'
    // Prevent iOS callout menu
    ;(section.style as any).webkitTouchCallout = 'none'

    // Add event listeners with capture phase for better mobile handling
    // Use document.body for touch events to catch all touches on mobile
    const touchTarget = typeof window !== 'undefined' && 'ontouchstart' in window ? document.body : section
    
    section.addEventListener('wheel', handleWheel, { passive: false })
    
    // For mobile, attach to document.body to ensure we catch all touches
    touchTarget.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true })
    touchTarget.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })
    touchTarget.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true })
    
    // Initialize animation immediately when paths are ready (after event listener is set up)
    if (phase === 'firing' && topBranchPathRef.current && bottomBranchPathRef.current) {
      // Use setTimeout to ensure this runs after paths are fully initialized
      setTimeout(() => {
        if (scrollPositionRef.current === 0) {
          updateAnimation(0)
        }
      }, 0)
    }
    
    return () => {
      section.removeEventListener('wheel', handleWheel)
      const touchTarget = typeof window !== 'undefined' && 'ontouchstart' in window ? document.body : section
      touchTarget.removeEventListener('touchstart', handleTouchStart, { capture: true } as EventListenerOptions)
      touchTarget.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions)
      touchTarget.removeEventListener('touchend', handleTouchEnd, { capture: true } as EventListenerOptions)
    }
  }, [phase, updateScrollProgress, initializeScrollPath, neuronRef])

  useEffect(() => {
    if (phase === 'release') {
      // Trigger darkening animation immediately when peptides release begins
      if (onPeptideRelease) {
        onPeptideRelease()
      }
      
      // Trigger neuron burst firing 2 seconds earlier than when peptides would hit
      const peptideAnimationDuration = prefersReduced ? 1825 : 2737.5 // Total animation duration (1.6x faster)
      const impactTime = (peptideAnimationDuration * 0.70) - 2000 // 2 seconds before peptides hit
      
      const impactTimeout = setTimeout(() => {
        if (onPeptideImpact) {
          onPeptideImpact()
        }
      }, Math.max(0, impactTime)) // Ensure we don't have negative timeout
      
      // Start slide 0.2s after peptides begin releasing
      const slideDelay = 200 // 0.2s delay
      
      // Trigger container slide after delay (container handles the animation)
      const slideTimeout = setTimeout(() => {
        onDone()
      }, slideDelay)
      
      return () => {
        clearTimeout(impactTimeout)
        clearTimeout(slideTimeout)
      }
    }
    // Cleanup for firing phase
    if (phase === 'firing') {
      return () => {
        if (firingIntervalRef.current) {
          clearTimeout(firingIntervalRef.current)
          firingIntervalRef.current = null
        }
      }
    }
  }, [phase, onDone, onPeptideImpact, onPeptideRelease, prefersReduced])

  return (
    <>
    <section 
      ref={introContainerRef}
      className="relative w-full h-screen text-foreground overflow-hidden"
      style={{ touchAction: 'none', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' } as React.CSSProperties}
    >
      
      {/* Fixed content - stays in viewport */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Mobile portrait layout: flex column - name at top, neuron centered */}
        {isMobile && !isLandscape && (
          <div className="flex flex-col h-full items-center w-full" style={{ width: '100vw', margin: 0, padding: 0 }}>
            {/* Name text - top, centered on page, left aligned within text container, moved down 20px */}
            <h1 
              className="font-normal text-foreground uppercase"
              style={{ 
                fontSize: 'clamp(2.73rem, 7.28vw, 4.55rem)', // 70% of current (3.9*0.7=2.73, 10.4*0.7=7.28, 6.5*0.7=4.55)
                lineHeight: '1.2',
                letterSpacing: '0.05em',
                paddingTop: '55px', // 35px + 20px = 55px
                paddingLeft: '0',
                paddingRight: '0',
                zIndex: 10,
                width: 'auto',
                textAlign: 'left', // Left aligned within the text container
                margin: '0 auto', // Center the text container horizontally
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start' // Left align text within centered container
              }}
            >
              TOBY<br />GOLLAN<br />MYERS
            </h1>
            
            {/* Neuron - centered horizontally and vertically, 1.92x bigger (1.6 * 1.2), moved 15px right and 30px up */}
            <div className="flex-1 flex items-center justify-center w-full relative" style={{ width: '100vw', margin: 0, padding: 0 }}>
              {/* Bouncing swipe indicator - below neuron on mobile intro */}
              <div className="absolute flex items-center gap-1 text-white text-xs font-normal whitespace-nowrap" style={{ 
                animation: 'bounceUp 1.5s ease-in-out infinite',
                pointerEvents: 'none',
                left: '50%',
                top: 'calc(50% + 120px)',
                transform: 'translateX(-50%)',
                zIndex: 100
              }}>
                <span>swipe to fire</span>
              </div>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes bounce {
                  0%, 100% {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                  }
                  50% {
                    transform: translateX(-50%) translateY(-8px);
                    opacity: 0.8;
                  }
                }
                @keyframes bounceUp {
                  0%, 100% {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                  }
                  50% {
                    transform: translateX(-50%) translateY(-8px);
                    opacity: 0.8;
                  }
                }
              `}} />
              <div 
                id="mobile-neuron-container"
                style={{ 
                  transform: 'scale(1.92) translate(15px, -37px)', 
                  transformOrigin: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 auto'
                }}
              >
                <NeuronModule
                  phase={phase}
                  neuronRef={neuronRef}
                  dots={dots}
                  generateLightningAxon={generateLightningAxon}
                  svgRef={svgRef}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Desktop and mobile landscape layout: flex row - name on left, neuron centered on right */}
        {(!isMobile || isLandscape) && (
          <div className="flex items-center justify-between w-full h-full px-8 md:px-16">
          {/* Name text - left side */}
          <h1 
            className="font-normal text-foreground uppercase"
            style={{ 
              fontSize: 'clamp(1.95rem, 5.2vw, 3.25rem)',
              lineHeight: '1.2',
              letterSpacing: '0.05em',
              marginTop: '60px',
              marginLeft: '25px',
              zIndex: 10
            }}
          >
            TOBY GOLLAN MYERS
          </h1>
          
          {/* Neuron - centered */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Bouncing scroll indicator - below neuron on desktop intro */}
            {!isMobile && (
              <div className="absolute flex flex-col items-center gap-1 text-white text-xs font-normal whitespace-nowrap" style={{ 
                animation: 'bounceUp 1.5s ease-in-out infinite',
                pointerEvents: 'none',
                left: '50%',
                top: 'calc(50% + 120px)',
                transform: 'translateX(-50%)',
                zIndex: 100
              }}>
                <span>scroll to fire</span>
                <span className="text-sm">^^</span>
              </div>
            )}
            <NeuronModule
              phase={phase}
              neuronRef={neuronRef}
              dots={dots}
              generateLightningAxon={generateLightningAxon}
              svgRef={svgRef}
            />
          </div>
        </div>
        )}
      </div>
    </section>
    
    {/* Neuropeptide dots cloud - positioned outside container with fixed positioning so they can travel across viewport */}
    {phase === 'release' && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
        {dots.map((dot, i) => {
          // Get actual SVG element position using ref
          const svgElement = svgRef.current
          if (!svgElement) return null
          
          // Check if parent has mobile scale transform (1.92x) - only on mobile portrait
          const container = document.getElementById('mobile-neuron-container')
          const isMobilePortrait = container !== null
          const mobileScale = isMobilePortrait ? 1.92 : 1 // Updated to 1.92 (20% larger than 1.6)
          
          const svgRect = svgElement.getBoundingClientRect()
          const svgViewBoxWidth = 850
          const svgViewBoxHeight = 400
          
          // Calculate scale factors
          // On mobile, getBoundingClientRect() returns scaled size, so we need to get actual SVG size
          const actualSvgWidth = svgRect.width / mobileScale
          const actualSvgHeight = svgRect.height / mobileScale
          const scaleX = actualSvgWidth / svgViewBoxWidth
          const scaleY = actualSvgHeight / svgViewBoxHeight
          
          // Peptide start position in SVG coordinates (including transform)
          const peptideXInSvg = generateLightningAxon.peptideStartX + 95 // Add transform offset
          // On mobile, add offset to align with bouton (peptides appearing too high)
          const peptideYOffset = isMobilePortrait ? 8 : 0 // 8px down on mobile to align with bouton
          const peptideYInSvg = generateLightningAxon.peptideStartY + peptideYOffset
          
          // Convert to viewport coordinates
          // On mobile portrait, we need to account for the container's scale transform
          let peptideXInViewport: number
          let peptideYInViewport: number
          
          if (isMobilePortrait && container) {
            const containerRect = container.getBoundingClientRect()
            const containerCenterX = containerRect.left + containerRect.width / 2
            const containerCenterY = containerRect.top + containerRect.height / 2
            
            // SVG's center in its own coordinate system
            const svgCenterXInSvg = svgViewBoxWidth / 2
            const svgCenterYInSvg = svgViewBoxHeight / 2
            
            // Peptide position relative to SVG center
            const relativeX = (peptideXInSvg - svgCenterXInSvg) * scaleX
            const relativeY = (peptideYInSvg - svgCenterYInSvg) * scaleY
            
            // Apply mobile scale and position relative to container center
            peptideXInViewport = containerCenterX + relativeX * mobileScale
            peptideYInViewport = containerCenterY + relativeY * mobileScale
          } else {
            // Desktop: original calculation
            peptideXInViewport = svgRect.left + (peptideXInSvg * scaleX)
            peptideYInViewport = svgRect.top + (peptideYInSvg * scaleY)
          }
          
          return (
            <div
              key={`neuropeptide-${i}`}
              style={{
                position: 'absolute',
                left: `${peptideXInViewport}px`,
                top: `${peptideYInViewport + dot.initialYOffset}px`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'white',
                animation: `neuropeptideTravel${i} ${prefersReduced ? 1.825 : 2.7375}s ${dot.delay}s ease-out forwards`,
                transformOrigin: 'center center',
              }}
            />
          )
        })}
      </div>
    )}
    </>
  )
}

function NeuronModule({
  phase,
  neuronRef,
  dots,
  generateLightningAxon,
  svgRef,
}: {
  phase: string
  neuronRef: React.RefObject<NeuronHandle>
  dots: Array<{ initialYOffset: number; travelDistance: number; delay: number }>
  generateLightningAxon: {
    path: string
    segments: Array<{ path: string; width: number }>
    endX: number
    endY: number
    splitX: number
    splitY: number
    peptideStartX: number
    peptideStartY: number
    splitEnd1Part1: { path: string; width: number }
    splitEnd1a: { path: string; width: number }
    splitEnd1b: { path: string; width: number }
    splitEnd2: { path: string; width: number }
    continuousPath: string
  }
  svgRef: React.RefObject<SVGSVGElement>
}) {
  const axonPathRef = useRef<SVGGElement>(null)
  const axonOverlayRef = useRef<SVGGElement>(null)

  // Expose conduct method and ref via ref
  useImperativeHandle(neuronRef, () => {
    return {
      axonOverlayRef: axonOverlayRef,
      conduct: (duration: number) => {
        const group = axonOverlayRef.current
        if (!group) return
        
        // Use the pre-built continuous path from generateLightningAxon
        const continuousPath = (generateLightningAxon as any).continuousPath as string
        
        // CRITICAL: Remove old path element completely to ensure fresh state (prevents glitches)
        const oldPath = group.querySelector('path.continuous-path')
        if (oldPath) {
          group.removeChild(oldPath)
        }
        
        // Create a brand new path element for this fire (guarantees no residual state)
        const singlePath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        singlePath.classList.add('continuous-path')
        singlePath.setAttribute('stroke', 'url(#axonGlow)')
        singlePath.setAttribute('stroke-width', '2.53')
        singlePath.setAttribute('stroke-linecap', 'round')
        singlePath.setAttribute('stroke-linejoin', 'round')
        singlePath.setAttribute('fill', 'none')
        singlePath.setAttribute('stroke-opacity', '1')
        singlePath.style.filter = 'drop-shadow(0 0 4px rgba(255,255,255,.8))'
        group.appendChild(singlePath)
        
        // Set the pre-built continuous path
        singlePath.setAttribute('d', continuousPath)
        
        // CRITICAL: Force multiple reflows to ensure path is fully rendered before measurement
        // This is especially important for subsequent fires where timing can be tricky
        void singlePath.getBoundingClientRect()
        void window.getComputedStyle(singlePath).opacity
        void singlePath.getBoundingClientRect() // Force another reflow
        
        // Get path length - this is critical for debugging
        let totalLength = singlePath.getTotalLength()
        
        // If path length is 0 or invalid, try measuring again after a brief delay
        // This can happen on rapid subsequent fires if browser hasn't fully processed the element
        if (!totalLength || totalLength === 0 || isNaN(totalLength)) {
          // Force another reflow
          void singlePath.getBoundingClientRect()
          totalLength = singlePath.getTotalLength()
          
          // If still invalid, log error but don't return (let it try anyway)
          if (!totalLength || totalLength === 0 || isNaN(totalLength)) {
            console.warn('WARNING: Path length measurement issue. Length:', totalLength)
            console.warn('Path string (first 100 chars):', continuousPath.substring(0, 100))
            // Don't return - use a fallback length based on expected value
            totalLength = 437.24 // Known correct length from first fire
          }
        }
        
        // Calculate dash pattern - ensure only ONE dash is visible at any time
        // Dasharray pattern: [dash][gap][dash][gap]...
        // CRITICAL: Gap must be MUCH larger than path length to prevent pattern from wrapping
        // If gap is too small, the pattern repeats and shows multiple dashes
        const dashLength = 40 // Short white line
        const gapLength = totalLength * 3 // Gap = 3x path length to absolutely prevent pattern wrapping
        
        // Set CSS variables for animation
        singlePath.style.setProperty('--path-length', `${totalLength}px`)
        singlePath.style.setProperty('--dash-length', `${dashLength}px`)
        singlePath.style.setProperty('--gap-length', `${gapLength}px`)
        singlePath.style.setProperty('--conduction-duration', `${duration}ms`)
        
        // Initial state (brand new element, so no need for complex reset)
        group.style.opacity = '0'
        
        // Set up dash pattern BEFORE animating
        // CRITICAL: Set dasharray and initial offset together to prevent any pattern wrapping
        // Pattern: [40px dash][1311.72px gap] - gap is 3x path length to absolutely prevent wrapping
        singlePath.style.strokeDasharray = `${dashLength} ${gapLength}`
        
        // CRITICAL: Start with dash offset so it's positioned at the START of the path (soma)
        // When offset = totalLength, the dash pattern starts at position 0 (beginning of path)
        // This ensures the dash appears at the soma and travels forward
        singlePath.style.strokeDashoffset = `${totalLength}px`
        
        // Force render with properties set - multiple reflows to ensure element is fully processed
        void singlePath.getBoundingClientRect()
        void window.getComputedStyle(singlePath).strokeDasharray
        void singlePath.getBoundingClientRect() // Force another reflow
        
        // Use requestAnimationFrame with a small delay for consistent timing across all fires
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Small additional delay to ensure browser has fully processed the new element
            // This is especially important for subsequent fires
            setTimeout(() => {
              // Make visible
              group.style.opacity = '1'
              
              // Apply animation
              // CRITICAL: The animation must travel the FULL path length including all branches
              // Animation moves offset from totalLength to -(dashLength + pathLength * 0.1)
              // This ensures the dash travels completely through the entire path (soma → all split ends)
              // The buffer ensures the dash fully clears all branch endpoints
              singlePath.style.animation = `axonDrawPulse ${duration}ms linear forwards`
            
              // Hide after animation completes - CRITICAL: ensure animation doesn't restart
              setTimeout(() => {
                // Stop animation immediately to prevent any restart
                singlePath.style.animation = 'none'
                // Force browser to recognize animation stop
                void singlePath.getBoundingClientRect()
                // Hide the group
                group.style.opacity = '0'
                // Clear dash pattern to prevent any visual artifacts
                singlePath.style.strokeDasharray = 'none'
                singlePath.style.strokeDashoffset = '0'
                // Note: path element will be removed entirely on next fire
              }, duration + 50)
            }, 16) // ~1 frame delay to ensure browser has fully processed the new element
          })
        })
      }
    }
  }, [generateLightningAxon])

  return (
    <div className="relative z-10 flex flex-col items-center justify-center w-full">
      <div className="flex flex-col items-center relative" style={{ minHeight: '400px' }}>
        <svg
          ref={svgRef}
          className="w-[1037px] max-w-[80vw] h-[518px]"
          viewBox="0 0 850 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          style={{ marginBottom: '-1.44rem' }}
        >
          <g transform="translate(95, 0)">
          <defs>
            {/* Black gradient for traveling pulse (inverted) */}
            <linearGradient id="axonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>

          {/* Dendrites (left side) - more varied and branched */}
          <g
            className="stroke-white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="1"
          >
            {/* Primary branches from soma - 15% longer, varied angles and positions */}
            <path d="M150 200 L126.5 176.5 L109.25 158.75 L94.4 142.1" />
            <path d="M150 200 L129.2 213.5 L112.7 236.25 L98.8 256.7" />
            <path d="M150 200 L173.5 173.5 L192.9 158.8 L212.7 144" />
            <path d="M150 200 L171.2 223.5 L192.3 246.25 L208.8 267.1" />
            <path d="M150 200 L138 191.75 L124.4 188.8 L110.7 187.15" />
            <path d="M150 200 L143.25 211.2 L133.3 228.5 L124.4 242.5" />
            <path d="M150 200 L156.75 181.25 L162.4 168.75 L164.3 157.2" />
            <path d="M150 200 L159.8 215.2 L167.6 230.6 L173.2 244.1" />
            <path d="M150 200 L163.3 189.8 L175.8 182.9 L189 175.3" />
            <path d="M150 200 L147.6 208.75 L145.9 217.95 L144.6 226.5" />
            <path d="M150 200 L152.8 185.3 L155.6 174.65 L157.25 164.2" />
            <path d="M150 200 L145.9 198.3 L141.15 197.65 L136.35 197.2" />

            {/* More varied offshoots with sub-branches - 15% longer */}
            <path d="M126.5 176.5 L115.5 167.8 L105.2 160.9" />
            <path d="M126.5 176.5 L122.75 172.25 L119.3 168.65" />
            <path d="M129.2 213.5 L118.3 223.7 L107.9 231.9" />
            <path d="M129.2 213.5 L125.2 225.5 L122.9 235.2" />
            <path d="M173.5 173.5 L182.5 167.9 L191.6 163.5" />
            <path d="M173.5 173.5 L178.75 170.55 L185 168.75" />
            <path d="M171.2 223.5 L180.2 231.2 L189.3 238.4" />
            <path d="M171.2 223.5 L175.8 229.9 L178.1 236.3" />
            <path d="M138 191.75 L132.25 189.65 L126.5 188.8" />
            <path d="M138 191.75 L136.35 195.7 L134.4 200.3" />
            <path d="M143.25 211.2 L137.5 216.95 L132.4 222.7" />
            <path d="M143.25 211.2 L141.45 214.8 L139.65 218.8" />
            <path d="M156.75 181.25 L160.7 174.65 L164 170.1" />
            <path d="M156.75 181.25 L158.55 177.3 L159.85 174.65" />
            <path d="M159.8 215.2 L164.3 223.7 L168.75 231.6" />
            <path d="M159.8 215.2 L162.4 220.4 L163.15 225.5" />
            <path d="M163.3 189.8 L171.65 187.35 L177.8 186.35" />
            <path d="M163.3 189.8 L166.75 192.1 L169.55 194.65" />
            <path d="M147.6 208.75 L150.3 214.5 L151.8 218.7" />
            <path d="M147.6 208.75 L148.85 211.2 L148.85 213.65" />
            <path d="M152.8 185.3 L155.6 178.65 L157.25 173.55" />
            <path d="M145.9 198.3 L143.6 199.15 L141.3 200" />
          </g>



          {/* Base axon (black) - lightning-like zigzag that splits into ends at 90% */}
          <g ref={axonPathRef}>
            {/* Main axon path up to split point */}
            <path
              d={generateLightningAxon.path}
              className="stroke-white"
              strokeWidth={2.53}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
            {/* Split end 1 part 1: upward with zigzags (first half) */}
            <path
              d={generateLightningAxon.splitEnd1Part1.path}
              className="stroke-white"
              strokeWidth={generateLightningAxon.splitEnd1Part1.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
            {/* Split end 1a: sub-end from top split (upward-right) */}
            <path
              d={generateLightningAxon.splitEnd1a.path}
              className="stroke-white"
              strokeWidth={generateLightningAxon.splitEnd1a.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
            {/* Split end 1b: sub-end from top split (upward-left) */}
            <path
              d={generateLightningAxon.splitEnd1b.path}
              className="stroke-white"
              strokeWidth={generateLightningAxon.splitEnd1b.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
            {/* Split end 2: downward with zigzags */}
            <path
              d={generateLightningAxon.splitEnd2.path}
              className="stroke-white"
              strokeWidth={generateLightningAxon.splitEnd2.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
          </g>

          {/* Conduction overlay (white traveling pulse) - single continuous path from soma to all ends */}
          <g ref={axonOverlayRef} className="opacity-0">
            {/* Single continuous path will be created dynamically in conduct() method */}
          </g>
          
          </g>
        </svg>

      </div>

      <style key="neuropeptide-styles">{`
        ${dots.map((dot, i) => {
          // Calculate target positions for menu neurons
          // Menu neurons are in the sidebar on the menu page (right side of container)
          // - Intro neuron bouton is at x=510 (relative to intro page)
          // - Menu page starts at x=100vw (right side of container)
          // - Sidebar is at left edge of menu page, width 256px, scaled to 70% = ~179px visible
          // - Neurons are positioned within the sidebar
          // - First neuron Y: ~100px (header height ~80px + padding)
          // - Each neuron spaced ~152px apart (120px neuron + 32px margin)
          // - Neuron X position: ~100px from left edge of sidebar
          
          // All peptides travel horizontally to the right, spreading wide in Y axis as they travel
          // Travel distance is pre-calculated in dots array
          const travelX = dot.travelDistance
          
          // Peptides start from a small cloud and spread out wider as they travel
          // Start with small spread (±2px), end with wide spread to cover full viewport height
          // Use a seeded random function for deterministic spread
          const seededLocal = (seed: number) => {
            const x = Math.sin(seed) * 10000
            return x - Math.floor(x)
          }
          // Spread across full viewport height to cover all neurons
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
          const maxSpread = viewportHeight * 0.8 // Maximum Y spread: 80% of viewport height
          const spreadProgression = seededLocal(i * 23) // Random factor for each peptide's spread
          const finalYSpread = (spreadProgression - 0.5) * maxSpread // Final Y offset: ±40% of viewport height
          
          // Peptides travel horizontally with increasing Y spread
          // The Y spread increases linearly as they travel horizontally
          const travelY = finalYSpread // Y offset at destination (spreads wider as they travel)
          const finalY = travelY
          
          return `
          @keyframes neuropeptideTravel${i} {
            0% {
              transform: translateX(0) translateY(0);
              opacity: 0;
            }
            2% {
              opacity: 1;
            }
            70% {
              transform: translateX(${travelX}px) translateY(${finalY}px);
              opacity: 1;
            }
            75% {
              transform: translateX(${travelX}px) translateY(${finalY}px);
              opacity: 0;
            }
            100% {
              transform: translateX(${travelX}px) translateY(${finalY}px);
              opacity: 0;
            }
          }
        `
        }).join('\n')}
      `}</style>
    </div>
  )
}
