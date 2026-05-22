import { IsEmail, IsEnum, IsString, IsUUID, MinLength } from 'class-validator'
import { userRoleEnum } from '../../database/schema'
import type { UserRole } from '../../database/schema'

export class CreateUserDto {
  @IsUUID()
  id!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(2)
  name!: string

  @IsEnum(userRoleEnum.enumValues)
  role!: UserRole
}
