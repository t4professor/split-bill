import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [PrismaModule, AuthModule, GroupsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
