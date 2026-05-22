import { IsInt, IsString, Min, MinLength } from 'class-validator'

export class CreateRoomDto {
  @IsString()
  @MinLength(2)
  title!: string

  @IsInt()
  @Min(1)
  capacity!: number
}
