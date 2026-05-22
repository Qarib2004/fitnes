import { IsDateString, IsOptional, IsUUID } from 'class-validator'

export class CreateScheduleSlotDto {
  @IsUUID()
  classId!: string

  @IsUUID()
  trainerId!: string

  @IsOptional()
  @IsUUID()
  roomId?: string | null

  @IsDateString()
  startsAt!: string

  @IsDateString()
  endsAt!: string
}
