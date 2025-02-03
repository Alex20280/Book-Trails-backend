import { CreateBookSessionDto } from '@/book-session/dto/create-book-session.dto';
import { FinishBookDto } from '@/book-session/dto/finish-book.dto';
import { UpdateBookSessionDto } from '@/book-session/dto/update-book-session.dto';
export interface CreateBookSession {
  userId: number;
  bookId: number;
  createDto: CreateBookSessionDto;
}

export interface IncomingParams {
  userId: number;
  bookId: number;
  bookSessionId: number;
}

export interface UpdateBookSession extends IncomingParams {
  updateDto: UpdateBookSessionDto;
}

export interface CreateSessionPause extends IncomingParams {}

export interface EndSessionPause extends IncomingParams {
  pauseId: number;
}

export interface FinishBook extends IncomingParams {
  finishDto: FinishBookDto;
}
