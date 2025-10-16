import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
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
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({ status: 201, description: 'Group created', type: Object })
  createGroup(@Request() req: any, @Body() createGroupDto: CreateGroupDto) {
    return this.groupService.createGroup(req.user.sub, createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups for current user' })
  @ApiResponse({ status: 200, description: 'List of groups', type: Object, isArray: true })
  getUserGroups(@Request() req: any) {
    return this.groupService.getUserGroups(req.user.sub);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a group using invite code (body)' })
  joinGroup(@Request() req: any, @Body() joinGroupDto: JoinGroupDto) {
    return this.groupService.joinGroupByInviteCode(joinGroupDto.inviteCode, req.user.sub);
  }

  @Get('join/:inviteCode')
  @ApiOperation({ summary: 'Join a group using invite link (URL)' })
  joinGroupByLink(
    @Param('inviteCode') inviteCode: string,
    @Request() req: any)
    {
    return this.groupService.joinGroupByInviteCode(inviteCode, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group details by ID' })
  @ApiResponse({ status: 200, description: 'Group details', type: Object })
  getGroupById(@Param('id') id: string, @Request() req: any) {
    return this.groupService.getGroupById(id, req.user.sub);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to group' })
  @ApiBody({ type: AddMemberDto })
  @ApiResponse({ status: 201, description: 'Member added', type: Object })
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req: any,
  ) {
    return this.groupService.addMember(id, addMemberDto, req.user.sub);
  }

  @Get(':id/expenses')
  @ApiOperation({ summary: 'Get all expenses in a group' })
  @ApiResponse({ status: 200, description: 'List of expenses', type: Object, isArray: true })
  getGroupExpenses(@Param('id') id: string, @Request() req: any) {
    return this.expenseService.getGroupExpenses(id, req.user.sub);
  }

  @Get(':id/settlement')
  @ApiOperation({ summary: 'Calculate settlement for a group' })
  @ApiResponse({ status: 200, description: 'Settlement details', type: Object })
  getSettlement(@Param('id') id: string, @Request() req: any) {
    return this.groupService.calculateSettlement(id, req.user.sub);
  }
}
