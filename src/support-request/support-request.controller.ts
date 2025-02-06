import { Controller, Post, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { SupportRequestService } from './support-request.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { User } from '@/user/entities/user.entity';

import * as responses from '../responses.json';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';

@Controller('support-request')
@ApiTags('SupportRequest')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SupportRequestController {
  constructor(private readonly supportRequestService: SupportRequestService) {}

  @Post()
  @ApiOperation({
    summary: 'send message to the developers',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.message)
  async create(
    @UserDecorator() user: User,
    @Body() payload: CreateSupportRequestDto,
  ): Promise<{ message: string }> {
    return await this.supportRequestService.create(
      user.id,
      user.email,
      payload,
    );
  }
}
