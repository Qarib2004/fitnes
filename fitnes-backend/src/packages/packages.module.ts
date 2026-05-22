import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { PackagesController } from './packages.controller'
import { PackagesService } from './packages.service'

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [PackagesController],
  providers: [PackagesService]
})
export class PackagesModule {}
