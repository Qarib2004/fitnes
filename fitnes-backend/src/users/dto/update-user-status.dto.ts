import { IsEnum } from 'class-validator'
import { userStatusEnum } from '../../database/schema'
import type { UserStatus } from '../../database/schema'

export class UpdateUserStatusDto {
  @IsEnum(userStatusEnum.enumValues)
  status!: UserStatus
}
