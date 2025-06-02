import { Outlet } from '@tanstack/react-router'
import { SignIn } from '../../auth/sign-in';

export default function About() {

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
