import { IsDateString, IsOptional, IsUUID } from 'class-validator'

export class ScheduleQueryDto {
  @IsDateString()
  weekStart!: string

  @IsOptional()
  @IsUUID()
  trainerId?: string

  @IsOptional()
  @IsUUID()
  classId?: string
}
