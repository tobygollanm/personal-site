import { forwardRef, useImperativeHandle, useRef, useId } from 'react'

export type NeuronGraphicHandle = {
  conduct: () => void
  release: () => void
  pulseRegion: (r: 'soma' | 'apical' | 'basalL' | 'basalR' | 'axon') => void
  pulseCalcium: (duration: number) => void
}

type NeuronGraphicProps = {
  size?: number
  small?: boolean
  className?: string
  orientation?: 'horizontal-up' | 'horizontal-down' | 'vertical'
  pattern?: number // 0-4 for different neuron shapes
  synapseTarget?: { x: number; y: number } // Target position for axon to synapse onto
}

// Simple seeded "random" for deterministic variation
const seeded = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Generate lightning-like zigzag axon path with tapering
const generateLightningAxon = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  pattern: number,
  isCraggly: boolean = false
): { path: string; segments: Array<{ path: string; width: number; startX: number; startY: number; endX: number; endY: number }> } => {
  const segments: Array<{ path: string; width: number; startX: number; startY: number; endX: number; endY: number }> = []
  const pathParts: string[] = []
  
  // Increased width at soma, taper down by 30%
  const startWidth = 3.2
  const endWidth = startWidth * 0.7 // 30% reduction: 3.2 * 0.7 = 2.24
  
  // For craggly axons: 10x more segments, not evenly spaced
  const numSegments = isCraggly ? 50 : (pattern === 1 || pattern === 3 ? 8 : 6)
  
  let currentX = startX
  let currentY = startY
  
  for (let i = 0; i < numSegments; i++) {
    const t = (i + 1) / numSegments
    
    // For craggly: use exponential spacing to cluster segments at beginning and end
    const segmentT = isCraggly 
      ? 1 - Math.pow(1 - t, 1.5) // Exponential curve for uneven spacing
      : t
    
    const targetX = startX + (endX - startX) * segmentT
    const targetY = startY + (endY - startY) * segmentT
    
    // Direction vector for zigzag calculation
    const dx = targetX - currentX
    const dy = targetY - currentY
    
    // Add zigzag variation (lightning-like)
    const seed = pattern * 100 + i * 17
    const baseZigzagAmount = isCraggly ? 3 + seeded(seed) * 4 : 8 + seeded(seed) * 6 // Smaller zigzags for craggly
    const zigzagAmount = baseZigzagAmount * (1 + seeded(seed + 20) * 0.3) // Vary amount
    const zigzagAngle = seeded(seed + 5) * Math.PI * 2
    
    // Perpendicular to main direction
    const perpAngle = Math.atan2(dy, dx) + Math.PI / 2
    const zigzagX = targetX + Math.cos(perpAngle + zigzagAngle) * zigzagAmount * (seeded(seed + 10) - 0.5)
    const zigzagY = targetY + Math.sin(perpAngle + zigzagAngle) * zigzagAmount * (seeded(seed + 10) - 0.5)
    
    // Calculate width at this segment (even taper)
    const width = startWidth - (startWidth - endWidth) * segmentT
    
    // For rendering, each segment needs to start with M (for separate path elements)
    // For the combined path, use L after first segment
    const segmentPathForRendering = `M ${currentX} ${currentY} L ${zigzagX} ${zigzagY}`
    const segmentPathForCombined = i === 0 
      ? `M ${currentX} ${currentY} L ${zigzagX} ${zigzagY}`
      : `L ${zigzagX} ${zigzagY}`
    
    segments.push({
      path: segmentPathForRendering, // Use M for each segment when rendering separately
      width,
      startX: currentX,
      startY: currentY,
      endX: zigzagX,
      endY: zigzagY,
    })
    
    pathParts.push(segmentPathForCombined) // Use L for combined path
    currentX = zigzagX
    currentY = zigzagY
  }
  
  // Final connection to exact end point
  const finalSegmentForRendering = `M ${currentX} ${currentY} L ${endX} ${endY}`
  const finalSegmentForCombined = `L ${endX} ${endY}`
  segments.push({
    path: finalSegmentForRendering,
    width: endWidth,
    startX: currentX,
    startY: currentY,
    endX,
    endY,
  })
  pathParts.push(finalSegmentForCombined)
  
  return {
    path: pathParts.join(' '),
    segments,
  }
}

// Recursively generate lightning-like branches
const branchPath = (
  fromX: number,
  fromY: number,
  angle: number,
  length: number,
  depth: number,
  pattern: number,
  branchIndex: number,
  paths: string[]
): void => {
  if (depth <= 0 || length < 2) return

  const endX = fromX + Math.cos(angle) * length
  const endY = fromY + Math.sin(angle) * length
  paths.push(`M ${fromX} ${fromY} L ${endX} ${endY}`)

  // Decide how many sub-branches (1-4, varied by pattern and depth)
  const seed = pattern * 100 + depth * 10 + branchIndex
  const numBranches = depth > 2 
    ? 1 + Math.floor((pattern + depth + branchIndex) % 3)
    : 1 + Math.floor((pattern * depth + branchIndex) % 4)
  
  for (let i = 0; i < numBranches; i++) {
    const branchSeed = seed + i * 7
    // Vary angle deterministically - sometimes branch left, sometimes right
    const branchAngle = angle + (seeded(branchSeed) - 0.5) * 1.2 + (i - numBranches / 2) * 0.6
    // Vary branch length - shorter as we go deeper
    const branchLength = length * (0.4 + (pattern % 3) * 0.1) * (0.7 + seeded(branchSeed + 3) * 0.3)
    // Branch from a point along the main branch (not always the end)
    const branchPoint = 0.6 + (pattern % 3) * 0.15
    const branchStartX = fromX + (endX - fromX) * branchPoint
    const branchStartY = fromY + (endY - fromY) * branchPoint
    
    branchPath(branchStartX, branchStartY, branchAngle, branchLength, depth - 1, pattern, i, paths)
  }
}

// Generate complex golgi-stain-like dendritic trees with varied number of dendrites
const generateDendriteTree = (
  startX: number,
  startY: number,
  _somaX: number,
  _somaY: number,
  direction: 'left' | 'right' | 'up' | 'down',
  pattern: number
) => {
  const paths: string[] = []
  
  // Vary the number of primary dendrites (5-10 for more dendrites)
  const numPrimaryDendrites = 5 + (pattern * 2) % 6
  
  // Base angle ranges vary by direction and pattern
  let baseAngle: number
  let angleSpread: number
  let baseLength: number
  
  if (direction === 'left') {
    baseAngle = Math.PI + (pattern % 5) * 0.2 // Vary starting angle
    angleSpread = (0.8 + (pattern % 3) * 0.3) * Math.PI // Vary spread
    baseLength = 25 + (pattern % 4) * 8
  } else if (direction === 'right') {
    baseAngle = 0 + (pattern % 5) * -0.2
    angleSpread = (0.8 + (pattern % 3) * 0.3) * Math.PI
    baseLength = 25 + (pattern % 4) * 8
  } else if (direction === 'up') {
    baseAngle = -Math.PI / 2 + (pattern % 5) * 0.15
    angleSpread = (0.6 + (pattern % 3) * 0.2) * Math.PI
    baseLength = 20 + (pattern % 4) * 6
  } else { // down
    baseAngle = Math.PI / 2 + (pattern % 5) * -0.15
    angleSpread = (0.6 + (pattern % 3) * 0.2) * Math.PI
    baseLength = 20 + (pattern % 4) * 6
  }

  // Generate primary dendrites with varied angles
  for (let i = 0; i < numPrimaryDendrites; i++) {
    // Non-uniform spacing - create clusters
    const t = i / Math.max(1, numPrimaryDendrites - 1)
    const seed = pattern * 50 + i * 13
    const angleOffset = (t - 0.5) * angleSpread + (seeded(seed) - 0.5) * 0.3
    const angle = baseAngle + angleOffset
    
    // Vary length per dendrite deterministically
    const length = baseLength * (0.7 + seeded(seed + 5) * 0.4) * (1 + (pattern % 2) * 0.2)
    
    // Recursive branching (depth 3-4 for complexity)
    const depth = 3 + (pattern + i) % 2
    branchPath(startX, startY, angle, length, depth, pattern, i, paths)
  }

  return paths
}

const NeuronGraphic = forwardRef<NeuronGraphicHandle, NeuronGraphicProps>(
  ({ size = 800, small = false, className = '', orientation = 'vertical', pattern = 0, synapseTarget }, ref) => {
    const axonOverlayRef = useRef<SVGPathElement | null>(null)
    const vesiclesRef = useRef<SVGCircleElement[]>([])
    const regionGroupsRef = useRef<{ [key: string]: SVGGElement | null }>({})
    const gradientId = useId()

    useImperativeHandle(ref, () => ({
      conduct: () => {
        const path = axonOverlayRef.current
        if (path) {
          const length = path.getTotalLength()
          path.style.setProperty('--path-length', `${length}px`)
          path.style.strokeDasharray = `${length}`
          path.style.strokeDashoffset = `${length}`
          path.classList.remove('axon-conduct', 'opacity-0')
          void path.getBoundingClientRect()
          path.classList.add('axon-conduct')
          path.style.opacity = '1'
        }
      },
      release: () => {
        vesiclesRef.current.forEach((vesicle, i) => {
          if (vesicle) {
            const distance = small ? 80 : 175
            vesicle.style.setProperty('--vesicle-distance', `${distance}px`)
            vesicle.classList.remove('vesicle')
            void vesicle.getBoundingClientRect()
            vesicle.style.animationDelay = `${i * 120}ms`
            vesicle.classList.add('vesicle')
            setTimeout(() => {
              vesicle.classList.remove('vesicle')
              vesicle.style.transform = 'translateX(0)'
              vesicle.style.opacity = '1'
            }, small ? 600 : 1600)
          }
        })
      },
      pulseRegion: (region: 'soma' | 'apical' | 'basalL' | 'basalR' | 'axon') => {
        const group = regionGroupsRef.current[region]
        if (group) {
          group.classList.remove('pulse')
          void group.getBoundingClientRect()
          group.classList.add('pulse')
        }
      },
      pulseCalcium: (duration: number) => {
        // Remove all calcium pulse classes first
        Object.values(regionGroupsRef.current).forEach((group) => {
          if (group) {
            group.classList.remove('calcium-pulse', 'calcium-pulse-dendrites', 'calcium-pulse-soma', 'calcium-pulse-axon', 'calcium-pulse-bouton')
            group.style.removeProperty('--calcium-duration')
          }
        })
        
        // Force reflow to ensure classes are removed
        void document.body.offsetHeight
        
        // Use requestAnimationFrame to ensure animation restarts
        requestAnimationFrame(() => {
          // Apply calcium pulse with propagation delays
          // Dendrites (basalL, basalR, apical) → soma → axon → bouton
          const dendriteGroups = [
            regionGroupsRef.current.basalL,
            regionGroupsRef.current.basalR,
            regionGroupsRef.current.apical,
          ].filter(Boolean) as SVGGElement[]
          
          dendriteGroups.forEach((group) => {
            group.style.setProperty('--calcium-duration', `${duration}ms`)
            group.classList.add('calcium-pulse', 'calcium-pulse-dendrites')
            // Force reflow to ensure animation starts
            void group.getBoundingClientRect()
          })
          
          if (regionGroupsRef.current.soma) {
            regionGroupsRef.current.soma.style.setProperty('--calcium-duration', `${duration}ms`)
            regionGroupsRef.current.soma.classList.add('calcium-pulse', 'calcium-pulse-soma')
            void regionGroupsRef.current.soma.getBoundingClientRect()
          }
          
          if (regionGroupsRef.current.axon) {
            regionGroupsRef.current.axon.style.setProperty('--calcium-duration', `${duration}ms`)
            regionGroupsRef.current.axon.classList.add('calcium-pulse', 'calcium-pulse-axon')
            void regionGroupsRef.current.axon.getBoundingClientRect()
          }
        })
      },
    }))

    const isHorizontal = orientation === 'horizontal-up' || orientation === 'horizontal-down'
    // Larger viewBox to allow axons to extend beyond - no clipping
    const viewBoxWidth = isHorizontal ? (small ? 150 : 250) : 800
    const viewBoxHeight = isHorizontal ? (small ? 150 : 250) : 800
    const displaySize = small ? size : (isHorizontal ? 120 : 800)

    if (orientation === 'horizontal-up') {
      const somaX = viewBoxWidth / 2
      const somaY = small ? 30 : 50
      
      // Calculate synapse target - either provided or estimate based on dendrite positions below
      let targetX: number
      let targetY: number
      
      if (synapseTarget) {
        targetX = synapseTarget.x
        targetY = synapseTarget.y
      } else {
        // Estimate where "up" dendrites would be on neuron below (they point up toward this neuron)
        // These dendrites would be in the upper portion of the neuron below
        const estimatedBelowSomaY = somaY + (small ? 140 : 200) // Estimated soma position of neuron below
        const estimatedBelowSomaX = somaX + (pattern % 3 === 0 ? -8 : pattern % 3 === 1 ? 8 : 0) // Slight horizontal offset
        // Up dendrites extend upward, so target is above the below neuron's soma
        targetX = estimatedBelowSomaX + (seeded(pattern * 23) - 0.5) * 25 // Vary X position
        targetY = estimatedBelowSomaY - 15 - seeded(pattern * 31) * 15 // Above the soma, varied
      }
      
      // Extend axon to synapse target
      const axonEndY = targetY
      const axonEndX = targetX

      const leftDendrites = generateDendriteTree(somaX, somaY, somaX, somaY, 'left', pattern)
      const rightDendrites = generateDendriteTree(somaX, somaY, somaX, somaY, 'right', pattern)
      const upDendrites = generateDendriteTree(somaX, somaY, somaX, somaY, 'up', pattern)
      
      // Generate lightning-like axon path with tapering
      // Make patterns 1 and 3 extra craggly (10x zigzags, not evenly spaced)
      const isCraggly = pattern === 1 || pattern === 3
      const axonPath = generateLightningAxon(
        somaX,
        somaY + 6,
        axonEndX,
        axonEndY,
        pattern,
        isCraggly
      )

      return (
        <svg
          width={displaySize}
          height={displaySize}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className={className}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient
              id={`axon-gradient-${gradientId}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* Render dendrites first (behind soma) */}
          <g
            ref={(el) => (regionGroupsRef.current.basalL = el)}
            data-region="basalL"
            className="svg-thin stroke-white/70"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {leftDendrites.map((path, i) => (
              <path key={`left-${i}`} d={path} />
            ))}
          </g>

          <g
            ref={(el) => (regionGroupsRef.current.basalR = el)}
            data-region="basalR"
            className="svg-thin stroke-white/70"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {rightDendrites.map((path, i) => (
              <path key={`right-${i}`} d={path} />
            ))}
          </g>

          <g
            ref={(el) => (regionGroupsRef.current.apical = el)}
            data-region="apical"
            className="svg-thin stroke-white/70"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {upDendrites.map((path, i) => (
              <path key={`up-${i}`} d={path} />
            ))}
          </g>

          {/* Soma removed */}
          <g ref={(el) => (regionGroupsRef.current.soma = el)} data-region="soma">
          </g>

          <g ref={(el) => (regionGroupsRef.current.axon = el)} data-region="axon">
            {/* Render base axon with tapering using segments - each segment is a separate path */}
            {axonPath.segments.map((segment, i) => {
              // Calculate average width for this segment for smooth tapering
              const nextSegment = axonPath.segments[i + 1]
              const avgWidth = nextSegment 
                ? (segment.width + nextSegment.width) / 2 
                : segment.width
              
              return (
                <path
                  key={`axon-base-${i}`}
                  d={segment.path}
                  className="svg-thin stroke-white/70"
                  strokeWidth={avgWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )
            })}
            
            {/* Render conduction overlay - hidden by default, shown when conducting */}
            <path
              ref={axonOverlayRef}
              d={axonPath.path}
              className="svg-thin opacity-0"
              stroke={`url(#axon-gradient-${gradientId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.6))',
                opacity: '0',
              }}
            />
          </g>
        </svg>
      )
    }

    // Vertical fallback - simplified for now
    const somaX = viewBoxWidth / 2
    const somaY = viewBoxHeight * 0.5

    return (
      <svg
        width={displaySize}
        height={displaySize}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className={className}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`axon-gradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Render dendrites first (behind soma) */}
        <g
          ref={(el) => (regionGroupsRef.current.basalL = el)}
          data-region="basalL"
          className="svg-thin"
        >
          <path d={`M ${somaX} ${somaY} L ${somaX * 0.7} ${somaY * 1.25}`} className="svg-thin" />
          <path d={`M ${somaX * 0.7} ${somaY * 1.25} L ${somaX * 0.5} ${somaY * 1.17}`} className="svg-thin" />
        </g>

        <g
          ref={(el) => (regionGroupsRef.current.basalR = el)}
          data-region="basalR"
          className="svg-thin"
        >
          <path d={`M ${somaX} ${somaY} L ${somaX * 1.3} ${somaY * 1.25}`} className="svg-thin" />
          <path d={`M ${somaX * 1.3} ${somaY * 1.25} L ${somaX * 1.5} ${somaY * 1.17}`} className="svg-thin" />
        </g>

        <g
          ref={(el) => (regionGroupsRef.current.apical = el)}
          data-region="apical"
          className="svg-thin"
        >
          <path d={`M ${somaX} ${somaY} L ${somaX} ${somaY * 0.5}`} className="svg-thin" />
        </g>

        {/* Render soma after dendrites so it appears on top (covers dendrites behind it) */}
        <g ref={(el) => (regionGroupsRef.current.soma = el)} data-region="soma">
          <circle cx={somaX} cy={somaY} r="6" className="svg-fill-white" />
        </g>

        <g ref={(el) => (regionGroupsRef.current.axon = el)} data-region="axon">
          <path
            d={`M ${somaX} ${somaY + 12} L ${somaX} ${somaY * 1.25} L ${somaX * 1.7} ${somaY * 1.25}`}
            className="svg-thin"
            strokeLinecap="round"
          />
          <path
            ref={axonOverlayRef}
            d={`M ${somaX} ${somaY + 12} L ${somaX} ${somaY * 1.25} L ${somaX * 1.7} ${somaY * 1.25}`}
            className="svg-thin"
            stroke={`url(#axon-gradient-${gradientId})`}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            style={{
              filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.6))',
            }}
          />
        </g>
      </svg>
    )
  }
)

NeuronGraphic.displayName = 'NeuronGraphic'

export default NeuronGraphic
