import { FinishBookDto } from '@/book-session/dto/finish-book.dto';
import { UpdateBookSessionDto } from '@/book-session/dto/update-book-session.dto';
import { ReadingPlace } from '@/common/enums/book.enum';
export interface CreateBookSession {
  userId: number;
  bookId: number;
  readingPlace: ReadingPlace;
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
