import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(
    @CurrentUser() user,
    @Body(ValidationPipe) createGroupDto: CreateGroupDto,
  ) {
    return this.groupsService.create(user.userId, createGroupDto);
  }

  @Get()
  async findAll(@CurrentUser() user) {
    return this.groupsService.findAllByUser(user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    const group = await this.groupsService.findOne(id, user.userId);

    if (!group) {
      throw new NotFoundException('Group not found or you are not a member');
    }

    return group;
  }
}
