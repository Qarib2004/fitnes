import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { eq } from 'drizzle-orm'
import { DB } from '../database/database.module'
import { UserRole, users } from '../database/schema'
import { ROLES_KEY } from './roles.decorator'
import { RequestWithUser } from './auth.types'
import { createSupabaseServerClient } from './supabase-client'
import type { Db } from '../database'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly supabase: ReturnType<typeof createSupabaseServerClient>

  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly config: ConfigService,
    private readonly reflector: Reflector
  ) {
    const url = this.config.getOrThrow<string>('SUPABASE_URL')
    const key = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY')

    this.supabase = createSupabaseServerClient(url, key)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const token = this.extractBearerToken(request)

    if (!token) {
      throw new UnauthorizedException('Bearer token is required')
    }

    const { data, error } = await this.supabase.auth.getUser(token)

    if (error || !data.user?.email) {
      throw new UnauthorizedException('Invalid Supabase token')
    }

    const [profile] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, data.user.id))
      .limit(1)

    if (!profile) {
      throw new UnauthorizedException('User profile is not registered')
    }

    if (profile.status === 'blocked') {
      throw new ForbiddenException('User is blocked')
    }

    request.user = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      status: profile.status
    }

    const allowedRoles =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? []

    if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
      throw new ForbiddenException('Insufficient role')
    }

    return true
  }

  private extractBearerToken(request: RequestWithUser): string | null {
    const header = request.headers.authorization

    if (!header) {
      return null
    }

    const [scheme, token] = header.split(' ')
    return scheme?.toLowerCase() === 'bearer' && token ? token : null
  }
}
