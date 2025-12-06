import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import NeuronGraphic, { NeuronGraphicHandle } from './NeuronGraphic'

type Region = 'soma' | 'apical' | 'basalL' | 'basalR' | 'axon'

export type SectionNeuronHandle = {
  triggerHover: () => void
  endHover: () => void
}

type SectionNeuronProps = {
  onSynchrony?: () => void
  isSynchronizing?: boolean
  synchronyRegion?: Region
  isBurst?: boolean
  orientation?: 'horizontal-up' | 'horizontal-down' | 'vertical'
  pattern?: number
  synapseTarget?: { x: number; y: number }
  onHoverStart?: () => void
  onHoverEnd?: () => void
}

// Simple seeded function for deterministic variation per neuron
const seeded = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const SectionNeuron = forwardRef<SectionNeuronHandle, SectionNeuronProps>(({
  onSynchrony: _onSynchrony,
  isSynchronizing = false,
  synchronyRegion,
  isBurst = false,
  orientation = 'horizontal-up',
  pattern = 0,
  synapseTarget,
  onHoverStart,
  onHoverEnd,
}, ref) => {
  const neuronRef = useRef<NeuronGraphicHandle>(null)
  const timeoutRef = useRef<number | null>(null)
  const isHoveredRef = useRef(false)
  const [cycleDuration, setCycleDuration] = useState(2500 + seeded(pattern * 100) * 1500) // 2.5-4.0s range, varied per neuron
  const hoverEaseTimeoutRef = useRef<number | null>(null)
  const baseCycleDurationRef = useRef(cycleDuration)

  const isTouchDevice = 'ontouchstart' in window
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const calciumPulseDuration = prefersReducedMotion ? 600 : 800 // ms

  const scheduleNextPulse = useCallback((isFirstPulse: boolean = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // For first pulse, use a short delay. For subsequent pulses, use cycle duration
    const currentDuration = cycleDuration
    const adjustedInterval = isFirstPulse 
      ? 300 + seeded(pattern * 50) * 200 // First pulse: 300-500ms delay
      : (isHoveredRef.current ? currentDuration / 32.4 : currentDuration) // 1.5x faster than original (21.6 * 1.5 = 32.4)

    timeoutRef.current = window.setTimeout(() => {
      if (neuronRef.current && !isSynchronizing) {
        neuronRef.current.pulseCalcium(calciumPulseDuration)
      }
      scheduleNextPulse(false) // Subsequent pulses
    }, adjustedInterval)
  }, [isSynchronizing, cycleDuration, calciumPulseDuration, pattern])

  useEffect(() => {
    // Start with first pulse
    scheduleNextPulse(true)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (hoverEaseTimeoutRef.current) {
        clearTimeout(hoverEaseTimeoutRef.current)
      }
    }
  }, [scheduleNextPulse])

  useEffect(() => {
    if (isSynchronizing && neuronRef.current) {
      if (isBurst) {
        // Burst firing: rapid continuous firing at 200% faster than hover (3x normal speed)
        // Hover rate is cycleDuration / 18, so 200% faster is cycleDuration / 54
        const burstInterval = cycleDuration / 54
        
        // Fire immediately
        neuronRef.current.pulseCalcium(calciumPulseDuration)
        
        // Continue firing rapidly while isSynchronizing is true
        const burstIntervalId = window.setInterval(() => {
          if (neuronRef.current && isSynchronizing) {
            neuronRef.current.pulseCalcium(calciumPulseDuration)
          }
        }, burstInterval)
        
        return () => {
          clearInterval(burstIntervalId)
        }
      } else if (synchronyRegion) {
        // Normal sync: use old pulseRegion for single-fire events
        neuronRef.current.pulseRegion(synchronyRegion)
      }
    }
  }, [isSynchronizing, synchronyRegion, isBurst, calciumPulseDuration, cycleDuration])

  const handleMouseEnter = () => {
    if (isTouchDevice) return
    
    // Set hover state FIRST before any scheduling
    isHoveredRef.current = true
    
    // Cancel any ongoing ease-back
    if (hoverEaseTimeoutRef.current) {
      clearTimeout(hoverEaseTimeoutRef.current)
      hoverEaseTimeoutRef.current = null
    }
    
    // Clear any existing scheduled pulse to prevent slow fire
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Immediately trigger a pulse
    if (neuronRef.current && !isSynchronizing) {
      neuronRef.current.pulseCalcium(calciumPulseDuration)
    }
    
    // Notify parent about hover start
    if (onHoverStart) {
      onHoverStart()
    }
    
    // Calculate fast interval and schedule next pulse
    const currentDuration = cycleDuration
    const fastInterval = currentDuration / 32.4 // 1.5x faster hover speed
    
    timeoutRef.current = window.setTimeout(() => {
      if (neuronRef.current && !isSynchronizing && isHoveredRef.current) {
        neuronRef.current.pulseCalcium(calciumPulseDuration)
      }
      // Continue scheduling if still hovering
      if (isHoveredRef.current) {
        scheduleNextPulse()
      }
    }, fastInterval)
    
    // Stop hover firing after 1.5 seconds
    setTimeout(() => {
      isHoveredRef.current = false
      // Reset to base duration immediately
      setCycleDuration(baseCycleDurationRef.current)
      
      // Notify parent about hover end
      if (onHoverEnd) {
        onHoverEnd()
      }
    }, 1500)
  }

  const handleMouseLeave = () => {
    if (isTouchDevice) return
    
    isHoveredRef.current = false
    
    // Ease back to base duration over 1.5s
    const easeStartTime = Date.now()
    const easeDuration = 1500 // 1.5s
    const startDuration = cycleDuration
    const targetDuration = baseCycleDurationRef.current
    
    const easeBack = () => {
      const elapsed = Date.now() - easeStartTime
      const progress = Math.min(elapsed / easeDuration, 1)
      
      // Ease-out curve for smooth transition
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentDuration = startDuration + (targetDuration - startDuration) * easedProgress
      
      setCycleDuration(currentDuration)
      
      if (progress < 1) {
        hoverEaseTimeoutRef.current = window.setTimeout(easeBack, 16) as unknown as number
      } else {
        setCycleDuration(targetDuration)
        hoverEaseTimeoutRef.current = null
      }
    }
    
    easeBack()
  }
  
  // Expose hover methods via ref
  useImperativeHandle(ref, () => ({
    triggerHover: handleMouseEnter,
    endHover: handleMouseLeave
  }), [handleMouseEnter, handleMouseLeave])

  return (
    <div
      onMouseEnter={!isTouchDevice ? handleMouseEnter : undefined}
      onMouseLeave={!isTouchDevice ? handleMouseLeave : undefined}
      className="inline-block"
      style={{ overflow: 'visible' }}
    >
      <NeuronGraphic ref={neuronRef} size={120} small={true} orientation={orientation} pattern={pattern} synapseTarget={synapseTarget} />
    </div>
  )
})

SectionNeuron.displayName = 'SectionNeuron'

export default SectionNeuron
