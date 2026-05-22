import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import { DB } from '../database/database.module'
import { users } from '../database/schema'
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { RegisterDto } from './dto/register.dto'
import { createSupabaseServerClient } from './supabase-client'
import type { AuthUser } from './auth.types'
import type { Db } from '../database'

@Injectable()
export class AuthService {
  private readonly supabase: ReturnType<typeof createSupabaseServerClient>
  private readonly supabaseAdmin: ReturnType<typeof createSupabaseServerClient>

  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly config: ConfigService
  ) {
    this.supabase = createSupabaseServerClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_ANON_KEY')
    )
    this.supabaseAdmin = createSupabaseServerClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY')
    )
  }

  async register(dto: RegisterDto) {
    const authUser = await this.createOrFindAuthUser(
      dto.email,
      dto.password,
      dto.name
    )

    const [profile] = await this.db
      .insert(users)
      .values({
        id: authUser.id,
        email: dto.email,
        name: dto.name,
        role: 'client',
        status: 'active'
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: dto.email,
          name: dto.name,
          status: 'active',
          updatedAt: new Date()
        }
      })
      .returning()

    return { user: profile }
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password
    })

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(error?.message ?? 'Invalid credentials')
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

    return {
      user: profile,
      session: data.session
    }
  }

  me(user: AuthUser) {
    return { user }
  }

  async refresh(dto: RefreshTokenDto) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: dto.refreshToken
    })

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message ?? 'Invalid refresh token')
    }

    return { session: data.session }
  }

  async bootstrapAdmin(dto: BootstrapAdminDto) {
    const expectedSecret = this.config.get<string>('BOOTSTRAP_ADMIN_SECRET')

    if (!expectedSecret || dto.secret !== expectedSecret) {
      throw new ForbiddenException('Invalid bootstrap secret')
    }

    const authUser = await this.createOrFindAuthUser(
      dto.email,
      dto.password,
      dto.name
    )

    const [profile] = await this.db
      .insert(users)
      .values({
        id: authUser.id,
        email: dto.email,
        name: dto.name,
        role: 'admin',
        status: 'active'
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: dto.email,
          name: dto.name,
          role: 'admin',
          status: 'active',
          updatedAt: new Date()
        }
      })
      .returning()

    return { user: profile }
  }

  private async createOrFindAuthUser(
    email: string,
    password: string,
    name: string
  ) {
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (data.user) {
      return data.user
    }

    if (
      error?.message ===
      'A user with this email address has already been registered'
    ) {
      const existingUser = await this.findAuthUserByEmail(email)

      if (existingUser) {
        return existingUser
      }
    }

    throw new BadRequestException(error?.message ?? 'Registration failed')
  }

  private async findAuthUserByEmail(email: string) {
    const { data, error } = await this.supabaseAdmin.auth.admin.listUsers()

    if (error) {
      throw new BadRequestException(error.message)
    }

    return data.users.find(
      user => user.email?.toLowerCase() === email.toLowerCase()
    )
  }
}
