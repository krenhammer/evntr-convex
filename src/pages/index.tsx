import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Check } from "lucide-react"
import { useAuth } from "@/auth/use-auth-hooks.convex"
import { Button } from "@/components/ui/button"

type PlanType = "basic" | "pro" | "enterprise"

interface PricingPlan {
  name: string
  id: PlanType
  price: string
  description: string
  features: string[]
  popular?: boolean
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic",
    id: "basic",
    price: "$9",
    description: "Essential features for individuals and small teams",
    features: [
      "Up to 5 events",
      "Basic event management",
      "Email notifications",
      "Community support",
    ],
  },
  {
    name: "Pro",
    id: "pro",
    price: "$29",
    description: "Advanced features for growing teams",
    features: [
      "Up to 50 events",
      "Advanced event management",
      "Custom notifications",
      "Priority support",
      "Team collaboration",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "$99",
    description: "Complete solution for larger organizations",
    features: [
      "Unlimited events",
      "White-label solution",
      "Custom integrations",
      "24/7 dedicated support",
      "Advanced security",
      "Custom analytics",
    ],
  },
]

export const Loader = () => console.log('Route loader')
export const Action = () => console.log('Route action')

export const Pending = () => <div>Loading...</div>
export const Catch = () => <div>Route error</div>

export default function Home() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const [loading, setLoading] = useState<PlanType | null>(null)

  const handleSubscription = async (plan: PlanType) => {
    try {
      setLoading(plan)
      
      if (isSignedIn) {
        // If user is signed in, go to events page
        navigate({ to: '/app/events' })
      } else {
        // If not signed in, redirect to sign up with plan info
        navigate({ 
          to: '/auth/sign-up',
          search: { plan }
        })
      }
    } catch (error) {
      console.error("Failed to start subscription:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate({ to: '/app/events' })
    } else {
      navigate({ to: '/auth/sign-up' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">Evntr</div>
        <div className="space-x-4">
          {isSignedIn ? (
            <Button onClick={() => navigate({ to: '/app/events' })}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate({ to: '/auth/sign-in' })}>
                Sign In
              </Button>
              <Button onClick={handleGetStarted}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">
          Simplify Your Event Management
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Create, manage, and enhance your events with our powerful platform. 
          From small gatherings to large conferences, we've got you covered.
        </p>
        <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
          Start Free Trial
        </Button>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border p-8 shadow-sm flex flex-col bg-white ${
                plan.popular
                  ? "border-primary ring-2 ring-primary"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Popular
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      <span className="ml-3 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleSubscription(plan.id)}
                className="mt-8 w-full"
                disabled={loading !== null}
                variant={plan.popular ? "default" : "outline"}
              >
                {loading === plan.id ? "Processing..." : "Get Started"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Evntr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
