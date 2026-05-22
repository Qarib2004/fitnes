import { IsEmail, IsString, MinLength } from 'class-validator'

export class BootstrapAdminDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsString()
  @MinLength(2)
  name!: string

  @IsString()
  @MinLength(12)
  secret!: string
}
