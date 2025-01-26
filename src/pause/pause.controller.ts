import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PauseService } from './pause.service';
import { CreatePauseDto } from './dto/create-pause.dto';
import { UpdatePauseDto } from './dto/update-pause.dto';

@Controller('pause')
export class PauseController {
  constructor(private readonly pauseService: PauseService) {}

  @Post()
  create(@Body() createPauseDto: CreatePauseDto) {
    return this.pauseService.create(createPauseDto);
  }

  @Get()
  findAll() {
    return this.pauseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pauseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePauseDto: UpdatePauseDto) {
    return this.pauseService.update(+id, updatePauseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pauseService.remove(+id);
  }
}
