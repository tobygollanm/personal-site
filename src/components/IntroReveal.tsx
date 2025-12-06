import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import SectionNeuron, { SectionNeuronHandle } from './SectionNeuron'

type Region = 'soma' | 'apical' | 'basalL' | 'basalR' | 'axon'

const sections = [
  { label: 'home', id: 'about' },
  { label: 'neurotech', id: 'neurotech' },
  { label: 'past projects', id: 'research' },
  { label: 'writing', id: 'writing' },
  { label: 'other stuff', id: 'misc' },
]

export type IntroRevealHandle = {
  triggerPeptideSync: () => void
}

const IntroReveal = forwardRef<IntroRevealHandle, {}>((props, ref) => {
  const [synchronyActive, setSynchronyActive] = useState<boolean[]>([])
  const [synchronyRegion, setSynchronyRegion] = useState<Region>('soma')
  const [isBurst, setIsBurst] = useState(false)
  const [burstCount, setBurstCount] = useState(0)
  const synchronyTimeoutRef = useRef<number | null>(null)
  const burstIntervalRef = useRef<number | null>(null)
  const burstIndexRef = useRef(0)
  const [hoverCascade, setHoverCascade] = useState<boolean[]>([])
  const hoverFireCountRef = useRef<Map<number, number>>(new Map())
  const cascadeTimeoutsRef = useRef<number[]>([])
  const neuronRefs = useRef<(SectionNeuronHandle | null)[]>([])

  const scheduleGlobalSynchrony = useCallback(() => {
    if (synchronyTimeoutRef.current) {
      clearTimeout(synchronyTimeoutRef.current)
    }

    // More frequent synchronization: 8-20 seconds (was 25-60)
    const interval = 8000 + Math.random() * 12000
    synchronyTimeoutRef.current = window.setTimeout(() => {
      // 30% chance for burst, 70% for normal sync
      const isBurstEvent = Math.random() < 0.3
      
      // 60% chance to sync neurons 2 and 3 (indices 1 and 2) together - they sync more often
      const preferNeurons2And3 = Math.random() < 0.6
      
      const region: Region = ['soma', 'apical', 'basalL', 'basalR', 'axon'][
        Math.floor(Math.random() * 5)
      ] as Region
      setSynchronyRegion(region)
      
      let activeIndices: Set<number>
      
      if (preferNeurons2And3) {
        // Sync neurons 2 and 3 (indices 1 and 2)
        activeIndices = new Set([1, 2])
      } else {
        // Sync neighboring neurons (adjacent pairs)
        // Choose a random starting neuron
        const startIndex = Math.floor(Math.random() * (sections.length - 1))
        // Include the neuron and its neighbor
        activeIndices = new Set([startIndex, startIndex + 1])
      }
      
      const activeArray = sections.map((_, i) => activeIndices.has(i))
      
      if (isBurstEvent) {
        // Burst: 2-4 rapid firings at 3/4 hover rate
        setIsBurst(true)
        
        // Fire 2-4 bursts
        const bursts = 2 + Math.floor(Math.random() * 3) // 2-4 bursts
        setBurstCount(bursts)
        burstIndexRef.current = 0
        
        // Fire bursts: 2-4 rapid firings at 3/4 hover rate
        // Hover rate is cycleDuration / 18, so 3/4 of that is cycleDuration / 24
        // Average cycleDuration is ~3250ms (middle of 2500-4000 range)
        // Burst interval = (3250 / 18) * 0.75 = ~135ms
        const burstInterval = 135
        
        // Fire all bursts
        const fireBursts = (burstIndex: number) => {
          if (burstIndex < bursts) {
            setSynchronyActive(activeArray)
            setTimeout(() => {
              setSynchronyActive([])
              if (burstIndex < bursts - 1) {
                // Schedule next burst
                burstIntervalRef.current = window.setTimeout(() => {
                  fireBursts(burstIndex + 1)
                }, burstInterval) as unknown as number
              } else {
                // Last burst - clean up
                setIsBurst(false)
                setBurstCount(0)
                burstIndexRef.current = 0
                burstIntervalRef.current = null
              }
            }, 600)
          }
        }
        
        // Start firing bursts
        fireBursts(0)
        
      } else {
        // Normal single-fire sync
        setSynchronyActive(activeArray)
        setIsBurst(false)

        setTimeout(() => {
          setSynchronyActive([])
        }, 600)
      }

      scheduleGlobalSynchrony()
    }, interval)
  }, [])

  useEffect(() => {
    scheduleGlobalSynchrony()
    return () => {
      if (synchronyTimeoutRef.current) {
        clearTimeout(synchronyTimeoutRef.current)
      }
      if (burstIntervalRef.current) {
        clearTimeout(burstIntervalRef.current)
      }
    }
  }, [scheduleGlobalSynchrony])

  // Expose method to trigger peptide synchronization
  useImperativeHandle(ref, () => ({
    triggerPeptideSync: () => {
      // Trigger burst firing on all neurons at 200% faster speed (3x normal speed)
      // This is achieved by setting isBurst which uses cycleDuration / 54 in SectionNeuron
      const activeArray = sections.map(() => true)
      setSynchronyActive(activeArray)
      setIsBurst(true)
      setBurstCount(3) // Multiple bursts for continuous firing effect
      
      // Keep firing from when triggered until 0.3s after peptides fade, but 4x as long + 2 seconds
      const peptideAnimationDuration = 4380 // Total animation duration (15% faster than 5.04s)
      const fadeTime = peptideAnimationDuration * 0.75 // 75% (when peptides finish fading)
      const impactTime = peptideAnimationDuration * 0.70 // 70% (when first peptide hits)
      const baseBurstDuration = (fadeTime - impactTime) + 300 // Duration from first hit to 0.3s after fade
      const burstDuration = (baseBurstDuration * 4) + 2000 // 4x as long + 2 seconds
      
      setTimeout(() => {
        setSynchronyActive([])
        setIsBurst(false)
      }, burstDuration)
    }
  }), [])

  const handleSectionClick = (sectionId: string) => {
    // Find the section element in the main content area and scroll so the title is at the top
    const sectionElement = document.getElementById(sectionId)
    if (sectionElement) {
      // Get the main content container (the scrollable area)
      const mainContent = document.querySelector('.main-content-scrollable') as HTMLElement
      if (mainContent) {
        // Find the h2 title within the section (or use section itself if no h2)
        const titleElement = sectionElement.querySelector('h2') || sectionElement
        
        // Get current scroll position of the container
        const containerScrollTop = mainContent.scrollTop
        
        // Get bounding rectangles relative to the document
        const containerRect = mainContent.getBoundingClientRect()
        const titleRect = titleElement.getBoundingClientRect()
        
        // Calculate the scroll offset needed to position the title at the top
        // The title's position relative to the container's visible area
        const relativeTop = titleRect.top - containerRect.top
        const targetScrollTop = containerScrollTop + relativeTop
        
        // Scroll to position the title at the top of the viewport
        mainContent.scrollTo({
          top: Math.max(0, targetScrollTop), // Ensure we don't scroll to negative values
          behavior: 'smooth'
        })
      } else {
        // Fallback: scroll the title into view at the top
        const titleElement = sectionElement.querySelector('h2') || sectionElement
        titleElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handleNeuronHoverStart = useCallback((index: number) => {
    // Get current fire count for this neuron
    const currentCount = hoverFireCountRef.current.get(index) || 0
    
    // Increment fire count
    hoverFireCountRef.current.set(index, currentCount + 1)
    
    // After 2 fires, 50% chance to trigger neighbor cascade
    if (currentCount + 1 === 2) {
      const shouldCascade = Math.random() < 0.5
      
      if (shouldCascade) {
        const cascadeNeurons: number[] = []
        
        // Add immediate neighbors
        if (index > 0) cascadeNeurons.push(index - 1)
        if (index < sections.length - 1) cascadeNeurons.push(index + 1)
        
        // 25% chance to extend to next adjacent neurons
        const shouldExtend = Math.random() < 0.25
        if (shouldExtend) {
          if (index > 1) cascadeNeurons.push(index - 2)
          if (index < sections.length - 2) cascadeNeurons.push(index + 2)
        }
        
        // Activate cascade neurons
        setHoverCascade(prev => {
          const newArray = [...prev]
          cascadeNeurons.forEach(i => {
            newArray[i] = true
          })
          return newArray
        })
        
        // Calculate hover firing interval (same as in SectionNeuron)
        const avgCycleDuration = 3250 // Average of 2.5-4.0s range
        const hoverInterval = avgCycleDuration / 32.4
        
        // Schedule cascade to last for 3 fires after original neuron stops (1.5s + 3 fires)
        const cascadeDelay = 1500 + (hoverInterval * 3)
        
        const timeoutId = window.setTimeout(() => {
          setHoverCascade(prev => {
            const newArray = [...prev]
            cascadeNeurons.forEach(i => {
              newArray[i] = false
            })
            return newArray
          })
        }, cascadeDelay)
        
        cascadeTimeoutsRef.current.push(timeoutId)
      }
    }
  }, [sections.length])

  const handleNeuronHoverEnd = useCallback((index: number) => {
    // Reset fire count for this neuron
    hoverFireCountRef.current.set(index, 0)
  }, [])

  const handleTextHoverStart = useCallback((index: number) => {
    // Trigger the neuron's hover behavior
    if (neuronRefs.current[index]) {
      neuronRefs.current[index]?.triggerHover()
    }
  }, [])

  const handleTextHoverEnd = useCallback((index: number) => {
    // End the neuron's hover behavior
    if (neuronRefs.current[index]) {
      neuronRefs.current[index]?.endHover()
    }
  }, [])

  // Cleanup cascade timeouts on unmount
  useEffect(() => {
    return () => {
      cascadeTimeoutsRef.current.forEach(id => clearTimeout(id))
    }
  }, [])

  return (
    <div className="h-full flex flex-col items-start justify-start p-[22.4px]">
      <div className="space-y-4 w-full" style={{ overflow: 'visible' }}>
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
          let synapseTargetY = belowSomaY - 20 - seeded(index * 23) * 25
          
          // Shorten top neuron's (index 0) axon by 2.5% from the bottom
          if (index === 0) {
            const somaStartY = 30 // This neuron's soma Y position
            const axonLength = synapseTargetY - (somaStartY + 6) // Total axon length (somaY + 6 is axon start)
            synapseTargetY = synapseTargetY - (axonLength * 0.025) // Reduce by 2.5%
          }
          
          const synapseTarget = index < sections.length - 1 ? {
            x: somaX + (seeded(index * 17) - 0.5) * 30, // Vary X to hit different dendrites
            y: synapseTargetY, // Above the below neuron's soma
          } : undefined
          
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className="flex items-start gap-2 w-full text-left group hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded"
              style={{ overflow: 'visible', marginBottom: index < sections.length - 1 ? '2rem' : '0' }}
              aria-label={`Scroll to ${section.label} section`}
            >
              <SectionNeuron
                ref={(el) => (neuronRefs.current[index] = el)}
                onSynchrony={() => {}}
                isSynchronizing={synchronyActive[index] || hoverCascade[index] || false}
                synchronyRegion={synchronyRegion}
                isBurst={isBurst && synchronyActive[index]}
                orientation="horizontal-up"
                pattern={index}
                synapseTarget={synapseTarget}
                onHoverStart={() => handleNeuronHoverStart(index)}
                onHoverEnd={() => handleNeuronHoverEnd(index)}
              />
              <span 
                className="text-xl font-normal text-foreground mt-1 whitespace-nowrap"
                onMouseEnter={() => handleTextHoverStart(index)}
                onMouseLeave={() => handleTextHoverEnd(index)}
              >
                {section.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
})

IntroReveal.displayName = 'IntroReveal'

export default IntroReveal
