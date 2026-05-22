import { IsDateString, IsOptional, IsUUID } from 'class-validator'

export class UpdateScheduleSlotDto {
  @IsOptional()
  @IsUUID()
  classId?: string

  @IsOptional()
  @IsUUID()
  trainerId?: string

  @IsOptional()
  @IsUUID()
  roomId?: string | null

  @IsOptional()
  @IsDateString()
  startsAt?: string

  @IsOptional()
  @IsDateString()
  endsAt?: string
}
