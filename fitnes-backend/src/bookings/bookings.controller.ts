import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { BookingsService } from './bookings.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { MarkAttendanceDto } from './dto/mark-attendance.dto'
import type { RequestWithUser } from '../auth/auth.types'

@Controller()
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('profile')
  getProfile(@Req() request: RequestWithUser) {
    return this.bookingsService.getProfile(request.user)
  }

  @Post('bookings')
  create(@Req() request: RequestWithUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(request.user, dto)
  }

  @Patch('bookings/:id/cancel')
  cancel(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.bookingsService.cancel(request.user, id)
  }

  @Patch('bookings/:id/attendance')
  @Roles('trainer', 'admin')
  markAttendance(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: MarkAttendanceDto
  ) {
    return this.bookingsService.markAttendance(request.user, id, dto)
  }
}
