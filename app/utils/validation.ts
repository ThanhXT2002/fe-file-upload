import type { RegisterPayload } from '~/type/authType'

export type FieldErrors = Record<string, string>

export function validateRegister(payload: RegisterPayload): FieldErrors | null {
  const errors: FieldErrors = {}

  // Email basic check
  if (!payload.email || payload.email.trim() === '') {
    errors.email = 'Email is required'
  } else {
    // simple email regex
    const re = /^[\w-.+]+@[\w-]+\.[\w-.]+$/
    if (!re.test(payload.email)) errors.email = 'Email is invalid'
  }

  // Password checks
  if (!payload.password) {
    errors.password = 'Password is required'
  } else if (payload.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  // Confirm password
  if (!payload.passwordConfirm) {
    errors.passwordConfirm = 'Please confirm your password'
  } else if (payload.password !== payload.passwordConfirm) {
    errors.passwordConfirm = 'Passwords do not match'
  }

  return Object.keys(errors).length ? errors : null
}

export default { validateRegister }
