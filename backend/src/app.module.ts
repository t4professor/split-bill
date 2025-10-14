import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    PrismaModule,
    AuthModule,
    UserModule,
    GroupModule,

  ],
})
export class AppModule {}
