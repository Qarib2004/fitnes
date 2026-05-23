import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { ScheduleController } from './schedule.controller'
import { ScheduleService } from './schedule.service'
import { TrainerScheduleController } from './trainer-schedule.controller'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ScheduleController, TrainerScheduleController],
  providers: [ScheduleService]
})
export class ScheduleModule {}
