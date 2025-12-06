import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import StimulateNeuronHero from '../components/StimulateNeuronHero'
import IntroReveal from '../components/IntroReveal'
import ImageSlideshow from '../components/ImageSlideshow'
import IntroNeuronLogo from '../components/IntroNeuronLogo'
import MediaPopup from '../components/MediaPopup'
import InlineArticle from '../components/InlineArticle'
import { useSidebar } from '../components/Layout'

export default function Home() {
  const [showIntro, setShowIntro] = useState(false)
  const [darkeningOpacity, setDarkeningOpacity] = useState(0)
  const { setMenuVisible } = useSidebar()
  const location = useLocation()
  const introRevealRef = useRef<{ triggerPeptideSync: () => void }>(null)

  // Sync menu visibility when intro completes
  useEffect(() => {
    setMenuVisible(showIntro)
  }, [showIntro, setMenuVisible])

  // Start darkening overlay immediately when neuropeptide release begins
  // Fades over 2020ms (200ms delay + 1820ms slide) to finish when page settles
  const handlePeptideRelease = () => {
    // Trigger the fade-in - CSS transition will handle the animation
    setDarkeningOpacity(0.3) // 30% max opacity (20% darker than 25%)
  }

  // Reset darkening when intro restarts
  useEffect(() => {
    if (!showIntro) {
      setDarkeningOpacity(0)
    }
  }, [showIntro])

  // Handle hash-based navigation (e.g., /#research) - scroll to section after intro completes
  useEffect(() => {
    if (showIntro && location.hash) {
      const sectionId = location.hash.substring(1) // Remove the '#'
      const sectionElement = document.getElementById(sectionId)
      if (sectionElement) {
        // Wait a bit for the transition to complete, then scroll
        setTimeout(() => {
          const mainContent = sectionElement.closest('.main-content-scrollable')
          if (mainContent) {
            const containerRect = mainContent.getBoundingClientRect()
            const elementRect = sectionElement.getBoundingClientRect()
            const scrollOffset = elementRect.top - containerRect.top + mainContent.scrollTop - 20
            mainContent.scrollTo({
              top: scrollOffset,
              behavior: 'smooth'
            })
          }
        }, 500) // Wait for slide animation
      }
    }
  }, [showIntro, location.hash])

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Background darkening layer - positioned behind all content */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${darkeningOpacity})`,
          transition: 'opacity 2020ms ease-out',
          zIndex: 0
        }}
      />
      {/* Container that holds both intro and menu pages side-by-side with no gap */}
      <div 
        className="flex h-full transition-transform ease-in-out relative"
        style={{ 
          transform: showIntro ? 'translateX(-100vw)' : 'translateX(0)',
          willChange: 'transform',
          width: '200vw',
          gap: 0,
          transitionDuration: '1820ms', // 30% slower than 1400ms (1400 * 1.3 = 1820ms)
          zIndex: 1
        }}
      >
        {/* Intro page - left side, full viewport width */}
        <div className="w-screen h-full flex-shrink-0 relative overflow-hidden" style={{ margin: 0, padding: 0 }}>
          <StimulateNeuronHero 
            onDone={() => setShowIntro(true)}
            onPeptideImpact={() => {
              if (introRevealRef.current) {
                introRevealRef.current.triggerPeptideSync()
              }
            }}
            onPeptideRelease={handlePeptideRelease}
          />
        </div>
        
        {/* Menu page - right side, full viewport width, positioned immediately to the right of intro with no gap */}
        <div className="w-screen h-full flex-shrink-0 flex flex-col" style={{ margin: 0, padding: 0, marginLeft: 0 }}>
          {/* Header spanning full width (sidebar + main content) */}
          {showIntro && (
            <header className="w-full flex items-end relative" style={{ paddingTop: '0px', paddingBottom: '0px' }}>
              {/* Desktop version - Left side - headshot (in sidebar area) */}
              <div className="hidden md:block w-64 flex-shrink-0 flex items-end justify-center">
                <div style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}images/about/headshot.jpg`}
                    alt="Toby Gollan-Myers"
                    className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full"
                  />
                </div>
              </div>
              
              {/* Desktop version - Text and neuron - 10px to the right of headshot's right edge, positioned absolutely */}
              <div className="hidden md:flex flex-col items-center absolute" style={{ left: '174px', top: 'calc(50% - 50px)' }}>
                <h1 className="font-normal text-foreground uppercase text-xl md:text-2xl tracking-wider whitespace-nowrap" style={{ margin: 0, padding: 0 }}>
                  TOBY GOLLAN-MYERS
                </h1>
                <div style={{ marginTop: '-2px', transform: 'translateY(-18px)' }}>
                  <IntroNeuronLogo size={94} />
                </div>
              </div>
              
              {/* Mobile version - horizontal header */}
              <div className="flex md:hidden items-center justify-center w-full py-2" style={{ gap: '16px' }}>
                <h1 className="font-normal text-foreground uppercase text-lg tracking-wider whitespace-nowrap" style={{ transform: 'scale(1.2)', transformOrigin: 'left center', marginLeft: '5px' }}>
                  TOBY GOLLAN-MYERS
                </h1>
                <div style={{ transform: 'scale(1.35375)', transformOrigin: 'center', marginLeft: '30px' }}>
                  <IntroNeuronLogo size={60} />
                </div>
              </div>
            </header>
          )}
          
          {/* Content area - sidebar and main content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0 h-full overflow-hidden">
              <div 
                style={{ 
                  transform: 'scale(0.7)',
                  transformOrigin: 'top left',
                  height: '100%',
                }}
              >
                <IntroReveal ref={introRevealRef} />
              </div>
            </div>
            
            {/* Main content - scrollable area with all sections */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden main-content-scrollable flex flex-col" style={{ paddingBottom: '30px' }}>
              <div className="flex-1">
                <div className="max-w-3xl mx-auto main-content-wrapper" style={{ padding: '1rem', paddingLeft: '12.8px', marginTop: '-35px' }}>
                  <style dangerouslySetInnerHTML={{__html: `
                    @media (min-width: 768px) {
                      .main-content-wrapper {
                        padding: 2rem !important;
                        padding-left: 25.6px !important;
                      }
                    }
                  `}} />
                {/* Home Section */}
                <section id="about" className="min-h-screen flex flex-col justify-center py-8 md:py-12" style={{ marginTop: '-20px' }}>
                {/* Image Slideshow */}
                <div className="mb-6 md:mb-8" style={{ marginBottom: 'calc(1.5rem + 10px)' }}>
                  {/* Mobile: 70% width, Desktop: full width */}
                  <div style={{ width: '70%', margin: '0 auto' }} className="md:w-full md:m-0">
                    <ImageSlideshow
                      images={[
                        { type: 'video', src: `${import.meta.env.BASE_URL}images/about/slide3.mp4` },
                        `${import.meta.env.BASE_URL}images/about/slide1.jpg`,
                        `${import.meta.env.BASE_URL}images/about/slide2.jpg`,
                      ]}
                      interval={7000}
                      className="rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="space-y-4 text-sm md:text-base text-foreground font-normal">
                  <p className="leading-relaxed">
                    Hi, I'm Toby. My main mission is to create neurotechnology for the enhancement of human health, performance and wellbeing.
                    <br /><br />
                    Recently, I turned down an offer to do a PhD in Biomedical Engineering at Carnegie Mellon, moved to San Francisco, and started a company with the goal of turning non-invasive focused ultrasound brain stimulation from a research tool into a seamless product that any clinic—and later, any normal person—can use.
                    <br /><br />
                    Before this, I:
                    <br /><br />
                    - Started my first company at 17 (AI-driven digital ads). Hired a few employees, landed celebrity clients and large real estate developers, made some $$.
                    <br /><br />
                    - Studied brain science at UC Santa Barbara, did research on how neurons metabolize proteins that contribute to Alzheimer's disease (<a href="https://pubmed.ncbi.nlm.nih.gov/40964962/" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:opacity-70 transition-opacity">Published Here</a>).
                    <br /><br />
                    - Started a company with two PhD students in my lab building a new technology for non-invasive electrical stimulation in the deep brain.
                    <br /><br />
                    - Won a year-long accelerator, filed patents on the tech.
                    <br /><br />
                    - Did seasonal work in EMS as a CA State Parks Lifeguard. Made ocean/trail rescues, drove trucks on the beach, saved some lives, and ate many burritos. Listened to a lot of sci/tech podcasts while watching the water.
                  </p>
                </div>
              </section>

              {/* Projects Section */}
              <section id="research" className="min-h-screen flex flex-col justify-center py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-normal text-foreground mb-4 md:mb-6">Projects</h2>
                <div className="space-y-4 text-sm md:text-base text-foreground font-normal">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Predictive generative mapping of brain regions from limited structural information by fusing structural MRI with a bunch of other measurements. Goal is to eliminate MRI requirements from certain deep-brain neuromod workflows</li>
                    <li>Simplified neuronavigation systems for at-home neuromodulation</li>
                    <li>A new method of highly-precise peripheral nerve stimulation for certain types of neuropathic pain.</li>
                    <li>A few new things in the works that I can't yet post on here.</li>
                  </ul>
                </div>
              </section>

              {/* Neurotech Section */}
              <section id="neurotech" className="min-h-screen flex flex-col justify-center py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-normal text-foreground mb-4 md:mb-6">Neurotech</h2>
                <div className="space-y-4 text-sm md:text-base text-foreground font-normal">
                  <p>
                    Pick any two random neuroscientists and put them in a room together, and there's a pretty damn solid chance that they would barely be able to understand each others' work.
                    <br />
                    Neurotech can be anything from a stimulator implanted into your deep brain to a wristband that electrically stimulates nerves in your wrist to reduce tremors (one of the most clever devices of the decade: <a href="https://calahealth.com/" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:opacity-70 transition-opacity">https://calahealth.com/</a>).
                  </p>
                  <p>
                    My main area of technical depth lies in non-invasive and minimally-invasive neuromodulation of deep brain networks and the supporting technology needed to do this at scale.
                    <br />
                    I've also worked on methods for collecting and packaging different types of brain-related data for training ML models on relationships between how you stimulate different networks and what outcomes you get, as well as how to better predict where you're hitting with much less available data.
                  </p>
                </div>
              </section>

              {/* Writing Section */}
              <section id="writing" className="min-h-screen flex flex-col justify-center py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-normal text-foreground mb-4 md:mb-6">Writing</h2>
                <div className="space-y-4 text-sm md:text-base text-foreground font-normal">
                  <p>
                    I write about a bunch of stuff, mostly to organize my thoughts. Some of the 'stuff' in question, I will be posting here in the coming months. Opinions, flaws, deepest darkest secrets, and theses on the field of health/wellness/neurotech.
                  </p>
                  <p>
                    <InlineArticle
                      title="An overlooked but important process for designing deep tech therapies"
                      content={
                        <div className="space-y-4 leading-relaxed">
                          <p>
                            My first neurotech company was built around a very complex, cool technology that we planned to use to non-invasively stimulate the deep-brain (with electricity). It involved opening the blood-brain barrier with ultrasound, delivering piezoelectric nanoparticles (meaning they convert mechanical force into electrical), and then sending the patient home with the tiny particles safely embedded between their neurons and an ultrasound device they could wear to activate the particles wirelessly. When the ultrasound hit the particles, they'd deliver tiny electrical impulses to the neurons, replacing invasive, wired brain implants.
                          </p>
                          <p>
                            Over the course of my time building, I spent a considerable amount of time with doctors, insurers, clinical researchers, and neurosurgeons to understand how neuromodulation treatments need to be designed in order to reach a lot of people quickly. If you look closely at the background picture of this website you'll see me, scrubbed up, in a deep-brain stimulation clinic watching some dude get wires inserted into his brain to treat his Parkinson's—a technology that's been around for more than 20 years now and actually works incredibly well for &gt;75% of patients.
                          </p>
                          <p>
                            The problem, of course, is that most people won't or can't get a surgery like this, let alone make it into a clinic that has the expertise and equipment to provide this kind of thing. Shockingly, a vast majority of people with Parkinson's don't even get so see a neurologist, and even fewer see a doctor who specializes in movement disorders. They're treated by normal doctors, and those doctors often don't even know many treatment options beyond the few well-known drugs (e.g. Levodopa). This is true for most of the Parkinson's community, as it is for many disorders. Learning this slapped me in the face with a pretty hard truth: if we want to get our tech to millions of people, not thousands, we don't get optimize our tech to work super well within an optimal environment with maximum equipment. We have to build things that work for the majority of the people who actually need treatment, even if this means we sacrifice a set of features.
                          </p>
                          <p className="italic" style={{ fontSize: '2em' }}>
                            Would you rather treat 8,000 patients with an 80% success rate, or 1 million patients with a 40% success rate? The answer is pretty obvious to me.
                          </p>
                          <p>
                            Often, though, the difference I'm describing doesn't come down to a few features. It comes down to the entire design, from step 1. For my first startup, this meant rethinking everything. Ultimately, the most important thing to do before even creating a functional prototype is to go into the clinic, talk to the actual people who will be buying the treatment, and then reverse engineer that to figure out what needs to be built to make it work. It's shocking how many companies in this industry don't do this. In other industries, this is called market validation, and is done in pursuit of the holy grail of any business: product-market fit. In science, we call this ecological validity. Whatever you want to call it, it's really damn important for building something that creates value, and in my opinion, the market validation approach is very under-utilized in the realm of medical tech and the adjacent wellness/health tech space. Yes, the process is messier. With software, you can test different features of a product on your customers and get literal data on what works better. You don't get that same luxury when it takes months-to-years and half your capital to build your prototype, and you can't just edit the source code.This is why I would argue it's even more important to go talk to the people who will use your product so you end up building something based on actual feedback, and not fall into the trap of 'if we build it, they come'. In our case, the 'customer' was 3-pronged: the doctors who give the tech to their patients. The patients themselves. The insurance companies, who decide how and when most people can pay for the treatment. It gets even more complicated when you start to realize that these groups have very different needs and incentives, and that they aren't always aligned. The solution is one that can be applied to many areas of life: have more conversations. Talk. More importantly, listen. Doctors, customers, patients, and consumers are living the problem every day and will have not only insight, but their own ideas. I've found people will often literally tell you what to build for them. This is what I love so much about startups—the whole game is about solving problems for people (also creating things people love, both awesome endeavors.)
                          </p>
                        </div>
                      }
                    >
                      An overlooked but important process for designing deep tech therapies
                    </InlineArticle>
                  </p>
                </div>
              </section>

              {/* Other Stuff Section */}
              <section id="misc" className="min-h-screen flex flex-col justify-center py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-normal text-foreground mb-4 md:mb-6">Other stuff I do (hard to keep track)</h2>
                <div className="space-y-4 text-sm md:text-base text-foreground font-normal">
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <MediaPopup src={`${import.meta.env.BASE_URL}images/misc/surfvid.mp4`} type="video">
                        Surf gnarly waves
                      </MediaPopup> and try to do an air reverse (not even close)
                    </li>
                    <li>
                      <MediaPopup src={`${import.meta.env.BASE_URL}images/misc/trailrun.jpg`} type="image">
                        Run trails
                      </MediaPopup>, up and down mountains. If I can't make it to the trails, the hills of SF are plenty steep.
                    </li>
                    <li>
                      Play guitar, bass, banjo. Played <MediaPopup src={`${import.meta.env.BASE_URL}images/misc/birchwood.jpg`} type="image">
                        sick shows
                      </MediaPopup> with 1000+ crowds.
                    </li>
                    <li>
                      Ceramic mugs made with my piezoelectric nanoparticles baked into the glaze. Luckily the barium stays locked into the crystalline structure even at very high temperatures, so they're safe to drink from.
                    </li>
                    <li>
                      Planned 3 retreats, biggest was 40+ ppl to Big Sur. Awesome times.
                    </li>
                    <li>
                      Investing small amounts in psychedelic therapy and other new psychiatric tech companies I think will succeed <InlineArticle
                        title="Future of psychiatric medicine"
                        content={
                          <div className="space-y-4">
                            <p className="leading-relaxed">
                              [Article content to be added]
                            </p>
                          </div>
                        }
                      >
                        [link to my future of psychiatric medicine article]
                      </InlineArticle>
                    </li>
                  </ul>
                </div>
              </section>
                </div>
              </div>
              
              {/* Footer with neuron logo */}
              {showIntro && (
                <footer className="w-full py-4 md:py-6 flex justify-center items-center border-t border-border mt-auto">
                  <IntroNeuronLogo size={80} className="opacity-60" />
                </footer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
