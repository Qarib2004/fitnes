import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { AdminDashboardService } from './admin-dashboard.service'

@Controller('admin/dashboard')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  getDashboard() {
    return this.adminDashboardService.getDashboard()
  }
}
