import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Github, Loader2, Check, X } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/auth/use-auth-hooks.convex";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

// Test mode - set to true for relaxed password requirements
const TEST_MODE = true;



interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = TEST_MODE ? [
  { label: "At least 6 characters", test: (pwd) => pwd.length >= 6 },
  { label: "Contains letter", test: (pwd) => /[a-zA-Z]/.test(pwd) },
  { label: "Contains number", test: (pwd) => /\d/.test(pwd) },
] : [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "Contains uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Contains lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Contains number", test: (pwd) => /\d/.test(pwd) },
  { label: "Contains special character", test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

export default function SignUpPage() {
  const { signIn } = useAuthActions();
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState<"signUp" | { email: string }>("signUp");
  
  // Check if signup is disabled
  const isSignupDisabled = useFeatureFlag("disable_signup");

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: "/" });
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Show loading while auth state is being determined
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div>Loading...</div>
    </div>;
  }

  // Don't render anything if already signed in (but auth is loaded)
  if (isSignedIn) {
    return null;
  }

  // Redirect to waitlist if signup is disabled
  useEffect(() => {
    if (isSignupDisabled) {
      navigate({ to: "/auth/waitlist" });
    }
  }, [isSignupDisabled, navigate]);

  const handleEmailPasswordSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    const failedRequirements = passwordRequirements.filter(req => !req.test(password));
    if (failedRequirements.length > 0) {
      setError("Password does not meet all requirements");
      setIsLoading(false);
      return;
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData(event.currentTarget);
      await signIn("password", formData);
      setStep({ email: formData.get("email") as string });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      await signIn("password", formData);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "github" | "google") => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sign up with ${provider}`);
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const passedRequirements = passwordRequirements.filter(req => req.test(password)).length;
    if (passedRequirements === 0) return { strength: 0, label: "" };
    if (passedRequirements <= 2) return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (passedRequirements <= 3) return { strength: 50, label: "Fair", color: "bg-yellow-500" };
    if (passedRequirements <= 4) return { strength: 75, label: "Good", color: "bg-blue-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  if (typeof step === "object" && step.email) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              We sent a verification code to {step.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="Enter the verification code"
                  required
                  disabled={isLoading}
                />
              </div>
              <input name="flow" type="hidden" value="email-verification" />
              <input name="email" value={step.email} type="hidden" />
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep("signUp")}
              disabled={isLoading}
            >
              Back to Sign Up
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Sign Up */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignUp("google")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaGoogle className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>
{/*             
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignUp("github")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              Continue with GitHub
            </Button> */}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Sign Up */}
          <form onSubmit={handleEmailPasswordSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.strength === 100 ? 'text-green-600' :
                      passwordStrength.strength >= 75 ? 'text-blue-600' :
                      passwordStrength.strength >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Password Requirements */}
              {password && (
                <div className="space-y-1">
                  {passwordRequirements.map((requirement, index) => {
                    const isValid = requirement.test(password);
                    return (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        {isValid ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={isValid ? "text-green-600" : "text-red-600"}>
                          {requirement.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked: boolean) => setAcceptTerms(checked)}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>

            <input name="flow" type="hidden" value="signUp" />
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm text-muted-foreground w-full">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 