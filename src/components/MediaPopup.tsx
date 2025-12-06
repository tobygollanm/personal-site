import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

type MediaPopupProps = {
  src: string
  type: 'image' | 'video'
  alt?: string
  children: React.ReactNode
}

export default function MediaPopup({ src, type, alt, children }: MediaPopupProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const linkRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    updatePopupPosition(e.clientX, e.clientY)
    setIsHovering(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isHovering && !isExpanded) {
      updatePopupPosition(e.clientX, e.clientY)
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
    setIsHovering(false)
  }

  const updatePopupPosition = (clientX: number, clientY: number) => {
    const popupWidth = 200
    const popupHeight = 150
    const offset = 15
    
    let x = clientX - popupWidth / 2
    let y = clientY - popupHeight - offset
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 10
    
    x = Math.max(padding, Math.min(x, viewportWidth - popupWidth - padding))
    y = Math.max(padding, Math.min(y, viewportHeight - popupHeight - padding))
    
    setPopupPosition({ x, y })
  }

  // Global mouse tracking when hovering
  useEffect(() => {
    if (!isHovering || isExpanded) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      updatePopupPosition(e.clientX, e.clientY)
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove)
  }, [isHovering, isExpanded])

  const hoverPopup = isHovering && !isExpanded && (
    <div
      className="fixed pointer-events-none"
      style={{
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
        width: '200px',
        height: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        zIndex: 999999,
      }}
    >
      {type === 'image' ? (
        <img
          src={src}
          alt={alt || ''}
          className="max-w-full max-h-full object-contain"
          style={{ display: 'block' }}
        />
      ) : (
        <video
          src={src}
          className="max-w-full max-h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
          style={{ display: 'block' }}
        />
      )}
    </div>
  )

  return (
    <>
      <span
        ref={linkRef}
        className="underline cursor-pointer hover:opacity-70 transition-opacity inline"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </span>

      {/* Render hover popup in a portal to ensure it's above everything */}
      {typeof document !== 'undefined' && createPortal(hoverPopup, document.body)}

      {/* Inline expanded view - appears below the link */}
      {isExpanded && (
        <div className="w-full my-4 block" style={{ clear: 'both' }}>
          <div className="max-w-2xl w-full">
            {type === 'image' ? (
              <img
                src={src}
                alt={alt || ''}
                className="w-full h-auto object-contain rounded-lg"
              />
            ) : (
              <video
                src={src}
                className="w-full h-auto object-contain rounded-lg"
                controls
                autoPlay
                loop
                muted
                playsInline
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
