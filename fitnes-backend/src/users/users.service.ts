import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { asc, eq } from 'drizzle-orm'
import { DB } from '../database/database.module'
import { users } from '../database/schema'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserRoleDto } from './dto/update-user-role.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import type { Db } from '../database'

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: Db) {}

  listTrainers() {
    return this.db
      .select()
      .from(users)
      .where(eq(users.role, 'trainer'))
      .orderBy(asc(users.name))
  }

  list() {
    return this.db.select().from(users).orderBy(asc(users.createdAt))
  }

  async create(dto: CreateUserDto) {
    const [user] = await this.db
      .insert(users)
      .values(dto)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: dto.email,
          name: dto.name,
          role: dto.role,
          updatedAt: new Date()
        }
      })
      .returning()

    return user
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    const [user] = await this.db
      .update(users)
      .set({
        role: dto.role,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning()

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const [user] = await this.db
      .update(users)
      .set({
        status: dto.status,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning()

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }
}
