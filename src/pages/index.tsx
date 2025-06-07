import { useAuth } from "@/auth/use-auth-hooks.convex";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Loader = () => console.log('Route loader')
export const Action = () => console.log('Route action')

export const Pending = () => <div>Loading...</div>
export const Catch = () => <div>Route error</div>

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate({ to: "/app/events" });
      } else {
        navigate({ to: "/auth/sign-in" });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return null;
}
