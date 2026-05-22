import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'
import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { BookingsModule } from './bookings/bookings.module'
import { DatabaseModule } from './database/database.module'
import { PackagesModule } from './packages/packages.module'
import { ScheduleModule } from './schedule/schedule.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NestScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PackagesModule,
    ScheduleModule,
    BookingsModule,
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
