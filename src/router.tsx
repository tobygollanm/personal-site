import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NeuronsChain from './pages/NeuronsChain'

// Base path - empty string for root (custom domain serves from root)
// If using custom domain, always use root. If you need github.io/personal-site/, 
// use runtime detection: window.location.hostname.includes('github.io') ? '/personal-site' : ''
const basename = ''

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'neurons',
        element: <NeuronsChain />,
      },
      // Redirect section routes to home page - they're now sections on the home page
      {
        path: 'research',
        element: <Navigate to="/#research" replace />,
      },
      {
        path: 'neurotech',
        element: <Navigate to="/#neurotech" replace />,
      },
      {
        path: 'writing',
        element: <Navigate to="/#writing" replace />,
      },
      {
        path: 'misc',
        element: <Navigate to="/#misc" replace />,
      },
    ],
  },
], {
  basename: basename,
})
