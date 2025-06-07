import { createRoot } from 'react-dom/client'
import { AuthWrapper } from '@/auth/use-auth-hooks.convex'
import { Routes } from './routes.gen'
import './app.css'

const container = document.getElementById('app')!
createRoot(container).render(
  <AuthWrapper>
    <Routes />
  </AuthWrapper>
)
