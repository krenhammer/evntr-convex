import React from "react";
import { useAuth } from "../use-auth-hooks.convex";

interface SignedOutProps {
  children: React.ReactNode;
}

export function SignedOut({ children }: SignedOutProps) {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? <>{children}</> : null;
} 