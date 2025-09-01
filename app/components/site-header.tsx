import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'
import { useLocation, useMatches } from 'react-router'

interface RouteHandle {
  name?: string
}

export function SiteHeader() {
  const location = useLocation()
  const matches = useMatches()

  // Get the page title from route handle or fallback to File Manager
  const getPageTitle = () => {
    // Try to get title from current route's handle
    const currentMatch = matches.find((match) => match.pathname === location.pathname)
    const handle = currentMatch?.handle as RouteHandle | undefined
    if (handle?.name) {
      return handle.name
    }

    // Simple fallback
    return 'File Manager'
  }

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mx-2 data-[orientation=vertical]:h-4' />
        <h1 className='text-base font-medium'>{getPageTitle()}</h1>
      </div>
    </header>
  )
}
