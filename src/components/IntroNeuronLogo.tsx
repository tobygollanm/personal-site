import { useMemo } from 'react'

// Exact intro neuron logo - same shape as the intro sequence
export default function IntroNeuronLogo({ className = '', size = 80 }: { className?: string; size?: number }) {
  // The intro neuron uses viewBox="0 0 850 400" with transform="translate(95, 0)"
  // We'll scale it down but keep the exact same paths
  const viewBoxWidth = 850
  const viewBoxHeight = 400
  const scale = size / viewBoxHeight // Scale based on height
  
  // Generate the exact same lightning axon as the intro
  const generateLightningAxon = useMemo(() => {
    const startX = 150
    const startY = 200
    const endX = 475
    const endY = 199.8
    const pattern = 0
    const segments: Array<{ path: string; width: number }> = []
    const pathParts: string[] = []
    const startWidth = 2.53
    const endWidth = startWidth * 0.8
    const splitT = 0.9
    const splitX = startX + (endX - startX) * splitT
    const splitY = startY + (endY - startY) * splitT
    const numSegments = 7
    
    const seeded = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    let currentX = startX
    let currentY = startY
    
    for (let i = 0; i < numSegments; i++) {
      const t = (i + 1) / numSegments * splitT
      const targetX = startX + (endX - startX) * t
      const targetY = startY + (endY - startY) * t
      const dx = targetX - currentX
      const dy = targetY - currentY
      const seed = pattern * 100 + i * 17
      const baseZigzagAmount = 8 + seeded(seed) * 6
      const zigzagAmount = baseZigzagAmount * (1 + seeded(seed + 20) * 0.3)
      const zigzagAngle = seeded(seed + 5) * Math.PI * 2
      const perpAngle = Math.atan2(dy, dx) + Math.PI / 2
      const zigzagX = targetX + Math.cos(perpAngle + zigzagAngle) * zigzagAmount * (seeded(seed + 10) - 0.5)
      const zigzagY = targetY + Math.sin(perpAngle + zigzagAngle) * zigzagAmount * (seeded(seed + 10) - 0.5)
      const width = startWidth - (startWidth - endWidth) * t
      const segmentPath = i === 0 
        ? `M ${currentX} ${currentY} L ${zigzagX} ${zigzagY}`
        : `L ${zigzagX} ${zigzagY}`
      segments.push({ path: segmentPath, width })
      pathParts.push(segmentPath)
      currentX = zigzagX
      currentY = zigzagY
    }
    
    const splitSegment = `L ${splitX} ${splitY}`
    const splitWidth = startWidth - (startWidth - endWidth) * splitT
    segments.push({ path: splitSegment, width: splitWidth })
    pathParts.push(splitSegment)
    
    const mainPath = pathParts.join(' ')
    const splitEnd1Length = endX - splitX
    const splitEnd1MidX = splitX + splitEnd1Length * 0.5
    const splitEnd1MidY = splitY - 4
    const split1PathPart1 = `M ${splitX} ${splitY} L ${splitX + 6} ${splitY - 1} L ${splitX + 12} ${splitY - 2} L ${splitX + 18} ${splitY - 3} L ${splitEnd1MidX} ${splitEnd1MidY}`
    const split1aEndX = endX
    const split1aEndY = splitY - 8
    const split1aPath = `M ${splitEnd1MidX} ${splitEnd1MidY} L ${splitEnd1MidX + 6} ${splitEnd1MidY - 1} L ${splitEnd1MidX + 12} ${splitEnd1MidY - 2} L ${splitEnd1MidX + 18} ${splitEnd1MidY - 3} L ${split1aEndX} ${split1aEndY}`
    const split1bEndX = endX
    const split1bEndY = splitY - 6
    const split1bPath = `M ${splitEnd1MidX} ${splitEnd1MidY} L ${splitEnd1MidX + 6} ${splitEnd1MidY - 0.5} L ${splitEnd1MidX + 12} ${splitEnd1MidY - 1} L ${splitEnd1MidX + 18} ${splitEnd1MidY - 1.5} L ${split1bEndX} ${split1bEndY}`
    const splitEnd2X = endX
    const splitEnd2Y = splitY + 8
    const split2Path = `M ${splitX} ${splitY} L ${splitX + 6} ${splitY + 2} L ${splitX + 12} ${splitY + 4} L ${splitX + 18} ${splitY + 5} L ${splitX + 24} ${splitY + 6} L ${splitX + 30} ${splitY + 7} L ${splitEnd2X} ${splitEnd2Y}`
    
    return {
      path: mainPath,
      splitEnd1Part1: { path: split1PathPart1, width: splitWidth * 0.9 },
      splitEnd1a: { path: split1aPath, width: splitWidth * 0.8 },
      splitEnd1b: { path: split1bPath, width: splitWidth * 0.8 },
      splitEnd2: { path: split2Path, width: splitWidth * 0.9 },
    }
  }, [])

  // Exact dendrite paths from intro neuron
  const dendritePaths = useMemo(() => [
    "M150 200 L126.5 176.5 L109.25 158.75 L94.4 142.1",
    "M150 200 L129.2 213.5 L112.7 236.25 L98.8 256.7",
    "M150 200 L173.5 173.5 L192.9 158.8 L212.7 144",
    "M150 200 L171.2 223.5 L192.3 246.25 L208.8 267.1",
    "M150 200 L138 191.75 L124.4 188.8 L110.7 187.15",
    "M150 200 L143.25 211.2 L133.3 228.5 L124.4 242.5",
    "M150 200 L156.75 181.25 L162.4 168.75 L164.3 157.2",
    "M150 200 L159.8 215.2 L167.6 230.6 L173.2 244.1",
    "M150 200 L163.3 189.8 L175.8 182.9 L189 175.3",
    "M150 200 L147.6 208.75 L145.9 217.95 L144.6 226.5",
    "M150 200 L152.8 185.3 L155.6 174.65 L157.25 164.2",
    "M150 200 L145.9 198.3 L141.15 197.65 L136.35 197.2",
    "M126.5 176.5 L115.5 167.8 L105.2 160.9",
    "M126.5 176.5 L122.75 172.25 L119.3 168.65",
    "M129.2 213.5 L118.3 223.7 L107.9 231.9",
    "M129.2 213.5 L125.2 225.5 L122.9 235.2",
    "M173.5 173.5 L182.5 167.9 L191.6 163.5",
    "M173.5 173.5 L178.75 170.55 L185 168.75",
    "M171.2 223.5 L180.2 231.2 L189.3 238.4",
    "M171.2 223.5 L175.8 229.9 L178.1 236.3",
    "M138 191.75 L132.25 189.65 L126.5 188.8",
    "M138 191.75 L136.35 195.7 L134.4 200.3",
    "M143.25 211.2 L137.5 216.95 L132.4 222.7",
    "M143.25 211.2 L141.45 214.8 L139.65 218.8",
    "M156.75 181.25 L160.7 174.65 L164 170.1",
    "M156.75 181.25 L158.55 177.3 L159.85 174.65",
    "M159.8 215.2 L164.3 223.7 L168.75 231.6",
    "M159.8 215.2 L162.4 220.4 L163.15 225.5",
    "M163.3 189.8 L171.65 187.35 L177.8 186.35",
    "M163.3 189.8 L166.75 192.1 L169.55 194.65",
    "M147.6 208.75 L150.3 214.5 L151.8 218.7",
    "M147.6 208.75 L148.85 211.2 L148.85 213.65",
    "M152.8 185.3 L155.6 178.65 L157.25 173.55",
    "M145.9 198.3 L143.6 199.15 L141.3 200",
  ], [])

  return (
    <svg
      width={size * (viewBoxWidth / viewBoxHeight)}
      height={size}
      viewBox="0 0 850 400"
      className={className}
      style={{ overflow: 'visible' }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(95, 0)">
        {/* Dendrites - exact same as intro */}
        <g
          className="stroke-white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="1"
        >
          {dendritePaths.map((path, i) => (
            <path key={i} d={path} />
          ))}
        </g>


        {/* Axon - exact same paths as intro */}
        <path
          d={generateLightningAxon.path}
          className="stroke-white"
          strokeWidth={2.53}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="1"
        />
        <path
          d={generateLightningAxon.splitEnd1Part1.path}
          className="stroke-white"
          strokeWidth={generateLightningAxon.splitEnd1Part1.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="1"
        />
        <path
          d={generateLightningAxon.splitEnd1a.path}
          className="stroke-white"
          strokeWidth={generateLightningAxon.splitEnd1a.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="1"
        />
        <path
          d={generateLightningAxon.splitEnd1b.path}
          className="stroke-white"
          strokeWidth={generateLightningAxon.splitEnd1b.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="1"
        />
        <path
          d={generateLightningAxon.splitEnd2.path}
          className="stroke-white"
          strokeWidth={generateLightningAxon.splitEnd2.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="1"
        />
      </g>
    </svg>
  )
}

