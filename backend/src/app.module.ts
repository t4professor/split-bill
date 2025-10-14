import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { ExpenseModule } from './expense/expense.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    PrismaModule,
    AuthModule,
    UserModule,
    GroupModule,
    ExpenseModule,
  ],
})
export class AppModule {}
