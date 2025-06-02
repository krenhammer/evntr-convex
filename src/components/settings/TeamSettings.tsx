import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useSession } from '@/auth/use-auth-hooks.convex'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Crown,
  Shield,
  User,
  UserMinus,
  Plus,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { Id } from '../../../convex/_generated/dataModel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

export function TeamSettings() {
  const { data: session } = useSession()
  const { currentOrganization, canCreateTeams } = useOrganizationContext()
  
  const teams = useQuery(
    api.teams.getOrganizationTeams,
    currentOrganization ? { organizationId: currentOrganization.organization._id } : "skip"
  )
  
  const createTeam = useMutation(api.teams.createTeam)
  
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  if (!session?.user) {
    return <div>Please sign in to manage teams</div>
  }

  if (!currentOrganization) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
          <p className="text-muted-foreground">
            Please select an organization to manage teams
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTeamData.name.trim()) {
      toast.error('Team name is required')
      return
    }

    setIsCreating(true)
    
    try {
      await createTeam({
        name: newTeamData.name.trim(),
        description: newTeamData.description.trim() || undefined,
        organizationId: currentOrganization.organization._id
      })
      
      toast.success('Team created successfully!')
      setShowCreateDialog(false)
      setNewTeamData({ name: '', description: '' })
    } catch (error) {
      console.error('Failed to create team:', error)
      toast.error('Failed to create team. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Teams Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teams
              </CardTitle>
              <CardDescription>
                Manage teams in {currentOrganization.organization.name}
              </CardDescription>
            </div>
            {canCreateTeams && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Create a team to organize members and collaborate on projects
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name *</Label>
                      <Input
                        id="team-name"
                        placeholder="Enter team name"
                        value={newTeamData.name}
                        onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-description">Description</Label>
                      <Textarea
                        id="team-description"
                        placeholder="Describe your team's purpose (optional)"
                        value={newTeamData.description}
                        onChange={(e) => setNewTeamData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create Team'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!teams || teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create teams to organize your members and projects
              </p>
              {canCreateTeams && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Team
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {teams.map((team) => (
                <TeamCard key={team._id} team={team} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface TeamCardProps {
  team: {
    _id: Id<"teams">
    name: string
    description?: string
    memberCount: number
    created_at?: string
  }
}

function TeamCard({ team }: TeamCardProps) {
  const { data: session } = useSession()
  const { currentOrganization } = useOrganizationContext()
  
  const members = useQuery(api.teams.getTeamMembers, { teamId: team._id })
  
  const userMembership = members?.find(m => m.user._id === session?.user?.id)
  const canManage = userMembership?.role === 'lead' || userMembership?.isOrgAdmin

  const getRoleIcon = (role: string, isOrgAdmin?: boolean) => {
    if (isOrgAdmin) {
      return <Crown className="h-3 w-3 text-yellow-500" />
    }
    switch (role) {
      case 'lead':
        return <Shield className="h-3 w-3 text-blue-500" />
      default:
        return <User className="h-3 w-3 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: string, isOrgAdmin?: boolean) => {
    if (isOrgAdmin) return 'default'
    switch (role) {
      case 'lead':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string, isOrgAdmin?: boolean) => {
    if (isOrgAdmin) return 'Org Admin'
    return role
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            {team.description && (
              <CardDescription>{team.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{team.memberCount} members</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {members && members.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Team Members</div>
            <div className="space-y-2">
              {members.slice(0, 3).map((member) => (
                <div key={member.user._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      {member.user.name?.[0]?.toUpperCase() || member.user.email?.[0]?.toUpperCase()}
                    </div>
                    <span>{member.user.name || member.user.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getRoleIcon(member.role, member.isOrgAdmin)}
                    <Badge variant={getRoleBadgeVariant(member.role, member.isOrgAdmin)} className="text-xs">
                      {getRoleLabel(member.role, member.isOrgAdmin)}
                    </Badge>
                  </div>
                </div>
              ))}
              {members.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{members.length - 3} more members
                </div>
              )}
            </div>
          </div>
        )}
        
        {team.created_at && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 pt-3 border-t">
            <Calendar className="h-3 w-3" />
            Created {new Date(team.created_at).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 