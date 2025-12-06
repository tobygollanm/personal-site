import { Outlet, useLocation } from 'react-router-dom'
import { createContext, useContext, useState, useEffect } from 'react'

type SidebarContextType = {
  sidebarContent: React.ReactNode | null
  setSidebarContent: (content: React.ReactNode | null) => void
  menuVisible: boolean
  setMenuVisible: (visible: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within Layout')
  }
  return context
}

export default function Layout() {
  const [sidebarContent, setSidebarContent] = useState<React.ReactNode | null>(null)
  const [menuVisible, setMenuVisible] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  // Since all content is now on the home page, redirect other routes to home
  // The home page handles its own sidebar through Home.tsx
  useEffect(() => {
    if (isHomePage) {
      // On home page, clear sidebar content (it's handled by Home.tsx)
      setSidebarContent(null)
      // Don't change menuVisible on home page - it's controlled by Home.tsx
    }
    // Note: Other routes should redirect to home, but for now we'll keep the structure
    // in case we want to add separate pages later (like /neurons)
  }, [isHomePage])

  return (
    <SidebarContext.Provider value={{ sidebarContent, setSidebarContent, menuVisible, setMenuVisible }}>
      {/* Home page has its own layout with side-by-side intro and menu */}
      {isHomePage ? (
        <Outlet />
      ) : (
        <div className="h-screen flex overflow-hidden">
          {/* Left sidebar/menu area - hidden on mobile, slides in with menu page from right */}
          {sidebarContent && (
            <div 
              className="hidden md:block w-64 flex-shrink-0 overflow-y-auto overflow-x-hidden transition-transform duration-1000 ease-in-out"
              style={{ 
                transform: menuVisible ? 'translateX(0)' : 'translateX(calc(-100% - 100vw))',
                willChange: 'transform'
              }}
            >
              <div 
                style={{ 
                  transform: 'scale(0.7)',
                  transformOrigin: 'top left',
                }}
              >
                {sidebarContent}
              </div>
            </div>
          )}
          
          {/* Main content area - full width on mobile, scaled on desktop */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* Mobile: no scaling, full width */}
            <div className="md:hidden">
              <Outlet />
            </div>
            {/* Desktop: scaled content */}
            <div 
              className="hidden md:block"
              style={{ 
                transform: 'scale(0.7)',
                transformOrigin: 'top left',
                width: '142.857%',
                minHeight: '142.857vh',
              }}
            >
              <Outlet />
            </div>
          </div>
        </div>
      )}
    </SidebarContext.Provider>
  )
}
