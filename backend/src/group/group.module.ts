import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  imports: [ExpenseModule],
  providers: [GroupService],
  controllers: [GroupController]
})
export class GroupModule {}
