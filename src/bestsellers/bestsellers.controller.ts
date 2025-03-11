import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { BestsellersService } from './bestsellers.service';

import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';

import { ApiCustomResponse } from '@/common/helpers/api-custom-response';
import * as responses from '../responses.json';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('bestsellers')
export class BestsellersController {
  constructor(private readonly bestsellersService: BestsellersService) {}

  @Get()
  @ApiOperation({
    summary: 'get bestsellers and categories',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.bestsellers)
  findAll() {
    return this.bestsellersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'get one bestseller',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.bestseller)
  async findOne(@Param('id') id: number) {
    return this.bestsellersService.findOne(id);
  }
}
