import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { sql } from 'drizzle-orm'
import { DB } from '../database/database.module'
import type { Db } from '../database'

const AUTO_MISS_GRACE_HOURS = 2

@Injectable()
export class BookingsMaintenanceService {
  private readonly logger = new Logger(BookingsMaintenanceService.name)

  constructor(@Inject(DB) private readonly db: Db) {}

  @Cron(CronExpression.EVERY_HOUR)
  async markExpiredActiveBookingsAsMissed() {
    const result = await this.db.execute(sql`
      update bookings
      set status = 'missed',
          updated_at = now()
      from schedule
      where bookings.schedule_id = schedule.id
        and bookings.status = 'active'
        and schedule.ends_at < now() - (${AUTO_MISS_GRACE_HOURS} * interval '1 hour')
      returning bookings.id
    `)

    this.logger.log(`Marked ${result.length} expired bookings as missed`)
  }
}
