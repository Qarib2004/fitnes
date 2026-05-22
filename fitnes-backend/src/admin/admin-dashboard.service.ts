import { Inject, Injectable } from '@nestjs/common'
import { sql } from 'drizzle-orm'
import { DB } from '../database/database.module'
import type { Db } from '../database'

@Injectable()
export class AdminDashboardService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async getDashboard() {
    const [summary] = await this.db.execute<{
      total_users: number
      total_trainers: number
      total_clients: number
      total_revenue: string | null
      total_bookings: number
      active_bookings: number
      attended_bookings: number
      missed_bookings: number
      canceled_bookings: number
      avg_occupancy_percent: string | null
    }>(sql`
      select
        (select count(*)::int from users) as total_users,
        (select count(*)::int from users where role = 'trainer') as total_trainers,
        (select count(*)::int from users where role = 'client') as total_clients,
        (
          select coalesce(sum(packages.price), 0)
          from client_packages
          join packages on packages.id = client_packages.package_id
        ) as total_revenue,
        (select count(*)::int from bookings) as total_bookings,
        (select count(*)::int from bookings where status = 'active') as active_bookings,
        (select count(*)::int from bookings where status = 'attended') as attended_bookings,
        (select count(*)::int from bookings where status = 'missed') as missed_bookings,
        (select count(*)::int from bookings where status = 'canceled') as canceled_bookings,
        (
          select coalesce(avg(occupancy.occupancy_percent), 0)
          from (
            select
              case
                when classes.capacity > 0 then
                  (count(bookings.id) filter (where bookings.status in ('active', 'attended'))::decimal / classes.capacity) * 100
                else 0
              end as occupancy_percent
            from schedule
            join classes on classes.id = schedule.class_id
            left join bookings on bookings.schedule_id = schedule.id
            group by schedule.id, classes.capacity
          ) occupancy
        ) as avg_occupancy_percent
    `)

    return {
      users: {
        total: Number(summary.total_users),
        trainers: Number(summary.total_trainers),
        clients: Number(summary.total_clients)
      },
      revenue: {
        total: Number(summary.total_revenue ?? 0)
      },
      bookings: {
        total: Number(summary.total_bookings),
        active: Number(summary.active_bookings),
        attended: Number(summary.attended_bookings),
        missed: Number(summary.missed_bookings),
        canceled: Number(summary.canceled_bookings)
      },
      occupancy: {
        averagePercent: Number(summary.avg_occupancy_percent ?? 0)
      }
    }
  }
}
