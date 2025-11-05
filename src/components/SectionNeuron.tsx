import { useEffect, useRef, useCallback } from 'react'
import NeuronGraphic, { NeuronGraphicHandle } from './NeuronGraphic'

type Region = 'soma' | 'apical' | 'basalL' | 'basalR' | 'axon'

type SectionNeuronProps = {
  onSynchrony?: () => void
  isSynchronizing?: boolean
  synchronyRegion?: Region
  orientation?: 'horizontal-up' | 'horizontal-down' | 'vertical'
  pattern?: number
  synapseTarget?: { x: number; y: number }
}

export default function SectionNeuron({
  onSynchrony: _onSynchrony,
  isSynchronizing = false,
  synchronyRegion,
  orientation = 'horizontal-up',
  pattern = 0,
  synapseTarget,
}: SectionNeuronProps) {
  const neuronRef = useRef<NeuronGraphicHandle>(null)
  const timeoutRef = useRef<number | null>(null)
  const isHoveredRef = useRef(false)

  const regions: Region[] = ['soma', 'apical', 'basalL', 'basalR']
  const isTouchDevice = 'ontouchstart' in window

  const scheduleNextPulse = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const baseInterval = isTouchDevice ? 24000 : 12000
    const maxInterval = isTouchDevice ? 100000 : 50000
    const interval = baseInterval + Math.random() * (maxInterval - baseInterval)
    const adjustedInterval = isHoveredRef.current ? interval / 5 : interval

    timeoutRef.current = window.setTimeout(() => {
      if (neuronRef.current && !isSynchronizing) {
        const region = regions[Math.floor(Math.random() * regions.length)]
        neuronRef.current.pulseRegion(region)
      }
      scheduleNextPulse()
    }, adjustedInterval)
  }, [isSynchronizing, isTouchDevice])

  useEffect(() => {
    scheduleNextPulse()
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [scheduleNextPulse])

  useEffect(() => {
    if (isSynchronizing && neuronRef.current && synchronyRegion) {
      neuronRef.current.pulseRegion(synchronyRegion)
    }
  }, [isSynchronizing, synchronyRegion])

  const handleMouseEnter = () => {
    isHoveredRef.current = true
    if (neuronRef.current && !isSynchronizing) {
      const region = regions[Math.floor(Math.random() * regions.length)]
      neuronRef.current.pulseRegion(region)
    }
    scheduleNextPulse()
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    scheduleNextPulse()
  }

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
}
