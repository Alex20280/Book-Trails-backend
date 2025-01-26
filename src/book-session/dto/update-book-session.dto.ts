import { PartialType } from '@nestjs/swagger';
import { CreateBookSessionDto } from './create-book-session.dto';

export class UpdateBookSessionDto extends PartialType(CreateBookSessionDto) {}
