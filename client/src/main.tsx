import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { router } from './routes'
import { useAuthStore } from './stores/authStore'
import './index.css'

const queryClient = new QueryClient()

// Restore any existing session from the httpOnly refresh cookie before the router renders.
useAuthStore.getState().bootstrap()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
