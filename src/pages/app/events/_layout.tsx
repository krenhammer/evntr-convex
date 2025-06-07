import { Outlet } from '@tanstack/react-router'
import { useAuth } from '@/auth/use-auth-hooks.convex';
import SignIn from '../../auth/sign-in';

export default function EventsLayout() {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <SignIn />;
  }

  return (
    <div>
      <h1>Events Layout</h1>
      <Outlet />
    </div>
  )
}
