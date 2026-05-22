import { Module } from '@nestjs/common'
import { db } from './index'

export const DB = Symbol('DB')

@Module({
  providers: [
    {
      provide: DB,
      useValue: db
    }
  ],
  exports: [DB]
})
export class DatabaseModule {}
