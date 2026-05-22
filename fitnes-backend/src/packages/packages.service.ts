import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { asc, eq } from 'drizzle-orm'
import { DB } from '../database/database.module'
import { clientPackages, packages } from '../database/schema'
import { AssignPackageDto } from './dto/assign-package.dto'
import { CreatePackageDto } from './dto/create-package.dto'
import { UpdatePackageDto } from './dto/update-package.dto'
import type { Db } from '../database'

@Injectable()
export class PackagesService {
  constructor(@Inject(DB) private readonly db: Db) {}

  list() {
    return this.db.select().from(packages).orderBy(asc(packages.title))
  }

  async create(dto: CreatePackageDto) {
    const [created] = await this.db
      .insert(packages)
      .values({
        ...dto,
        price: dto.price.toFixed(2)
      })
      .returning()

    return created
  }

  async assign(dto: AssignPackageDto) {
    const [pkg] = await this.db
      .select()
      .from(packages)
      .where(eq(packages.id, dto.packageId))
      .limit(1)

    if (!pkg) {
      throw new NotFoundException('Package not found')
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + pkg.validityDays)

    const [assigned] = await this.db
      .insert(clientPackages)
      .values({
        userId: dto.userId,
        packageId: dto.packageId,
        lessonsLeft: pkg.lessonsCount,
        expiresAt: expiresAt.toISOString().slice(0, 10)
      })
      .returning()

    return assigned
  }

  async update(id: string, dto: UpdatePackageDto) {
    const [updated] = await this.db
      .update(packages)
      .set({
        ...dto,
        price: dto.price === undefined ? undefined : dto.price.toFixed(2),
        updatedAt: new Date()
      })
      .where(eq(packages.id, id))
      .returning()

    if (!updated) {
      throw new NotFoundException('Package not found')
    }

    return updated
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .delete(packages)
      .where(eq(packages.id, id))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Package not found')
    }

    return deleted
  }
}
