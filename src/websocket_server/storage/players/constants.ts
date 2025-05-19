export const NAME_RESERVED = 'This username is reserved for internal use';
export const NAME_USED = 'Username is already in use';
export const USER_LOGGED = 'User with such username has already logged in';
export const NAME_INVALID = 'Username should contain only letters, numbers or _ symbol';

export type PlayerData = {
  name: string
  password?: string
  index?: number | string
  error?: boolean
  errorText?: string
}