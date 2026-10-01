import { ROUTES } from '../routes/paths'

export function userLoginPath(from?: string) {
  return from
    ? { pathname: ROUTES.user.login, state: { from } }
    : ROUTES.user.login
}
