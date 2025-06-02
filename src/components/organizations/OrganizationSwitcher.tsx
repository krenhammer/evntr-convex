import { useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  ChevronDown, 
  Crown, 
  Shield, 
  User, 
  Plus,
  Settings
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function OrganizationSwitcher() {
  const { 
    currentOrganization, 
    organizations, 
    setCurrentOrganization,
    isLoading 
  } = useOrganizationContext()

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Building2 className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (!organizations.length) {
    return (
      <Link to="/settings" search={{ tab: 'organizations' }}>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </Link>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />
      default:
        return <User className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Building2 className="h-4 w-4 mr-2" />
          <span className="max-w-32 truncate">
            {currentOrganization?.organization.name || 'Select Organization'}
          </span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.organization._id}
            onClick={() => setCurrentOrganization(org)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {getRoleIcon(org.role)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{org.organization.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {org.role}
                  </Badge>
                  <span>•</span>
                  <span>{org.memberCount} members</span>
                </div>
              </div>
            </div>
            {currentOrganization?.organization._id === org.organization._id && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/settings" search={{ tab: 'organizations' }} className="flex items-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            Create Organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 