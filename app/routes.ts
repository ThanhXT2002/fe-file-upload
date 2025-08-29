import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('register', 'routes/register/register.tsx'),
  route('login', 'routes/login/login.tsx'),
  route('forgot-password', 'routes/forgot-password/forgot-password.tsx'),
  route('reset-password', 'routes/reset-password/reset-password.tsx'),
  route('check-email', 'routes/check-email/check-email.tsx')
] satisfies RouteConfig
