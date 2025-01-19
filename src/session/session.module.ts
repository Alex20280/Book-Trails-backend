import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { Session } from './entities/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  providers: [SessionService],
})
export class SessionModule {}
