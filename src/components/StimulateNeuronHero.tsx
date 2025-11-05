import { useEffect, useState, useRef } from 'react'

type Phase = 'idle' | 'firing' | 'release' | 'reveal'

type StimulateNeuronHeroProps = {
  onDone: () => void
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

export default function StimulateNeuronHero({ onDone }: StimulateNeuronHeroProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const prefersReduced = usePrefersReducedMotion()

  const CONDUCTION_MS = prefersReduced ? 600 : 1500
  const RELEASE_MS = prefersReduced ? 500 : 1400
  const REVEAL_DELAY_MS = 600

  const handleStimulate = () => {
    if (phase !== 'idle') return
    setPhase('firing')
  }

  useEffect(() => {
    if (phase === 'firing') {
      const t = setTimeout(() => setPhase('release'), CONDUCTION_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'release') {
      const t = setTimeout(() => setPhase('reveal'), RELEASE_MS + REVEAL_DELAY_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'reveal') {
      const t = setTimeout(() => {
        onDone()
      }, 400)
      return () => clearTimeout(t)
    }
  }, [phase, CONDUCTION_MS, RELEASE_MS, onDone])

  return (
    <section className="relative min-h-screen grid place-items-center overflow-hidden bg-white text-black">
      <NeuronModule
        phase={phase}
        prefersReduced={prefersReduced}
        onStimulate={handleStimulate}
        disabled={phase !== 'idle'}
      />
    </section>
  )
}

function NeuronModule({
  phase,
  prefersReduced,
  onStimulate,
  disabled,
}: {
  phase: string
  prefersReduced: boolean
  onStimulate: () => void
  disabled: boolean
}) {
  const pathRef = useRef<SVGPathElement | null>(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    path.style.strokeDashoffset = phase === 'firing' ? '0' : `${len}`
    path.style.setProperty('--axon-len', `${len}`)
  }, [phase])

  return (
    <div className="relative z-10 grid place-items-center mt-6">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="w-[800px] max-w-[94vw] h-[400px]"
          viewBox="0 0 600 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="axonGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffe570" />
            </linearGradient>
          </defs>

          <g id="neuron">
            {/* Axon (horizontal, rightward) */}
            <path
              d="M150 200 L205 192 L260 196 L310 201 L360 199 L404 199"
              className="stroke-black/70"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active conduction overlay */}
            <path
              ref={pathRef}
              d="M150 200 L205 192 L260 196 L310 201 L360 199 L404 199"
              stroke="url(#axonGlow)"
              className={phase === 'firing' ? 'axon-conduct' : 'opacity-0'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255,244,128,.9)) drop-shadow(0 0 18px rgba(255,255,255,.7))',
              }}
            />

            {/* Pre-synaptic axon terminal (V-shaped bouton) */}
            <g id="bouton" transform="translate(404, 199)">
              <path
                d="M0 0 L12 -9 M0 0 L12 9"
                className="stroke-black/70"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[0, 1, 2, 3].map((i) => (
                <circle
                  key={i}
                  cx={12}
                  cy={-2 + i * 4}
                  r={3.5}
                  className={`fill-black ${phase === 'release' ? `animate-vesicle-${i}` : 'opacity-80'}`}
                />
              ))}
            </g>

            {/* Soma (small black dot) */}
            <circle cx="150" cy="200" r="6" className="fill-black" />

            {/* Dendrites (left side, non-colinear branches) */}
            <g className="stroke-black/70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {/* Primary branches from soma */}
              <path d="M150 200 L118 180 L92 162" />
              <path d="M150 200 L120 212 L95 232 L70 248" />
              <path d="M150 200 L186 178 L216 162 L242 152" />
              <path d="M150 200 L170 232 L190 262 L210 288" />
              <path d="M150 200 L132 194 L110 186 L90 180" />

              {/* Non-colinear offshoots */}
              <path d="M118 180 L104 166 L92 155" />
              <path d="M120 212 L104 222 L90 236" />
              <path d="M186 178 L200 162 L214 146" />
              <path d="M170 232 L184 246 L196 264" />
              <path d="M110 186 L98 176 L86 168" />
              <path d="M95 232 L82 244 L72 258" />
              <path d="M216 162 L232 156 L246 146" />
              <path d="M190 262 L202 278 L214 294" />
            </g>
          </g>
        </svg>
        <button
          onClick={onStimulate}
          disabled={disabled}
          className={`group relative px-0 py-2 text-lg font-medium text-black transition-transform duration-200 ${
            !disabled && 'hover:scale-[1.02] focus:scale-[1.02]'
          } ${disabled && 'cursor-default opacity-60'}`}
          aria-label="Stimulate neuron to start the experience"
        >
          {phase === 'idle'
            ? 'toby gollan-myers'
            : phase === 'firing'
            ? 'Axon Firing…'
            : phase === 'release'
            ? 'Vesicle Release…'
            : 'Revealing'}
        </button>
      </div>

      <style>{`
        .axon-conduct {
          animation: axonDraw ${prefersReduced ? 0.6 : 1.5}s ease-in forwards;
        }
        @keyframes axonDraw {
          from { stroke-dashoffset: var(--axon-len, 1600); }
          to { stroke-dashoffset: 0; }
        }
        ${[0, 1, 2, 3]
          .map(
            (i) =>
              `.animate-vesicle-${i} { animation: vesicle ${prefersReduced ? 0.5 : 1.4}s ${i * 0.12}s cubic-bezier(.2,.8,.2,1) forwards; }`
          )
          .join('\n')}
        @keyframes vesicle {
          0% { transform: translateX(0); opacity: .95; }
          70% { transform: translateX(160px); opacity: 1; }
          100% { transform: translateX(190px) scale(.92); opacity: .25; }
        }
      `}</style>
    </div>
  )
}
