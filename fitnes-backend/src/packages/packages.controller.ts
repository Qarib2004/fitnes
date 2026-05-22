import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { AssignPackageDto } from './dto/assign-package.dto'
import { CreatePackageDto } from './dto/create-package.dto'
import { UpdatePackageDto } from './dto/update-package.dto'
import { PackagesService } from './packages.service'

@Controller()
@UseGuards(AuthGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get('packages')
  list() {
    return this.packagesService.list()
  }

  @Post('admin/packages')
  @Roles('admin')
  create(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto)
  }

  @Post('admin/client-packages')
  @Roles('admin')
  assign(@Body() dto: AssignPackageDto) {
    return this.packagesService.assign(dto)
  }

  @Patch('admin/packages/:id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packagesService.update(id, dto)
  }

  @Delete('admin/packages/:id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.packagesService.delete(id)
  }
}
