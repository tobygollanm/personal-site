import { useState, useEffect, useRef, useCallback } from 'react'

type MediaItem = {
  type: 'image' | 'video'
  src: string
  label?: string
}

type ImageSlideshowProps = {
  images: (string | MediaItem)[]
  interval?: number // milliseconds between slides
  className?: string
}

type SlideLabel = {
  text: string
  hasArrow: boolean
  arrowTarget?: 'upper-left-quadrant' | 'center'
  fontFamily?: string // Handwriting font to use
}

export default function ImageSlideshow({ 
  images, 
  interval = 4000,
  className = ''
}: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const videoLoopCounts = useRef<Map<number, number>>(new Map())
  const slideContainerRef = useRef<HTMLDivElement>(null)
  
  // Touch/swipe state for mobile
  const touchStartXRef = useRef<number>(0)
  const touchStartYRef = useRef<number>(0)
  const isSwipingRef = useRef<boolean>(false)
  const isMobileRef = useRef<boolean>(false)

  // Normalize images array to MediaItem format
  const mediaItems: MediaItem[] = images.map((img, index) => {
    if (typeof img === 'string') {
      return { type: 'image', src: img }
    }
    return img
  })
  
  // Get labels for each slide
  const getSlideLabel = (src: string): SlideLabel | null => {
    if (src.includes('slide3.mp4')) {
      return {
        text: "neurons firing under a microscope (calcium-sensitive flourescence)",
        hasArrow: false,
        fontFamily: '"Caveat", cursive'
      }
    }
    if (src.includes('slide1.jpg')) {
      return {
        text: "observing a deep-brain stimulation surgery in the operating room",
        hasArrow: false,
        fontFamily: '"Caveat", cursive'
      }
    }
    if (src.includes('slide2.jpg')) {
      return {
        text: "a novel, minimally-invasive method for electrical deep brain stimulation",
        hasArrow: false,
        fontFamily: '"Caveat", cursive'
      }
    }
    // Add labels for other slides if needed
    return null
  }
  
  const currentItem = mediaItems[currentIndex]
  const currentLabel = getSlideLabel(currentItem.src)

  // Navigation functions - manual only (auto-switch removed)
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }, [mediaItems.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
  }, [mediaItems.length])

  // Handle video playback with 3-loop limit
  useEffect(() => {
    mediaItems.forEach((item, index) => {
      const video = videoRefs.current[index]
      if (video && item.type === 'video') {
        if (index === currentIndex) {
          // Reset loop count when video becomes active
          videoLoopCounts.current.set(index, 0)
          
          // Load and play current video
          video.load() // Reload to ensure it's ready
          setTimeout(() => {
            video.play().catch(err => {
              console.warn('Video autoplay prevented:', err)
            })
          }, 100)
        } else {
          // Pause other videos and reset their loop counts
          video.pause()
          video.currentTime = 0 // Reset to start
          videoLoopCounts.current.set(index, 0)
        }
      }
    })
  }, [currentIndex, mediaItems])

  // Touch/swipe handlers for mobile
  useEffect(() => {
    const container = slideContainerRef.current
    if (!container || mediaItems.length <= 1) return

    // Check if mobile
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      touchStartXRef.current = touch.clientX
      touchStartYRef.current = touch.clientY
      isSwipingRef.current = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartXRef.current
      const deltaY = Math.abs(touch.clientY - touchStartYRef.current)
      
      // Only consider it a swipe if horizontal movement is greater than vertical
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
        isSwipingRef.current = true
        // Prevent scrolling while swiping
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwipingRef.current) return
      
      const touch = e.changedTouches[0]
      if (!touch) return
      
      const deltaX = touch.clientX - touchStartXRef.current
      const swipeThreshold = 50 // Minimum distance for a swipe
      
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
          // Swipe right - go to previous slide
          goToPrevious()
        } else {
          // Swipe left - go to next slide
          goToNext()
        }
      }
      
      isSwipingRef.current = false
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('resize', checkMobile)
    }
  }, [mediaItems.length, goToPrevious, goToNext])

  if (mediaItems.length === 0) {
    return null
  }

  return (
    <div 
      ref={slideContainerRef}
      className={`relative w-full ${className}`} 
      style={{ 
        height: '400px', 
        maxHeight: '70vh',
        touchAction: 'pan-y pinch-zoom' // Allow vertical scrolling and pinch zoom, but handle horizontal swipes
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 767px) {
          .portrait-video-slide {
            transform: translateX(-50%) scale(2) !important;
          }
          .landscape-slide {
            transform: scale(1.3) !important;
          }
        }
      `}} />
      {/* Caption text - positioned below slides, centered */}
      {currentLabel && (
        <div
          className="absolute w-full"
          style={{
            top: '100%',
            marginTop: '5px', // 5px below slides on mobile and desktop
            fontFamily: 'IBM Plex Mono, monospace', // Normal page font
            fontSize: 'clamp(0.77rem, 1.76vw, 0.88rem)', // 20% smaller than before (was 0.9625rem to 1.1rem)
            color: 'hsl(0, 0%, 78%)', // 20% darker gray (foreground is 98%, so 78% is 20% darker)
            lineHeight: '1.2',
            zIndex: 30,
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          <span>{currentLabel.text}</span>
        </div>
      )}
      
      {/* Media stack with crossfade - fixed container height so text stays in place */}
      {mediaItems.map((item, index) => {
        const isActive = index === currentIndex
        
        if (item.type === 'video') {
          // Check if this is the portrait video (slide3.mp4) - scale it down to fit landscape container
          const isPortraitVideo = item.src.includes('slide3.mp4')
          
          return (
            <video
              key={index}
              ref={(el) => { videoRefs.current[index] = el }}
              src={item.src}
              className={`absolute transition-opacity duration-1000 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              } ${isPortraitVideo ? 'portrait-video-slide' : 'landscape-slide'}`}
              style={{
                ...(isPortraitVideo ? {
                  width: 'auto',
                  height: '100%',
                  maxWidth: '50%',
                  left: '50%',
                  transform: 'translateX(-50%)'
                } : {
                  width: '100%',
                  height: '100%'
                }),
                top: '0',
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              autoPlay={isActive}
              loop={false}
              muted
              playsInline
              preload="auto"
              onLoadedData={(e) => {
                // Ensure video plays when it loads and is active
                if (isActive && e.currentTarget) {
                  e.currentTarget.play().catch(err => {
                    console.warn('Video autoplay error:', err)
                  })
                }
              }}
              onError={(e) => {
                console.error('Video load error for:', item.src, e)
              }}
              onCanPlay={(e) => {
                // Try playing when video is ready
                if (isActive && e.currentTarget.paused) {
                  e.currentTarget.play().catch(() => {})
                }
              }}
              onEnded={(e) => {
                // Handle loop counting - play 3 times total
                const currentCount = videoLoopCounts.current.get(index) || 0
                if (currentCount < 2) {
                  // Increment count and restart video
                  videoLoopCounts.current.set(index, currentCount + 1)
                  e.currentTarget.currentTime = 0
                  e.currentTarget.play().catch(() => {})
                } else {
                  // After 3 loops, pause and reset
                  videoLoopCounts.current.set(index, 0)
                  e.currentTarget.pause()
                }
              }}
            />
          )
        }

        return (
          <img
            key={index}
            src={item.src}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 transition-opacity duration-1000 landscape-slide ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        )
      })}
      
      {/* Navigation buttons - small, lined, transparent gray */}
      {mediaItems.length > 1 && (() => {
        const isPortraitSlide = currentItem.src.includes('slide3.mp4')
        const arrowOffset = isPortraitSlide ? '-60px' : '-72px'
        return (
          <>
            {/* Previous button - left side */}
            <button
              onClick={goToPrevious}
              className="absolute top-1/2 -translate-y-1/2 z-20 p-2 text-white hover:opacity-70 transition-opacity duration-200"
              aria-label="Previous slide"
              style={{ left: arrowOffset }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Next button - right side */}
            <button
              onClick={goToNext}
              className="absolute top-1/2 -translate-y-1/2 z-20 p-2 text-white hover:opacity-70 transition-opacity duration-200"
              aria-label="Next slide"
              style={{ right: arrowOffset }}
            >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          </>
        )
      })()}
    </div>
  )
}
