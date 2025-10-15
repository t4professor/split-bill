import { ApiProperty } from '@nestjs/swagger';

export class MemberBalance {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User name' })
  userName: string;

  @ApiProperty({ description: 'Total amount paid by this user' })
  totalPaid: number;

  @ApiProperty({ description: 'Fair share amount (total expenses / number of members)' })
  fairShare: number;

  @ApiProperty({ description: 'Balance (positive = owed money, negative = owes money)' })
  balance: number;
}

export class Transaction {
  @ApiProperty({ description: 'User ID who should pay' })
  fromUserId: string;

  @ApiProperty({ description: 'User name who should pay' })
  fromUserName: string;

  @ApiProperty({ description: 'User ID who should receive' })
  toUserId: string;

  @ApiProperty({ description: 'User name who should receive' })
  toUserName: string;

  @ApiProperty({ description: 'Amount to transfer' })
  amount: number;
}

export class SettlementResponse {
  @ApiProperty({ description: 'Total expenses in the group' })
  totalExpenses: number;

  @ApiProperty({ description: 'Number of members in the group' })
  memberCount: number;

  @ApiProperty({ description: 'Fair share per person' })
  fairSharePerPerson: number;

  @ApiProperty({ description: 'Balance details for each member', type: [MemberBalance] })
  balances: MemberBalance[];

  @ApiProperty({ description: 'Minimum transactions needed to settle all debts', type: [Transaction] })
  transactions: Transaction[];
}
