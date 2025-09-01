import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  // Dashboard layout at root with nested pages
  route('', 'routes/dashboard/layout.tsx', [
    index('routes/dashboard/index.tsx'),
    route('settings', 'routes/dashboard/settings.tsx'),
    route('profile', 'routes/profile/profile.tsx')
  ]),

  // Auth routes
  route('register', 'routes/register/register.tsx'),
  route('login', 'routes/login/login.tsx'),
  route('forgot-password', 'routes/forgot-password/forgot-password.tsx'),
  route('reset-password', 'routes/reset-password/reset-password.tsx'),
  route('check-email', 'routes/check-email/check-email.tsx')
] satisfies RouteConfig
 