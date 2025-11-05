import { useEffect, useRef, useCallback } from 'react'
import NeuronGraphic, { NeuronGraphicHandle } from '../components/NeuronGraphic'

const NUM_NEURONS = 5

export default function NeuronsChain() {
  const neuronRefs = useRef<(NeuronGraphicHandle | null)[]>([])
  const timeoutRefs = useRef<(number | null)[]>([])

  const regions: ('soma' | 'apical' | 'basalL' | 'basalR')[] = ['soma', 'apical', 'basalL', 'basalR']

  const schedulePulse = useCallback((index: number) => {
    if (timeoutRefs.current[index]) {
      clearTimeout(timeoutRefs.current[index])
    }

    const interval = 20000 + Math.random() * 50000 // 20-70s
    timeoutRefs.current[index] = window.setTimeout(() => {
      const neuron = neuronRefs.current[index]
      if (neuron) {
        const region = regions[Math.floor(Math.random() * regions.length)]
        neuron.pulseRegion(region)
      }
      schedulePulse(index)
    }, interval)
  }, [])

  useEffect(() => {
    neuronRefs.current.forEach((_, index) => {
      schedulePulse(index)
    })

    return () => {
      timeoutRefs.current.forEach((timeout) => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [schedulePulse])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column: stacked neurons */}
          <div className="flex-1 flex flex-col items-center gap-16 py-8">
            {Array.from({ length: NUM_NEURONS }).map((_, index) => (
              <div key={index} className="relative">
                <NeuronGraphic
                  ref={(el) => {
                    neuronRefs.current[index] = el
                  }}
                  size={400}
                  className="transform rotate-180"
                />
                {index < NUM_NEURONS - 1 && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-16 bg-black" />
                )}
              </div>
            ))}
            {/* Top axon exit */}
            <div className="w-1 h-24 bg-black mt-4" />
          </div>

          {/* Right side: blank for now */}
          <div className="flex-1 hidden md:block" />
        </div>
      </div>
    </div>
  )
}
