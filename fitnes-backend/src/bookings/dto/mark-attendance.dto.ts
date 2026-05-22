import { IsIn } from 'class-validator'
import type { BookingStatus } from '../../database/schema'

export class MarkAttendanceDto {
  @IsIn(['attended', 'missed'])
  status!: Extract<BookingStatus, 'attended' | 'missed'>
}
