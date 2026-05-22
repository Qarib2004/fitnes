import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { and, asc, eq, gt, gte, lt, ne, sql } from 'drizzle-orm'
import { DB } from '../database/database.module'
import { bookings, classes, rooms, schedule, users } from '../database/schema'
import { CreateClassDto } from './dto/create-class.dto'
import { CreateRoomDto } from './dto/create-room.dto'
import { CreateScheduleSlotDto } from './dto/create-schedule-slot.dto'
import { ScheduleQueryDto } from './dto/schedule-query.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { UpdateRoomDto } from './dto/update-room.dto'
import { UpdateScheduleSlotDto } from './dto/update-schedule-slot.dto'
import type { Db } from '../database'

@Injectable()
export class ScheduleService {
  constructor(@Inject(DB) private readonly db: Db) {}

  listClasses() {
    return this.db.select().from(classes).orderBy(asc(classes.title))
  }

  async createClass(dto: CreateClassDto) {
    const [created] = await this.db.insert(classes).values(dto).returning()
    return created
  }

  async updateClass(id: string, dto: UpdateClassDto) {
    const [updated] = await this.db
      .update(classes)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning()

    if (!updated) {
      throw new NotFoundException('Class not found')
    }

    return updated
  }

  async deleteClass(id: string) {
    const [deleted] = await this.db
      .delete(classes)
      .where(eq(classes.id, id))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Class not found')
    }

    return deleted
  }

  listRooms() {
    return this.db.select().from(rooms).orderBy(asc(rooms.title))
  }

  async createRoom(dto: CreateRoomDto) {
    const [created] = await this.db.insert(rooms).values(dto).returning()
    return created
  }

  async updateRoom(id: string, dto: UpdateRoomDto) {
    const [updated] = await this.db
      .update(rooms)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning()

    if (!updated) {
      throw new NotFoundException('Room not found')
    }

    return updated
  }

  async deleteRoom(id: string) {
    const [deleted] = await this.db
      .delete(rooms)
      .where(eq(rooms.id, id))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Room not found')
    }

    return deleted
  }

  async list(query: ScheduleQueryDto) {
    const weekStart = new Date(query.weekStart)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const filters = [
      gte(schedule.startsAt, weekStart),
      lt(schedule.startsAt, weekEnd)
    ]

    if (query.trainerId) {
      filters.push(eq(schedule.trainerId, query.trainerId))
    }

    if (query.classId) {
      filters.push(eq(schedule.classId, query.classId))
    }

    return this.db
      .select({
        id: schedule.id,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
        classId: classes.id,
        classTitle: classes.title,
        classDescription: classes.description,
        trainerId: users.id,
        trainerName: users.name,
        roomId: rooms.id,
        roomTitle: rooms.title,
        capacity: classes.capacity,
        booked:
          sql<number>`count(${bookings.id}) filter (where ${bookings.status} = 'active')`.mapWith(
            Number
          ),
        spotsLeft:
          sql<number>`${classes.capacity} - count(${bookings.id}) filter (where ${bookings.status} = 'active')`.mapWith(
            Number
          )
      })
      .from(schedule)
      .innerJoin(classes, eq(schedule.classId, classes.id))
      .innerJoin(users, eq(schedule.trainerId, users.id))
      .leftJoin(rooms, eq(schedule.roomId, rooms.id))
      .leftJoin(bookings, eq(bookings.scheduleId, schedule.id))
      .where(and(...filters))
      .groupBy(
        schedule.id,
        classes.id,
        classes.title,
        classes.description,
        classes.capacity,
        users.id,
        users.name,
        rooms.id,
        rooms.title
      )
      .orderBy(asc(schedule.startsAt))
  }

  async createSlot(dto: CreateScheduleSlotDto) {
    const startsAt = new Date(dto.startsAt)
    const endsAt = new Date(dto.endsAt)
    const roomId = dto.roomId ?? null

    this.assertValidTimeRange(startsAt, endsAt)
    await this.assertNoScheduleOverlap(dto.trainerId, roomId, startsAt, endsAt)

    const [created] = await this.db
      .insert(schedule)
      .values({
        classId: dto.classId,
        trainerId: dto.trainerId,
        roomId,
        startsAt,
        endsAt
      })
      .returning()

    return created
  }

  async updateSlot(id: string, dto: UpdateScheduleSlotDto) {
    const [current] = await this.db
      .select()
      .from(schedule)
      .where(eq(schedule.id, id))
      .limit(1)

    if (!current) {
      throw new NotFoundException('Schedule slot not found')
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : current.startsAt
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : current.endsAt
    const trainerId = dto.trainerId ?? current.trainerId
    const roomId = dto.roomId ?? current.roomId ?? null

    this.assertValidTimeRange(startsAt, endsAt)
    await this.assertNoScheduleOverlap(trainerId, roomId, startsAt, endsAt, id)

    const [updated] = await this.db
      .update(schedule)
      .set({
        classId: dto.classId,
        trainerId: dto.trainerId,
        roomId,
        startsAt,
        endsAt,
        updatedAt: new Date()
      })
      .where(eq(schedule.id, id))
      .returning()

    return updated
  }

  async deleteSlot(id: string) {
    const [deleted] = await this.db
      .delete(schedule)
      .where(eq(schedule.id, id))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Schedule slot not found')
    }

    return deleted
  }

  private assertValidTimeRange(startsAt: Date, endsAt: Date) {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid schedule date')
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt')
    }
  }

  private async assertNoScheduleOverlap(
    trainerId: string,
    roomId: string | null,
    startsAt: Date,
    endsAt: Date,
    excludeScheduleId?: string
  ) {
    const trainerFilters = [
      eq(schedule.trainerId, trainerId),
      lt(schedule.startsAt, endsAt),
      gt(schedule.endsAt, startsAt)
    ]

    if (excludeScheduleId) {
      trainerFilters.push(ne(schedule.id, excludeScheduleId))
    }

    const [trainerConflict] = await this.db
      .select({ id: schedule.id })
      .from(schedule)
      .where(and(...trainerFilters))
      .limit(1)

    if (trainerConflict) {
      throw new BadRequestException('Trainer already has a class at this time')
    }

    if (!roomId) {
      return
    }

    const roomFilters = [
      eq(schedule.roomId, roomId),
      lt(schedule.startsAt, endsAt),
      gt(schedule.endsAt, startsAt)
    ]

    if (excludeScheduleId) {
      roomFilters.push(ne(schedule.id, excludeScheduleId))
    }

    const [roomConflict] = await this.db
      .select({ id: schedule.id })
      .from(schedule)
      .where(and(...roomFilters))
      .limit(1)

    if (roomConflict) {
      throw new BadRequestException('Room already has a class at this time')
    }
  }
}
