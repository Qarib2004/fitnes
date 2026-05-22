import { IsEnum } from 'class-validator'
import { userRoleEnum } from '../../database/schema'
import type { UserRole } from '../../database/schema'

export class UpdateUserRoleDto {
  @IsEnum(userRoleEnum.enumValues)
  role!: UserRole
}
