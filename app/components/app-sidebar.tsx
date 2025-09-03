import * as React from 'react'
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconSettings,
  IconUsers,
  IconLifebuoy,
  IconUserCircle
} from '@tabler/icons-react'

// import { NavDocuments } from "~/components/nav-documents"
import { NavMain } from '~/components/nav-main'
import { NavSecondary } from '~/components/nav-secondary'
import { NavUser } from '~/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '~/components/ui/sidebar'
import { usePermissions } from '~/hooks/use-permissions'

// Base navigation items for all users
const baseNavItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: IconDashboard
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: IconUserCircle
  }
]

// Admin-only navigation items
const adminNavItems = [
  {
    title: 'User Management',
    url: '/user-management',
    icon: IconUsers
  },
  {
    title: 'System Settings',
    url: '/settings',
    icon: IconSettings
  }
]

// Editor navigation items
const editorNavItems = [
  {
    title: 'Content Management',
    url: '#',
    icon: IconFileDescription
  },
  {
    title: 'Media Library',
    url: '#',
    icon: IconCamera
  }
]

// User navigation items
const userNavItems = [
  {
    title: 'My Files',
    url: '/my-files',
    icon: IconFolder
  },
  {
    title: 'Analytics',
    url: '#',
    icon: IconChartBar
  }
]

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar:
      'https://www.google.com/url?sa=i&url=https%3A%2F%2Fui.shadcn.com%2Fdocs%2Fcomponents%2Favatar&psig=AOvVaw0yOmhy-tp2xb9Z9lhm9p3u&ust=1756802836894000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCNjr-dyWt48DFQAAAAAdAAAAABAE'
  },
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: IconLifebuoy
    },
    {
      title: 'Feedback',
      url: '#',
      icon: IconHelp
    }
  ],
  documents: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: IconFileDescription
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: IconFileAi
    },
    {
      name: 'Travel',
      url: '#',
      icon: IconCamera
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isAdmin, isEditor, isUser, userProfile } = usePermissions()

  // Build navigation items based on user role
  const getNavigationItems = () => {
    let navItems = [...baseNavItems]

    if (isAdmin()) {
      navItems = [...navItems, ...adminNavItems, ...editorNavItems, ...userNavItems]
    } else if (isEditor()) {
      navItems = [...navItems, ...editorNavItems, ...userNavItems]
    } else if (isUser()) {
      navItems = [...navItems, ...userNavItems]
    }

    return navItems
  }

  // Update user data with actual profile info
  const userData = {
    ...data.user,
    name: userProfile?.name || data.user.name,
    email: userProfile?.email || data.user.email,
    avatar: userProfile?.avatarUrl || data.user.avatar
  }

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:!p-1.5'>
              <a href='#'>
                <IconInnerShadowTop className='!size-5' />
                <span className='text-base font-semibold'>File Manager</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavigationItems()} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
