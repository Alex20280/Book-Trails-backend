import { PartialType } from '@nestjs/swagger';
import { CreatePauseDto } from './create-pause.dto';

export class UpdatePauseDto extends PartialType(CreatePauseDto) {}
