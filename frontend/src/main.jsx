import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1c1c2a', color: '#e8e8f0', border: '1px solid rgba(255,255,255,0.07)' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)
