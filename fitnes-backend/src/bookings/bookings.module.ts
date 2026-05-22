import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { BookingsMaintenanceService } from './bookings-maintenance.service'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsMaintenanceService]
})
export class BookingsModule {}
