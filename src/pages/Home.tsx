import { useState } from 'react'
import StimulateNeuronHero from '../components/StimulateNeuronHero'
import IntroReveal from '../components/IntroReveal'

export default function Home() {
  const [showIntro, setShowIntro] = useState(false)

  return (
    <>
      {!showIntro && <StimulateNeuronHero onDone={() => setShowIntro(true)} />}
      {showIntro && <IntroReveal />}
    </>
  )
}
