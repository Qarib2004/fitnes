import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator'

export class CreateClassDto {
  @IsString()
  @MinLength(2)
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsInt()
  @Min(1)
  capacity!: number
}
