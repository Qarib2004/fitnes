import { IsUUID } from 'class-validator'

export class AssignPackageDto {
  @IsUUID()
  userId!: string

  @IsUUID()
  packageId!: string
}
