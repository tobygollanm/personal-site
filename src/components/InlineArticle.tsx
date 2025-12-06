import { useState } from 'react'

type InlineArticleProps = {
  title: string
  content: React.ReactNode
  children: React.ReactNode
}

export default function InlineArticle({ title, content, children }: InlineArticleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      <span
        className="underline cursor-pointer hover:opacity-70 transition-opacity inline"
        onClick={handleClick}
      >
        {children}
      </span>

      {/* Inline expanded view - appears below the link with background overlay */}
      {isExpanded && (
        <div 
          className="w-full my-4 block" 
          style={{ 
            clear: 'both',
            position: 'relative',
          }}
        >
          <div 
            className="max-w-3xl w-full"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '4px',
            }}
          >
            <div className="space-y-4" style={{ padding: '0' }}>
              <h3 className="text-xl font-normal text-foreground">{title}</h3>
              <div className="text-foreground space-y-4 leading-relaxed">
                {content}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
