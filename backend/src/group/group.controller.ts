import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  createGroup(@Request() req: any, @Body() createGroupDto: CreateGroupDto) {
    return this.groupService.createGroup(req.user.sub, createGroupDto);
  }

  @Get()
  getUserGroups(@Request() req: any) {
    return this.groupService.getUserGroups(req.user.sub);
  }

  @Get(':id')
  getGroupById(@Param('id') id: string, @Request() req: any) {
    return this.groupService.getGroupById(id, req.user.sub);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req: any,
  ) {
    return this.groupService.addMember(id, addMemberDto, req.user.sub);
  }
}
