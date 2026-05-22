import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserRoleDto } from './dto/update-user-role.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { UsersService } from './users.service'

@Controller()
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('trainers')
  listTrainers() {
    return this.usersService.listTrainers()
  }

  @Post('admin/users')
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Get('admin/users')
  @Roles('admin')
  list() {
    return this.usersService.list()
  }

  @Patch('admin/users/:id/role')
  @Roles('admin')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto)
  }

  @Patch('admin/users/:id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto)
  }
}
