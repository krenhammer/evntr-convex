import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("flow", flow);
    await signIn("password", formData);
  };

  const handleGoogleSignIn = async () => {
    await signIn("google");
  };

  return (
    <div>
      {/* Email/Password Form */}
      <form onSubmit={handlePasswordSignIn}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <input type="hidden" name="flow" value={flow} />
        <button type="submit">{flow === "signIn" ? "Sign In" : "Sign Up"}</button>
        <button
          type="button"
          onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
        >
          {flow === "signIn" ? "Need an account? Sign Up" : "Have an account? Sign In"}
        </button>
      </form>

      {/* Google OAuth Button */}
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}