import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpenseService } from '../expense/expense.service';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly expenseService: ExpenseService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  createGroup(@Request() req: any, @Body() createGroupDto: CreateGroupDto) {
    return this.groupService.createGroup(req.user.sub, createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups for current user' })
  getUserGroups(@Request() req: any) {
    return this.groupService.getUserGroups(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group details by ID' })
  getGroupById(@Param('id') id: string, @Request() req: any) {
    return this.groupService.getGroupById(id, req.user.sub);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to group' })
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req: any,
  ) {
    return this.groupService.addMember(id, addMemberDto, req.user.sub);
  }

  @Get(':id/expenses')
  @ApiOperation({ summary: 'Get all expenses in a group' })
  getGroupExpenses(@Param('id') id: string, @Request() req: any) {
    return this.expenseService.getGroupExpenses(id, req.user.sub);
  }

  @Get(':id/settlement')
  @ApiOperation({ summary: 'Calculate settlement for a group' })
  getSettlement(@Param('id') id: string, @Request() req: any) {
    return this.groupService.calculateSettlement(id, req.user.sub);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a group using invite code' })
  joinGroup(@Request() req: any, @Body() joinGroupDto: JoinGroupDto) {
    return this.groupService.joinGroupByInviteCode(joinGroupDto.inviteCode, req.user.sub);
  }
}
