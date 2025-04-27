import { PartialType } from '@nestjs/swagger';
import { CreateNonStopReadingDto } from './create-non-stop-reading.dto';

export class UpdateNonStopReadingDto extends PartialType(CreateNonStopReadingDto) {}
