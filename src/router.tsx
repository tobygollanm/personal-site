import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NeuronsChain from './pages/NeuronsChain'
import Research from './pages/Research'
import Neurotech from './pages/Neurotech'
import Writing from './pages/Writing'
import Misc from './pages/Misc'

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
      {
        path: 'research',
        element: <Research />,
      },
      {
        path: 'neurotech',
        element: <Neurotech />,
      },
      {
        path: 'writing',
        element: <Writing />,
      },
      {
        path: 'misc',
        element: <Misc />,
      },
    ],
  },
])
