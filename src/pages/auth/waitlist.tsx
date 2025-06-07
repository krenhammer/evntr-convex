import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { FaGoogle, FaLinkedin, FaCheckCircle } from 'react-icons/fa'
import { MdEmail, MdPerson, MdBusiness } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'



export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
    useCase: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const joinWaitlist = useMutation(api.waitlist.joinWaitlist)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await joinWaitlist({
        email: formData.email,
        name: formData.firstName && formData.lastName 
          ? `${formData.firstName} ${formData.lastName}` 
          : formData.firstName || formData.lastName || undefined,
        company: formData.company || undefined,
        reason: formData.useCase || undefined,
      })
      
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = async (provider: 'google' | 'linkedin') => {
    setIsLoading(true)
    setError('')

    try {
      // Here you would handle social signup for waitlist
      // This could redirect to your auth provider with a special waitlist flag
      console.log(`Social waitlist signup with ${provider}`)
      
      // For now, we'll simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err: any) {
      setError(`Failed to sign up with ${provider}. Please try again.`)
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <FaCheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">You're on the list!</CardTitle>
            <CardDescription>
              Thank you for joining our waitlist. We'll notify you as soon as we're ready to launch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              In the meantime, follow us on social media for updates and behind-the-scenes content.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Join the Waitlist</CardTitle>
          <CardDescription className="text-center">
            Be the first to know when we launch. Get early access and exclusive updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Social Signup Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              Join with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignup('linkedin')}
              disabled={isLoading}
            >
              <FaLinkedin className="mr-2 h-4 w-4" />
              Join with LinkedIn
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or fill out the form
              </span>
            </div>
          </div>

          {/* Waitlist Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <div className="relative">
                <MdBusiness className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  type="text"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) => handleInputChange('role', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="founder">Founder/CEO</SelectItem>
                  <SelectItem value="marketing">Marketing Manager</SelectItem>
                  <SelectItem value="product">Product Manager</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase">What are you hoping to use this for? (Optional)</Label>
              <Textarea
                id="useCase"
                placeholder="Tell us about your use case..."
                value={formData.useCase}
                onChange={(e) => handleInputChange('useCase', e.target.value)}
                className="min-h-[80px]"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <a href="/auth/sign-in" className="text-primary hover:underline">
              Sign in
            </a>
          </div>
          <div className="text-xs text-center text-muted-foreground">
            By joining, you agree to receive updates about our product launch.
            You can unsubscribe at any time.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}