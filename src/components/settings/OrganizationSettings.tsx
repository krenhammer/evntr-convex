import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useSession } from '@/auth/use-auth-hooks.convex'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Save,
  Users,
  Crown,
  Shield,
  User,
  UserMinus,
  Plus,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'
import { Id } from '../../../convex/_generated/dataModel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function OrganizationSettings() {
  const { data: session } = useSession()
  const { currentOrganization, organizations } = useOrganizationContext()
  
  const members = useQuery(
    api.organizations.getOrganizationMembers, 
    currentOrganization ? { organizationId: currentOrganization.organization._id } : "skip"
  )
  
  const updateOrganization = useMutation(api.organizations.updateOrganization)
  const createOrganization = useMutation(api.organizations.createOrganization)
  const removeMember = useMutation(api.organizations.removeOrganizationMember)
  const updateMemberRole = useMutation(api.organizations.updateOrganizationMemberRole)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    planType: 'free' as 'free' | 'pro' | 'enterprise'
  })
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    description: '',
    planType: 'free' as 'free' | 'pro' | 'enterprise'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Initialize form data when organization loads
  useEffect(() => {
    if (currentOrganization) {
      setFormData({
        name: currentOrganization.organization.name,
        description: currentOrganization.organization.description || '',
        planType: currentOrganization.organization.planType
      })
    }
  }, [currentOrganization])

  if (!session?.user) {
    return <div>Please sign in to manage organizations</div>
  }

  const userMembership = members?.find(m => m.user._id === session.user.id)
  const canManage = userMembership?.role === 'owner' || userMembership?.role === 'admin'
  const isOwner = userMembership?.role === 'owner'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentOrganization || !formData.name.trim()) {
      toast.error('Organization name is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      await updateOrganization({
        organizationId: currentOrganization.organization._id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        planType: formData.planType
      })
      
      toast.success('Organization updated successfully!')
    } catch (error) {
      console.error('Failed to update organization:', error)
      toast.error('Failed to update organization. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newOrgData.name.trim()) {
      toast.error('Organization name is required')
      return
    }

    setIsCreating(true)
    
    try {
      await createOrganization({
        name: newOrgData.name.trim(),
        description: newOrgData.description.trim() || undefined,
        planType: newOrgData.planType
      })
      
      toast.success('Organization created successfully!')
      setShowCreateDialog(false)
      setNewOrgData({ name: '', description: '', planType: 'free' })
    } catch (error) {
      console.error('Failed to create organization:', error)
      toast.error('Failed to create organization. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRemoveMember = async (userId: Id<"users">) => {
    if (!currentOrganization) return
    
    try {
      await removeMember({
        organizationId: currentOrganization.organization._id,
        userId
      })
      toast.success('Member removed successfully')
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member. Please try again.')
    }
  }

  const handleUpdateRole = async (userId: Id<"users">, newRole: 'owner' | 'admin' | 'member') => {
    if (!currentOrganization) return
    
    try {
      await updateMemberRole({
        organizationId: currentOrganization.organization._id,
        userId,
        role: newRole
      })
      toast.success('Member role updated successfully')
    } catch (error) {
      console.error('Failed to update member role:', error)
      toast.error('Failed to update member role. Please try again.')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organizations
              </CardTitle>
              <CardDescription>
                Manage your organizations and switch between them
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Organization</DialogTitle>
                  <DialogDescription>
                    Set up a new organization to collaborate with your team
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Organization Name *</Label>
                    <Input
                      id="new-name"
                      placeholder="Enter organization name"
                      value={newOrgData.name}
                      onChange={(e) => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-description">Description</Label>
                    <Textarea
                      id="new-description"
                      placeholder="Describe your organization (optional)"
                      value={newOrgData.description}
                      onChange={(e) => setNewOrgData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-planType">Plan Type</Label>
                    <Select
                      value={newOrgData.planType}
                      onValueChange={(value) => setNewOrgData(prev => ({ ...prev, planType: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Organization'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {organizations.map((org) => (
              <div key={org.organization._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(org.role)}
                    <Badge variant={getRoleBadgeVariant(org.role)}>
                      {org.role}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-medium">{org.organization.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {org.memberCount} members • {org.organization.planType}
                    </div>
                  </div>
                </div>
                {currentOrganization?.organization._id === org.organization._id && (
                  <Badge variant="outline">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Organization Settings */}
      {currentOrganization && canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Current Organization Settings</CardTitle>
            <CardDescription>
              Update settings for {currentOrganization.organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter organization name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your organization (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Select
                  value={formData.planType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, planType: value as any }))}
                  disabled={!isOwner}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                {!isOwner && (
                  <p className="text-sm text-muted-foreground">
                    Only organization owners can change the plan type
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Organization Members */}
      {currentOrganization && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>
              Manage member roles and permissions for {currentOrganization.organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!members || members.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No members yet</h3>
                <p className="text-muted-foreground">
                  Invite team members to start collaborating
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {members.map((member) => (
                  <div key={member.user._id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {member.user.name?.[0]?.toUpperCase() || member.user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{member.user.name || member.user.email}</div>
                        {member.user.email && member.user.name && (
                          <div className="text-sm text-muted-foreground">{member.user.email}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      
                      {isOwner && member.user._id !== session.user.id ? (
                        <Select
                          value={member.role}
                          onValueChange={(newRole) => handleUpdateRole(member.user._id, newRole as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      )}

                      {isOwner && member.user._id !== session.user.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.user.name || member.user.email} from this organization? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.user._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove Member
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 