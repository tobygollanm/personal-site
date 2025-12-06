import { useState } from 'react'

type ArticleModalProps = {
  title: string
  content: React.ReactNode
  children: React.ReactNode
}

export default function ArticleModal({ title, content, children }: ArticleModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="underline cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setIsOpen(true)}
      >
        {children}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-background max-w-3xl w-full p-8 rounded-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-foreground text-2xl hover:opacity-70"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-normal text-foreground mb-6">{title}</h2>
            <div className="text-foreground space-y-4">{content}</div>
          </div>
        </div>
      )}
    </>
  )
}

