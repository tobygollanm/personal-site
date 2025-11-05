import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionNeuron from './SectionNeuron'

type Region = 'soma' | 'apical' | 'basalL' | 'basalR' | 'axon'

const sections = [
  { label: 'about', path: '/' },
  { label: 'research', path: '/research' },
  { label: 'neurotech', path: '/neurotech' },
  { label: 'writing', path: '/writing' },
  { label: 'miscellaneous', path: '/misc' },
]

export default function IntroReveal() {
  const [isFading, setIsFading] = useState(false)
  const [synchronyActive, setSynchronyActive] = useState<boolean[]>([])
  const [synchronyRegion, setSynchronyRegion] = useState<Region>('soma')
  const navigate = useNavigate()
  const synchronyTimeoutRef = useRef<number | null>(null)

  const scheduleGlobalSynchrony = useCallback(() => {
    if (synchronyTimeoutRef.current) {
      clearTimeout(synchronyTimeoutRef.current)
    }

    const interval = 25000 + Math.random() * 35000
    synchronyTimeoutRef.current = window.setTimeout(() => {
      const numNeurons = Math.random() < 0.3 ? sections.length : 2 + Math.floor(Math.random() * 4)
      const region: Region = ['soma', 'apical', 'basalL', 'basalR', 'axon'][
        Math.floor(Math.random() * 5)
      ] as Region

      const activeIndices = new Set<number>()
      const targetCount = Math.min(numNeurons, sections.length)
      while (activeIndices.size < targetCount) {
        activeIndices.add(Math.floor(Math.random() * sections.length))
      }

      const activeArray = sections.map((_, i) => activeIndices.has(i))
      setSynchronyRegion(region)
      setSynchronyActive(activeArray)

      setTimeout(() => {
        setSynchronyActive([])
      }, 600)

      scheduleGlobalSynchrony()
    }, interval)
  }, [])

  useEffect(() => {
    scheduleGlobalSynchrony()
    return () => {
      if (synchronyTimeoutRef.current) {
        clearTimeout(synchronyTimeoutRef.current)
      }
    }
  }, [scheduleGlobalSynchrony])

  const handleSectionClick = (path: string) => {
    setIsFading(true)
    setTimeout(() => {
      navigate(path)
    }, 400)
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-8 transition-opacity duration-400 ${
        isFading ? 'fade-out' : 'fade-in'
      }`}
    >
      <div className="space-y-4 max-w-2xl w-full" style={{ overflow: 'visible' }}>
        {sections.map((section, index) => {
          // Calculate synapse target for this neuron (where its axon should connect to neuron below)
          // Each neuron's SVG has viewBox "0 0 150 150" for small neurons, displayed at 120px
          // Soma is at (75, 30) in the neuron's viewBox coordinate system
          // With marginBottom of 2rem (32px) and neuron height of 120px, spacing is ~152px
          // But in viewBox coordinates (150px viewBox displayed as 120px), we need to scale
          // Neuron below's soma would be at Y ~30 + (152/120)*150 = ~220 in viewBox coords
          const viewBoxWidth = 150 // Small neuron viewBox width
          const viewBoxHeight = 150
          const somaX = viewBoxWidth / 2 // Center X (75)
          const thisSomaY = 30 // This neuron's soma Y in viewBox
          const pixelSpacing = 152 // Actual pixel spacing: 120px neuron + 32px margin
          const viewBoxSpacing = (pixelSpacing / 120) * viewBoxHeight // Scale to viewBox: ~190
          const belowSomaY = thisSomaY + viewBoxSpacing // Neuron below's soma Y in this neuron's viewBox
          
          // Simple seeded function for deterministic variation
          const seeded = (seed: number) => {
            const x = Math.sin(seed) * 10000
            return x - Math.floor(x)
          }
          
          // Target position on dendrites below (up dendrites extend upward from below neuron's soma)
          // "Up" dendrites on the neuron below extend upward, typically 15-35px above its soma
          const synapseTarget = index < sections.length - 1 ? {
            x: somaX + (seeded(index * 17) - 0.5) * 30, // Vary X to hit different dendrites
            y: belowSomaY - 20 - seeded(index * 23) * 25, // Above the below neuron's soma
          } : undefined
          
          return (
            <button
              key={section.path}
              onClick={() => handleSectionClick(section.path)}
              className="flex items-start gap-4 w-full text-left group hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded"
              style={{ overflow: 'visible', marginBottom: index < sections.length - 1 ? '2rem' : '0' }}
              aria-label={`Navigate to ${section.label}`}
            >
              <SectionNeuron
                onSynchrony={() => {}}
                isSynchronizing={synchronyActive[index] || false}
                synchronyRegion={synchronyRegion}
                orientation="horizontal-up"
                pattern={index}
                synapseTarget={synapseTarget}
              />
              <span className="text-xl font-normal text-black mt-1">{section.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
