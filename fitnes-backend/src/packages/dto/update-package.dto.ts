import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength
} from 'class-validator'

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  lessonsCount?: number

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  validityDays?: number
}
