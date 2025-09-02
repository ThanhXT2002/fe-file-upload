import React, { useState } from 'react'

// Export handle for custom route data
export const handle = {
  name: 'Account'
}

import { useAuth } from '~/context/auth'
import { UserRoleBadge } from '~/components/permission-guard'
import { updateProfile } from '~/api/authService'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconKey,
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconShield,
  IconCopy
} from '@tabler/icons-react'
import { toast } from 'sonner'

function ProfilePage() {
  const { userProfile, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(userProfile?.name || '')

  // Handle copy API key to clipboard
  const copyApiKey = async () => {
    if (userProfile?.key) {
      try {
        await navigator.clipboard.writeText(userProfile.key)
        toast.success('API key copied!')
      } catch {
        toast.error('Unable to copy API key')
      }
    }
  }

  // Handle save profile changes
  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name: editedName })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      await refreshProfile()
    } catch {
      toast.error('Failed to update profile!')
    }
  }

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditedName(userProfile?.name || '')
    setIsEditing(false)
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No information'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    }
    if (userProfile?.email) {
      return userProfile.email[0].toUpperCase()
    }
    return 'U'
  }

  if (!userProfile) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='text-lg font-medium'>Loading profile...</div>
          <div className='text-sm text-muted-foreground'>Please wait a moment</div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-6 space-y-6 max-w-6xl px-3'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Profile Information Card */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <IconUser className='h-5 w-5' />
                  Basic information
                </CardTitle>
                <CardDescription>Personal info and account settings</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                  <IconEdit className='h-4 w-4 mr-2' />
                  Edit
                </Button>
              ) : (
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' onClick={handleCancelEdit}>
                    <IconX className='h-4 w-4 mr-2' />
                    Cancel
                  </Button>
                  <Button size='sm' onClick={handleSaveProfile}>
                    <IconDeviceFloppy className='h-4 w-4 mr-2' />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Avatar Section */}
            <div className='flex items-center space-x-4'>
              <Avatar className='h-20 w-20'>
                <AvatarImage src={userProfile.avatarUrl || ''} alt={userProfile.name || ''} />
                <AvatarFallback className='text-lg font-semibold'>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Avatar</p>
                <p className='text-xs text-muted-foreground'>
                  {userProfile.avatarUrl ? 'Avatar available' : 'No avatar'}
                </p>
                <Button variant='outline' size='sm' disabled>
                  Change photo
                </Button>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Full name</Label>
                {isEditing ? (
                  <Input
                    id='name'
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder='Enter full name'
                  />
                ) : (
                  <div className='flex items-center space-x-2'>
                    <Input value={userProfile.name || 'No information'} disabled className='bg-muted' />
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <div className='flex items-center space-x-2'>
                  <IconMail className='h-4 w-4 text-muted-foreground' />
                  <Input id='email' value={userProfile.email} disabled className='bg-muted' />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Role</Label>
                <div className='flex items-center space-x-2'>
                  <IconShield className='h-4 w-4 text-muted-foreground' />
                  <Input value={userProfile.role} disabled className='bg-muted' />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Account created</Label>
                <div className='flex items-center space-x-2'>
                  <IconCalendar className='h-4 w-4 text-muted-foreground' />
                  <Input value={formatDate(userProfile.createdAt)} disabled className='bg-muted' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Sidebar */}
        <div className='space-y-6'>
          {/* Account Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Account status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Status</span>
                <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
                  Active
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Role</span>
                <UserRoleBadge />
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>ID</span>
                <code className='text-xs bg-muted px-2 py-1 rounded'>{userProfile.id.substring(0, 8)}...</code>
              </div>
            </CardContent>
          </Card>

          {/* API Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <IconKey className='h-5 w-5' />
                API Key
              </CardTitle>
              <CardDescription>Key for accessing the API</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>API Key</Label>
                <div className='flex items-center space-x-2'>
                  <Input
                    value={`${userProfile.key.substring(0, 12)}${'*'.repeat(20)}`}
                    disabled
                    className='bg-muted font-mono text-xs'
                  />
                  <Button variant='outline' size='sm' onClick={copyApiKey}>
                    <IconCopy className='h-4 w-4' />
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>Click to copy the full API key</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
