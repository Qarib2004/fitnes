import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { ScheduleQueryDto } from './dto/schedule-query.dto'
import { ScheduleService } from './schedule.service'
import type { RequestWithUser } from '../auth/auth.types'

@Controller('trainer')
@UseGuards(AuthGuard)
@Roles('trainer', 'admin')
export class TrainerScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('schedule')
  listMySchedule(
    @Req() request: RequestWithUser,
    @Query() query: ScheduleQueryDto
  ) {
    return this.scheduleService.listTrainerSchedule(request.user, query)
  }

  @Get('schedule/:id/bookings')
  listSlotBookings(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.scheduleService.listTrainerSlotBookings(request.user, id)
  }
}
