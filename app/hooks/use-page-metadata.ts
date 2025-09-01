import { useLocation } from 'react-router'

export interface PageMetadata {
  title: string
  description?: string
  icon?: string
  breadcrumbs?: Array<{ title: string; href?: string }>
}

// Mapping routes to page metadata
const routeMetadata: Record<string, PageMetadata> = {
  '/': {
    title: 'Dashboard',
    description: 'System overview and statistics',
    icon: '📊',
    breadcrumbs: [{ title: 'Dashboard' }]
  },
  '/profile': {
    title: 'Profile',
    description: 'Manage account and personal settings',
    icon: '👤',
    breadcrumbs: [{ title: 'Dashboard', href: '/' }, { title: 'Profile' }]
  },
  '/settings': {
    title: 'Settings',
    description: 'System configuration and options',
    icon: '⚙️',
    breadcrumbs: [{ title: 'Dashboard', href: '/' }, { title: 'Settings' }]
  },
  '/login': {
    title: 'Login',
    description: 'Access your account',
    icon: '🔐'
  },
  '/register': {
    title: 'Register',
    description: 'Create a new account',
    icon: '📝'
  },
  '/forgot-password': {
    title: 'Forgot password',
    description: 'Recover your account password',
    icon: '🔑'
  },
  '/reset-password': {
    title: 'Reset password',
    description: 'Create a new password for your account',
    icon: '🔒'
  },
  '/check-email': {
    title: 'Check email',
    description: 'Verify your email address',
    icon: '📧'
  }
}

export function usePageMetadata(): PageMetadata {
  const location = useLocation()

  const getPageMetadata = (): PageMetadata => {
    const currentPath = location.pathname

    // Check for exact match first
    if (routeMetadata[currentPath]) {
      return routeMetadata[currentPath]
    }

    // Check for partial matches (for dynamic routes)
    const dynamicRoutes = Object.keys(routeMetadata).filter((route) => route.includes(':'))
    for (const route of dynamicRoutes) {
      const pattern = route.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      if (regex.test(currentPath)) {
        return routeMetadata[route]
      }
    }

    // Default fallback
    return {
      title: 'File Manager',
      description: 'Manage files and images',
      icon: '📁',
      breadcrumbs: [{ title: 'File Manager' }]
    }
  }

  return getPageMetadata()
}

// Hook to get page title only (simpler version)
export function usePageTitle(): string {
  const metadata = usePageMetadata()
  return metadata.title
}

// Hook to set page title dynamically (for specific pages)
export function useSetPageTitle(customTitle?: string, customDescription?: string) {
  if (customTitle || customDescription) {
    // You can extend this to set document title or meta tags
    if (typeof document !== 'undefined' && customTitle) {
      document.title = `${customTitle} - File Manager`
    }
  }
}
