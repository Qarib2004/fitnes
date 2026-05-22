import { Request } from 'express'
import { UserRole, UserStatus } from '../database/schema'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
}

export type RequestWithUser = Request & {
  user: AuthUser
}
