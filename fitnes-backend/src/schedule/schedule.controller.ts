import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateClassDto } from './dto/create-class.dto'
import { CreateRoomDto } from './dto/create-room.dto'
import { CreateScheduleSlotDto } from './dto/create-schedule-slot.dto'
import { ScheduleQueryDto } from './dto/schedule-query.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { UpdateRoomDto } from './dto/update-room.dto'
import { UpdateScheduleSlotDto } from './dto/update-schedule-slot.dto'
import { ScheduleService } from './schedule.service'

@Controller()
@UseGuards(AuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('classes')
  listClasses() {
    return this.scheduleService.listClasses()
  }

  @Get('rooms')
  listRooms() {
    return this.scheduleService.listRooms()
  }

  @Get('schedule')
  list(@Query() query: ScheduleQueryDto) {
    return this.scheduleService.list(query)
  }

  @Post('admin/classes')
  @Roles('admin')
  createClass(@Body() dto: CreateClassDto) {
    return this.scheduleService.createClass(dto)
  }

  @Patch('admin/classes/:id')
  @Roles('admin')
  updateClass(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.scheduleService.updateClass(id, dto)
  }

  @Delete('admin/classes/:id')
  @Roles('admin')
  deleteClass(@Param('id') id: string) {
    return this.scheduleService.deleteClass(id)
  }

  @Post('admin/rooms')
  @Roles('admin')
  createRoom(@Body() dto: CreateRoomDto) {
    return this.scheduleService.createRoom(dto)
  }

  @Patch('admin/rooms/:id')
  @Roles('admin')
  updateRoom(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.scheduleService.updateRoom(id, dto)
  }

  @Delete('admin/rooms/:id')
  @Roles('admin')
  deleteRoom(@Param('id') id: string) {
    return this.scheduleService.deleteRoom(id)
  }

  @Post('admin/schedule')
  @Roles('admin')
  createSlot(@Body() dto: CreateScheduleSlotDto) {
    return this.scheduleService.createSlot(dto)
  }

  @Patch('admin/schedule/:id')
  @Roles('admin')
  updateSlot(@Param('id') id: string, @Body() dto: UpdateScheduleSlotDto) {
    return this.scheduleService.updateSlot(id, dto)
  }

  @Delete('admin/schedule/:id')
  @Roles('admin')
  deleteSlot(@Param('id') id: string) {
    return this.scheduleService.deleteSlot(id)
  }
}
