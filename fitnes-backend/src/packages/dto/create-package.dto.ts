import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator'

export class CreatePackageDto {
  @IsString()
  @MinLength(2)
  title!: string

  @IsInt()
  @Min(1)
  lessonsCount!: number

  @IsNumber()
  @Min(0.01)
  price!: number

  @IsInt()
  @Min(1)
  validityDays!: number
}
