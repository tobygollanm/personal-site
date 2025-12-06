import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NeuronsChain from './pages/NeuronsChain'

// Base path for GitHub Pages (empty string for local dev, '/personal-site' for production)
const basename = import.meta.env.PROD ? '/personal-site' : ''

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
